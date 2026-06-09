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
const MAX_AUTO_CONSULT_RESULTS = 8;

const SEARCH_STOP_WORDS = new Set([
  "o",
  "a",
  "os",
  "as",
  "de",
  "do",
  "da",
  "dos",
  "das",
  "em",
  "no",
  "na",
  "nos",
  "nas",
  "um",
  "uma",
  "uns",
  "umas",
  "e",
  "ou",
  "que",
  "com",
  "por",
  "para",
  "se",
  "eu",
  "tu",
  "ele",
  "ela",
  "nos",
  "vos",
  "me",
  "te",
  "lhe",
  "the",
  "is",
  "are",
  "was",
  "were",
  "i",
  "you",
  "he",
  "she",
  "it",
  "they",
  "we",
  "my",
  "your",
  "his",
  "her",
  "qual",
  "quem",
  "onde",
  "como",
  "quando",
  "porque",
  "muito",
  "pouco",
  "mais",
  "menos",
  "bem",
  "mal",
  "sim",
  "nao",
  "tem",
  "tinha",
  "ser",
  "esta",
  "estou",
  "estas",
  "fui",
  "foi",
  "sao"
]);

const AUTO_CONSULT_EXCLUDED_SKILL_IDS = new Set(["ultima_acao"]);

const FOLDER_TOPIC_KEYWORDS: Record<string, string[]> = {
  personagens: [
    "personagem",
    "personagens",
    "npc",
    "protagonista",
    "heroi",
    "heroina",
    "nome",
    "idade",
    "anos"
  ],
  locais: ["local", "locais", "lugar", "lugares", "cidade", "sala", "zona", "onde"]
};

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
        required: ["query"]
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
        required: ["title", "description", "content"]
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

function extractSearchTokens(query: string) {
  return normalizeSearchText(query)
    .split(/[^a-z0-9]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 0 && !SEARCH_STOP_WORDS.has(token))
    .filter((token) => token.length >= 2);
}

type SearchSkillsOptions = {
  maxResults?: number;
  includeContent?: boolean;
  folders?: SkillFolder[];
};

function scoreSkillMatch(
  skill: AdventureSkill,
  tokens: string[],
  folders: SkillFolder[],
  includeContent: boolean
) {
  const folderName =
    skill.folderId && folders.length > 0
      ? normalizeSearchText(
          folders.find((folder) => folder.id === skill.folderId)?.name ?? ""
        )
      : "";

  const id = normalizeSearchText(skill.id);
  const title = normalizeSearchText(skill.title);
  const description = normalizeSearchText(skill.description);
  const content = includeContent ? normalizeSearchText(skill.content) : "";
  const haystack = `${id} ${title} ${description} ${content} ${folderName}`;

  return tokens.reduce((total, token) => {
    let next = total;

    if (id.includes(token)) {
      next += 4;
    }

    if (title.includes(token)) {
      next += 3;
    }

    if (description.includes(token)) {
      next += 2;
    }

    if (folderName.includes(token)) {
      next += 2;
    }

    if (content.includes(token)) {
      next += 1;
    }

    if (haystack.includes(token)) {
      next += 1;
    }

    return next;
  }, 0);
}

export function searchSkills(
  skills: AdventureSkill[],
  query: string,
  options: SearchSkillsOptions = {}
): AdventureSkill[] {
  const {
    maxResults = MAX_SEARCH_RESULTS,
    includeContent = true,
    folders = []
  } = options;
  const tokens = extractSearchTokens(query);

  if (tokens.length === 0) {
    return [];
  }

  return skills
    .map((skill) => ({
      skill,
      score: scoreSkillMatch(skill, tokens, folders, includeContent)
    }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, maxResults)
    .map(({ skill }) => skill);
}

function isAutoConsultCandidate(skill: AdventureSkill) {
  return !AUTO_CONSULT_EXCLUDED_SKILL_IDS.has(skill.id);
}

function filterAutoConsultCandidates(skills: AdventureSkill[]) {
  return skills.filter(isAutoConsultCandidate);
}

function appendUniqueSkills(
  results: AdventureSkill[],
  seen: Set<string>,
  candidates: AdventureSkill[],
  maxResults: number
) {
  for (const skill of candidates) {
    if (!isAutoConsultCandidate(skill) || seen.has(skill.id) || results.length >= maxResults) {
      continue;
    }

    seen.add(skill.id);
    results.push(skill);
  }
}

function findExplicitlyMentionedSkills(skills: AdventureSkill[], text: string) {
  const haystack = ` ${normalizeSearchText(text)} `;

  return filterAutoConsultCandidates(skills).filter((skill) => {
    const id = normalizeSearchText(skill.id);
    const title = normalizeSearchText(skill.title);
    const idSpaced = id.replace(/_/g, " ");

    return (
      haystack.includes(` ${id} `) ||
      haystack.includes(` ${idSpaced} `) ||
      haystack.includes(` ${title} `)
    );
  });
}

export function autoConsultSkillsForTurn(
  skills: AdventureSkill[],
  folders: SkillFolder[],
  message: string,
  recentContext = ""
): AdventureSkill[] {
  const candidates = filterAutoConsultCandidates(skills);

  if (candidates.length === 0) {
    return [];
  }

  const seen = new Set<string>();
  const results: AdventureSkill[] = [];
  const combinedText = `${message} ${recentContext}`.trim();

  appendUniqueSkills(
    results,
    seen,
    findExplicitlyMentionedSkills(candidates, combinedText),
    MAX_AUTO_CONSULT_RESULTS
  );

  const queries = [message.trim(), recentContext.trim()].filter((query) => query.length > 0);

  for (const query of queries) {
    appendUniqueSkills(
      results,
      seen,
      searchSkills(candidates, query, {
        folders,
        maxResults: MAX_AUTO_CONSULT_RESULTS,
        includeContent: true
      }),
      MAX_AUTO_CONSULT_RESULTS
    );
  }

  const combined = normalizeSearchText(combinedText);

  for (const [folderId, keywords] of Object.entries(FOLDER_TOPIC_KEYWORDS)) {
    if (!keywords.some((keyword) => combined.includes(keyword))) {
      continue;
    }

    appendUniqueSkills(
      results,
      seen,
      candidates.filter((skill) => skill.folderId === folderId),
      MAX_AUTO_CONSULT_RESULTS
    );
  }

  return results;
}

export function buildPlayerMessageWithSkillContext(
  message: string,
  _consultedSkills: AdventureSkill[] = []
) {
  return message;
}

function formatSkillFactsForPrompt(skills: AdventureSkill[]): string {
  return skills
    .map((skill) => `- ${skill.title}: ${skill.content.replace(/\n+/g, "; ")}`)
    .join("\n");
}

export function formatConsultedSkillsForPrompt(skills: AdventureSkill[]): string {
  if (skills.length === 0) {
    return "";
  }

  return [
    "# FACTOS RELEVANTES (uso interno — nunca incluir na resposta)",
    formatSkillFactsForPrompt(skills)
  ].join("\n");
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

export function executeConsultSkill(
  skills: AdventureSkill[],
  args: unknown,
  folders: SkillFolder[] = []
) {
  const query =
    args && typeof args === "object" && "query" in args && typeof args.query === "string"
      ? args.query.trim()
      : "";

  if (!query) {
    return "Consulta vazia. Indica titulo, personagem ou tema a pesquisar.";
  }

  return formatSkillSearchResults(
    searchSkills(skills, query, { folders, includeContent: true })
  );
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

const DEFAULT_TEMPLATE_FOLDERS: SkillFolder[] = [
  { id: "personagens", name: "Personagens", parentId: null },
  { id: "locais", name: "Locais", parentId: null }
];

const DEFAULT_TEMPLATE_SKILLS: AdventureSkill[] = [
  {
    id: "protagonista",
    folderId: "personagens",
    title: "Protagonista",
    description: "Personagem principal controlado pelo jogador",
    content: [
      "Nome: Jack",
      "Idade: 16 anos",
      "Género: Masculino",
      "",
      "Contexto de vida:",
      "Jack vive numa cidade urbana comum, num ambiente relativamente estável, embora marcado por uma perda significativa na infância: a morte do pai.",
      "Desde então, cresceu apenas com a mãe, desenvolvendo um forte vínculo emocional com ela.",
      "",
      "Personalidade:",
      "Introvertido, observador e reflexivo. Prefere ambientes calmos e evita grandes multidões.",
      "Tem uma imaginação activa e tendência para pensar demasiado sobre tudo o que o rodeia.",
      "Apesar da sua natureza reservada, é empático e sensível às emoções dos outros.",
      "Tende a notar pequenos detalhes que os outros ignoram",
      "",
      "Interesses:",
      "Música (principal escape emocional)",
      "Jogos de computador",
      "Histórias de mistério e ficção científica",
      "",
      "Relações:",
      "Relação muito próxima com a mãe, sendo a única família directa",
      "Poucos amigos na escola, mas não é completamente isolado",
      "",
      "Trauma/Histórico emocional:",
      "O pai morreu de cancro ainda criança, o que o tornou mais maduro emocionalmente."
    ].join("\n"),
    source: "externo"
  },
  {
    id: "local_atual",
    folderId: "locais",
    title: "Local atual",
    description: "Onde a cena se passa neste momento",
    content: [
      "Nome do local:",
      "Atmosfera:",
      "Detalhes sensoriais:",
      "Perigos ou pistas:"
    ].join("\n"),
    source: "externo"
  }
];

export function mergeDefaultSkillTemplates(
  skills: AdventureSkill[],
  folders: SkillFolder[]
): { skills: AdventureSkill[]; folders: SkillFolder[] } {
  const folderIds = new Set(folders.map((folder) => folder.id));
  const skillIds = new Set(skills.map((skill) => skill.id));
  const mergedFolders = [...folders];
  const mergedSkills = [...skills];

  for (const folder of DEFAULT_TEMPLATE_FOLDERS) {
    if (!folderIds.has(folder.id)) {
      mergedFolders.push(folder);
    }
  }

  for (const skill of DEFAULT_TEMPLATE_SKILLS) {
    if (!skillIds.has(skill.id)) {
      mergedSkills.push(skill);
    }
  }

  return { skills: mergedSkills, folders: mergedFolders };
}

function isSkillSource(value: unknown): value is SkillSource {
  return value === "jogador" || value === "externo" || value === "descoberta";
}
