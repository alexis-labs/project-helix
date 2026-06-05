import type OpenAI from "openai";

import type { AdventureSkill, SkillFolder, SkillSource } from "./types.ts";

const MAX_SKILLS = 80;
const MAX_FOLDERS = 40;
const MAX_ID_LENGTH = 64;
const MAX_TITLE_LENGTH = 80;
const MAX_DESCRIPTION_LENGTH = 240;
const MAX_CONTENT_LENGTH = 2000;
const MAX_FOLDER_NAME_LENGTH = 80;
const MAX_SEARCH_RESULTS = 5;

export const SKILL_TOOLS: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "consultar_skill",
      description:
        "Consulta skills/memorias da aventura por titulo ou descricao. Usa antes de responder sobre factos, personagens, locais ou lore.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description:
              "Termos de pesquisa (ex: nome de personagem, local, tema)."
          }
        },
        required: ["query"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "guardar_skill",
      description:
        "Cria ou atualiza uma skill/memoria da aventura quando descobres ou alteras informacao.",
      parameters: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "Identificador slug opcional. Se omitido, gera-se do titulo."
          },
          folderId: {
            type: "string",
            description: "ID da pasta onde guardar a skill (opcional)."
          },
          title: {
            type: "string",
            description: "Titulo curto da skill (ex: Maria)."
          },
          description: {
            type: "string",
            description: "Resumo para indice e pesquisa."
          },
          content: {
            type: "string",
            description: "Conhecimento completo da skill."
          }
        },
        required: ["title", "description", "content"],
        additionalProperties: false
      }
    }
  }
];

export function normalizeFolders(value: unknown): SkillFolder[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const seen = new Set<string>();

  return value
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const id = "id" in entry ? entry.id : undefined;
      const name = "name" in entry ? entry.name : undefined;
      const parentId = "parentId" in entry ? entry.parentId : undefined;

      if (typeof id !== "string" || typeof name !== "string") {
        return null;
      }

      if (parentId !== null && parentId !== undefined && typeof parentId !== "string") {
        return null;
      }

      const normalizedId = id.trim().slice(0, MAX_ID_LENGTH).toLowerCase();

      if (!normalizedId || seen.has(normalizedId)) {
        return null;
      }

      seen.add(normalizedId);

      return {
        id: normalizedId,
        name: name.trim().slice(0, MAX_FOLDER_NAME_LENGTH),
        parentId:
          typeof parentId === "string" ? parentId.trim().slice(0, MAX_ID_LENGTH) : null
      };
    })
    .filter((entry): entry is SkillFolder => entry !== null)
    .slice(0, MAX_FOLDERS);
}

export function normalizeSkills(value: unknown): AdventureSkill[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const seen = new Set<string>();

  return value
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const id = "id" in entry ? entry.id : undefined;
      const folderId = "folderId" in entry ? entry.folderId : undefined;
      const title = "title" in entry ? entry.title : undefined;
      const description = "description" in entry ? entry.description : undefined;
      const content = "content" in entry ? entry.content : undefined;
      const source = "source" in entry ? entry.source : undefined;

      if (
        typeof id !== "string" ||
        typeof title !== "string" ||
        typeof description !== "string" ||
        typeof content !== "string" ||
        !isSkillSource(source)
      ) {
        return null;
      }

      if (folderId !== null && folderId !== undefined && typeof folderId !== "string") {
        return null;
      }

      const normalizedId = id.trim().slice(0, MAX_ID_LENGTH).toLowerCase();

      if (!normalizedId) {
        return null;
      }

      if (seen.has(normalizedId)) {
        return null;
      }

      seen.add(normalizedId);

      return {
        id: normalizedId,
        folderId:
          typeof folderId === "string" ? folderId.trim().slice(0, MAX_ID_LENGTH) : null,
        title: title.trim().slice(0, MAX_TITLE_LENGTH),
        description: description.trim().slice(0, MAX_DESCRIPTION_LENGTH),
        content: content.trim().slice(0, MAX_CONTENT_LENGTH),
        source
      };
    })
    .filter((entry): entry is AdventureSkill => entry !== null)
    .slice(0, MAX_SKILLS);
}

function getFolderPath(folders: SkillFolder[], folderId: string): string[] {
  const byId = new Map(folders.map((folder) => [folder.id, folder]));
  const path: string[] = [];
  let current = byId.get(folderId) ?? null;

  while (current) {
    path.unshift(current.name);
    current = current.parentId ? byId.get(current.parentId) ?? null : null;
  }

  return path;
}

export function formatSkillsIndexForPrompt(
  skills: AdventureSkill[],
  folders: SkillFolder[] = []
): string {
  const header = [
    "# SKILLS DA AVENTURA",
    "Antes de responder sobre factos, personagens, locais ou lore, consulta as skills relevantes com a ferramenta consultar_skill.",
    "Quando descobrires ou alterares informacao, usa guardar_skill."
  ];

  if (skills.length === 0) {
    return [...header, "Indice: (vazio)"].join("\n");
  }

  const folderMap = new Map(folders.map((folder) => [folder.id, folder]));
  const groups = new Map<string, AdventureSkill[]>();
  const rootKey = "__root__";

  for (const skill of skills) {
    const key = skill.folderId && folderMap.has(skill.folderId) ? skill.folderId : rootKey;
    const bucket = groups.get(key) ?? [];
    bucket.push(skill);
    groups.set(key, bucket);
  }

  const lines: string[] = ["Indice:"];

  for (const [folderId, bucket] of groups) {
    if (folderId !== rootKey) {
      const folder = folderMap.get(folderId);
      const label = folder ? getFolderPath(folders, folderId).join(" / ") : folderId;
      lines.push(`[${label}]`);
    }

    for (const skill of bucket) {
      lines.push(`- ${skill.id}: ${skill.title} | ${skill.description}`);
    }
  }

  for (const folder of folders) {
    if (!groups.has(folder.id)) {
      lines.push(`[${getFolderPath(folders, folder.id).join(" / ")}]`);
      lines.push("- (vazio)");
    }
  }

  return [...header, ...lines].join("\n");
}

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function searchSkills(skills: AdventureSkill[], query: string): AdventureSkill[] {
  const tokens = normalizeSearchText(query)
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);

  if (tokens.length === 0) {
    return [];
  }

  return skills
    .map((skill) => {
      const title = normalizeSearchText(skill.title);
      const description = normalizeSearchText(skill.description);
      const id = normalizeSearchText(skill.id);

      const score = tokens.reduce((total, token) => {
        let next = total;

        if (id.includes(token)) {
          next += 3;
        }

        if (title.includes(token)) {
          next += 2;
        }

        if (description.includes(token)) {
          next += 1;
        }

        return next;
      }, 0);

      return { skill, score };
    })
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, MAX_SEARCH_RESULTS)
    .map(({ skill }) => skill);
}

export function formatSkillSearchResults(skills: AdventureSkill[]): string {
  if (skills.length === 0) {
    return "Nenhuma skill encontrada para esta consulta.";
  }

  return skills
    .map(
      (skill) =>
        [
          `ID: ${skill.id}`,
          `Titulo: ${skill.title}`,
          `Descricao: ${skill.description}`,
          `Conteudo: ${skill.content}`
        ].join("\n")
    )
    .join("\n\n---\n\n");
}

function toSkillId(value: string) {
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, MAX_ID_LENGTH);

  return normalized || "skill";
}

function createUniqueSkillId(skills: AdventureSkill[], baseId: string) {
  const existing = new Set(skills.map((skill) => skill.id));

  if (!existing.has(baseId)) {
    return baseId;
  }

  let index = 2;
  let nextId = `${baseId}_${index}`;

  while (existing.has(nextId)) {
    index += 1;
    nextId = `${baseId}_${index}`;
  }

  return nextId;
}

export type SaveSkillInput = {
  id?: string;
  folderId?: string | null;
  title: string;
  description: string;
  content: string;
  source?: SkillSource;
};

export function upsertSkill(
  skills: AdventureSkill[],
  input: SaveSkillInput,
  folders: SkillFolder[] = []
): { skills: AdventureSkill[]; skill: AdventureSkill } {
  const title = input.title.trim().slice(0, MAX_TITLE_LENGTH);
  const description = input.description.trim().slice(0, MAX_DESCRIPTION_LENGTH);
  const content = input.content.trim().slice(0, MAX_CONTENT_LENGTH);
  const source = input.source ?? "descoberta";
  const folderIds = new Set(folders.map((folder) => folder.id));
  const folderId =
    input.folderId && folderIds.has(input.folderId) ? input.folderId : null;

  if (!title || !description || !content) {
    throw new Error("Skill invalida: titulo, descricao e conteudo sao obrigatorios.");
  }

  const requestedId = input.id?.trim().toLowerCase().slice(0, MAX_ID_LENGTH);
  const id = requestedId || createUniqueSkillId(skills, toSkillId(title));
  const existingIndex = skills.findIndex((skill) => skill.id === id);
  const skill: AdventureSkill = {
    id,
    folderId: existingIndex >= 0 ? skills[existingIndex].folderId : folderId,
    title,
    description,
    content,
    source: existingIndex >= 0 ? skills[existingIndex].source : source
  };

  if (existingIndex >= 0) {
    const nextSkills = [...skills];
    nextSkills[existingIndex] = skill;
    return { skills: nextSkills, skill };
  }

  if (skills.length >= MAX_SKILLS) {
    throw new Error("Limite de skills atingido.");
  }

  return { skills: [...skills, skill], skill };
}

export function executeConsultSkill(skills: AdventureSkill[], args: unknown) {
  const query =
    args && typeof args === "object" && "query" in args && typeof args.query === "string"
      ? args.query.trim()
      : "";

  if (!query) {
    return "Consulta vazia. Indica titulo, personagem ou tema a pesquisar.";
  }

  return formatSkillSearchResults(searchSkills(skills, query));
}

export function executeSaveSkill(
  skills: AdventureSkill[],
  folders: SkillFolder[],
  args: unknown
): { skills: AdventureSkill[]; skill: AdventureSkill } {
  if (!args || typeof args !== "object") {
    throw new Error("Argumentos invalidos para guardar_skill.");
  }

  const title = "title" in args && typeof args.title === "string" ? args.title : "";
  const description =
    "description" in args && typeof args.description === "string"
      ? args.description
      : "";
  const content =
    "content" in args && typeof args.content === "string" ? args.content : "";
  const id = "id" in args && typeof args.id === "string" ? args.id : undefined;
  const folderId =
    "folderId" in args && typeof args.folderId === "string" ? args.folderId : null;

  return upsertSkill(skills, { id, folderId, title, description, content }, folders);
}

function isSkillSource(value: unknown): value is SkillSource {
  return value === "jogador" || value === "externo" || value === "descoberta";
}
