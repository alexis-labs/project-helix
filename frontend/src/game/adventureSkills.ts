import type {
  AdventureMemory,
  AdventureSkill,
  AdventureSkills,
  MemoryVariable,
  SkillFolder,
  SkillSource
} from "../types";

const TEMPLATE_SKILL_CONTENT =
  "Escreve aqui o conhecimento desta skill. O modelo consulta este texto atraves das ferramentas.";

export function createTemplateSkills(): AdventureSkills {
  const folders: AdventureSkills["folders"] = {
    personagens: {
      id: "personagens",
      name: "Personagens",
      parentId: null
    },
    locais: {
      id: "locais",
      name: "Locais",
      parentId: null
    }
  };

  const skills: AdventureSkill[] = [
    {
      id: "protagonista",
      folderId: "personagens",
      title: "Jack Walker",
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

  return {
    folders,
    skills: indexSkills(skills)
  };
}

export function createInitialSkills(): AdventureSkills {
  return createTemplateSkills();
}

export function ensureDefaultSkillLibrary(state: AdventureSkills): AdventureSkills {
  const migrated = migrateSkillsToV7(state);
  const template = createTemplateSkills();
  let next: AdventureSkills = {
    folders: { ...migrated.folders },
    skills: { ...migrated.skills }
  };

  for (const [id, folder] of Object.entries(template.folders)) {
    if (!next.folders[id]) {
      next = {
        ...next,
        folders: {
          ...next.folders,
          [id]: folder
        }
      };
    }
  }

  for (const [id, skill] of Object.entries(template.skills)) {
    if (!next.skills[id]) {
      next = upsertSkillInState(next, skill);
    }
  }

  return next;
}

export function indexSkills(
  skills: AdventureSkill[]
): Record<string, AdventureSkill> {
  return Object.fromEntries(skills.map((skill) => [skill.id, skill]));
}

export function listSkills(state: AdventureSkills): AdventureSkill[] {
  return Object.values(state.skills);
}

export function listFolders(state: AdventureSkills): SkillFolder[] {
  return Object.values(state.folders);
}

export function cloneSkills(state: AdventureSkills): AdventureSkills {
  return structuredClone(state);
}

export function normalizeSkillFolderId(value: unknown): string | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return typeof value === "string" ? value.trim().slice(0, 64) : null;
}

export function ensureSkillHasFolderId(skill: AdventureSkill): AdventureSkill {
  return {
    ...skill,
    folderId: normalizeSkillFolderId(skill.folderId)
  };
}

export function migrateSkillsToV7(state: AdventureSkills): AdventureSkills {
  const folders = state.folders ?? {};
  const skills = Object.fromEntries(
    Object.entries(state.skills ?? {}).map(([id, skill]) => [
      id,
      ensureSkillHasFolderId(skill)
    ])
  );

  return { folders, skills };
}

export function deleteSkillFromState(
  state: AdventureSkills,
  skillId: string
): AdventureSkills {
  if (!state.skills[skillId]) {
    return state;
  }

  const nextSkills = { ...state.skills };
  delete nextSkills[skillId];

  return { ...state, skills: nextSkills };
}

export function sortSkillsByTitle(state: AdventureSkills): AdventureSkill[] {
  return listSkills(state).sort((left, right) =>
    left.title.localeCompare(right.title, "pt")
  );
}

export function upsertSkillInState(
  state: AdventureSkills,
  skill: AdventureSkill
): AdventureSkills {
  const normalized = ensureSkillHasFolderId(skill);

  return {
    ...state,
    skills: {
      ...state.skills,
      [normalized.id]: normalized
    }
  };
}

export function finalizeSkillFields(skill: AdventureSkill): AdventureSkill {
  return {
    ...ensureSkillHasFolderId(skill),
    title: skill.title.trim().slice(0, 80),
    description: skill.description.trim().slice(0, 240),
    content: skill.content.trim().slice(0, 2000)
  };
}

export function finalizeSkillsState(state: AdventureSkills): AdventureSkills {
  return {
    folders: state.folders,
    skills: Object.fromEntries(
      Object.entries(state.skills).map(([id, skill]) => [
        id,
        finalizeSkillFields(skill)
      ])
    )
  };
}

export function mergeSkillUpdates(
  state: AdventureSkills,
  updates: AdventureSkill[]
): AdventureSkills {
  if (updates.length === 0) {
    return state;
  }

  let next = state;

  for (const skill of updates) {
    next = upsertSkillInState(next, skill);
  }

  return next;
}

function toSlug(value: string, maxLength = 48) {
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, maxLength);

  return normalized || "item";
}

function createUniqueSkillId(state: AdventureSkills, text: string) {
  const baseId = toSlug(text);

  if (!state.skills[baseId]) {
    return baseId;
  }

  let index = 2;
  let nextId = `${baseId}_${index}`;

  while (state.skills[nextId]) {
    index += 1;
    nextId = `${baseId}_${index}`;
  }

  return nextId;
}

function createUniqueFolderId(state: AdventureSkills, text: string) {
  const baseId = toSlug(text, 64);

  if (!state.folders[baseId]) {
    return baseId;
  }

  let index = 2;
  let nextId = `${baseId}_${index}`;

  while (state.folders[nextId]) {
    index += 1;
    nextId = `${baseId}_${index}`;
  }

  return nextId;
}

export function createFolder(
  state: AdventureSkills,
  name: string,
  parentId: string | null = null
): { state: AdventureSkills; folder: SkillFolder } | null {
  const trimmed = name.trim().slice(0, 80);

  if (!trimmed) {
    return null;
  }

  if (parentId && !state.folders[parentId]) {
    return null;
  }

  const folder: SkillFolder = {
    id: createUniqueFolderId(state, trimmed),
    name: trimmed,
    parentId
  };

  return {
    state: {
      ...state,
      folders: {
        ...state.folders,
        [folder.id]: folder
      }
    },
    folder
  };
}

export function renameFolder(
  state: AdventureSkills,
  folderId: string,
  name: string
): AdventureSkills {
  const folder = state.folders[folderId];
  const trimmed = name.trim().slice(0, 80);

  if (!folder || !trimmed) {
    return state;
  }

  return {
    ...state,
    folders: {
      ...state.folders,
      [folderId]: {
        ...folder,
        name: trimmed
      }
    }
  };
}

function collectDescendantFolderIds(
  state: AdventureSkills,
  folderId: string
): Set<string> {
  const descendants = new Set<string>([folderId]);

  for (const folder of listFolders(state)) {
    if (folder.parentId && descendants.has(folder.parentId)) {
      descendants.add(folder.id);
    }
  }

  let changed = true;

  while (changed) {
    changed = false;

    for (const folder of listFolders(state)) {
      if (folder.parentId && descendants.has(folder.parentId) && !descendants.has(folder.id)) {
        descendants.add(folder.id);
        changed = true;
      }
    }
  }

  return descendants;
}

export function deleteFolder(
  state: AdventureSkills,
  folderId: string
): AdventureSkills {
  const folder = state.folders[folderId];

  if (!folder) {
    return state;
  }

  const descendants = collectDescendantFolderIds(state, folderId);
  const nextFolders = { ...state.folders };

  for (const id of descendants) {
    delete nextFolders[id];
  }

  const nextSkills = { ...state.skills };

  for (const [skillId, skill] of Object.entries(nextSkills)) {
    if (skill.folderId && descendants.has(skill.folderId)) {
      nextSkills[skillId] = {
        ...skill,
        folderId: folder.parentId
      };
    }
  }

  return {
    folders: nextFolders,
    skills: nextSkills
  };
}

export function moveSkillToFolder(
  state: AdventureSkills,
  skillId: string,
  folderId: string | null
): AdventureSkills {
  const skill = state.skills[skillId];

  if (!skill) {
    return state;
  }

  if (folderId && !state.folders[folderId]) {
    return state;
  }

  return upsertSkillInState(state, {
    ...skill,
    folderId
  });
}

export function wouldCreateFolderCycle(
  state: AdventureSkills,
  folderId: string,
  nextParentId: string | null
): boolean {
  if (!nextParentId) {
    return false;
  }

  if (folderId === nextParentId) {
    return true;
  }

  const descendants = collectDescendantFolderIds(state, folderId);
  return descendants.has(nextParentId);
}

export function moveFolderToParent(
  state: AdventureSkills,
  folderId: string,
  parentId: string | null
): AdventureSkills {
  const folder = state.folders[folderId];

  if (!folder) {
    return state;
  }

  if (parentId && !state.folders[parentId]) {
    return state;
  }

  if (wouldCreateFolderCycle(state, folderId, parentId)) {
    return state;
  }

  return {
    ...state,
    folders: {
      ...state.folders,
      [folderId]: {
        ...folder,
        parentId
      }
    }
  };
}

export function createDraftSkill(
  state: AdventureSkills,
  folderId: string | null = null,
  input?: {
    title?: string;
    description?: string;
    content?: string;
  }
): AdventureSkill | null {
  const normalizedFolderId = normalizeSkillFolderId(folderId);

  if (normalizedFolderId && !state.folders[normalizedFolderId]) {
    return null;
  }

  const title = (input?.title ?? "Nova skill").trim().slice(0, 80);
  const description = (input?.description ?? "Descreve o tema desta skill").trim().slice(0, 240);
  const content = (input?.content ?? TEMPLATE_SKILL_CONTENT).trim().slice(0, 2000);

  if (!title) {
    return null;
  }

  return {
    id: createUniqueSkillId(state, title),
    folderId: normalizedFolderId,
    title,
    description: description || title,
    content: content || TEMPLATE_SKILL_CONTENT,
    source: "externo"
  };
}

export function createManualSkill(
  state: AdventureSkills,
  input: {
    title: string;
    description: string;
    content: string;
    folderId?: string | null;
  }
): AdventureSkill | null {
  return createDraftSkill(state, input.folderId ?? null, input);
}

export function createFolderWithName(
  state: AdventureSkills,
  name: string,
  parentId: string | null = null
): { state: AdventureSkills; folder: SkillFolder } | null {
  const trimmed = name.trim();

  if (!trimmed) {
    return null;
  }

  return createFolder(state, trimmed, parentId);
}

export function duplicateSkill(
  state: AdventureSkills,
  skillId: string
): { state: AdventureSkills; skill: AdventureSkill } | null {
  const source = state.skills[skillId];

  if (!source) {
    return null;
  }

  const skill: AdventureSkill = {
    ...source,
    id: createUniqueSkillId(state, `${source.title}_copia`),
    title: `${source.title} (copia)`.slice(0, 80),
    source: "externo"
  };

  return {
    state: upsertSkillInState(state, skill),
    skill
  };
}

export function recordPlayerActionSkill(
  state: AdventureSkills,
  action: string
): AdventureSkills {
  const trimmed = action.trim();

  if (!trimmed) {
    return state;
  }

  return upsertSkillInState(state, {
    id: "ultima_acao",
    folderId: state.skills.ultima_acao?.folderId ?? null,
    title: "Ultima acao",
    description: "Ultima acao escrita pelo jogador",
    content: trimmed.slice(0, 120),
    source: "jogador"
  });
}

export function formatSkillsForApi(state: AdventureSkills): AdventureSkill[] {
  return listSkills(state).map(ensureSkillHasFolderId);
}

export function formatFoldersForApi(state: AdventureSkills): SkillFolder[] {
  return listFolders(state);
}

function splitTitleAndContent(text: string) {
  const colonIndex = text.indexOf(":");

  if (colonIndex > 0 && colonIndex < 80) {
    const title = text.slice(0, colonIndex).trim();
    const content = text.slice(colonIndex + 1).trim();

    if (title && content) {
      return { title, content };
    }
  }

  const trimmed = text.trim();
  const title = trimmed.slice(0, 80);

  return {
    title,
    content: trimmed
  };
}

export function parseAdditionalMemoriesToSkills(
  text: string,
  source: SkillSource = "externo"
): AdventureSkill[] {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return [];
  }

  let state: AdventureSkills = { folders: {}, skills: {} };
  const parsed: AdventureSkill[] = [];

  for (const line of lines) {
    const cleaned = line.replace(/^[-*]\s*/, "").trim();

    if (!cleaned) {
      continue;
    }

    const { title, content } = splitTitleAndContent(cleaned);
    const description = content.slice(0, 240) || title;
    const id = createUniqueSkillId(state, title);
    const skill: AdventureSkill = {
      id,
      folderId: null,
      title,
      description,
      content: content.slice(0, 2000),
      source
    };

    state = upsertSkillInState(state, skill);
    parsed.push(skill);
  }

  return parsed;
}

export function migrateMemoryToSkills(memory: AdventureMemory): AdventureSkills {
  const skills = Object.values(memory.variables).map((variable) =>
    memoryVariableToSkill(variable)
  );

  return { folders: {}, skills: indexSkills(skills) };
}

function memoryVariableToSkill(variable: MemoryVariable): AdventureSkill {
  const title =
    variable.key === "ultima_acao"
      ? "Ultima acao"
      : variable.description.trim() || variable.key.replace(/_/g, " ");

  return {
    id: variable.key,
    folderId: null,
    title: title.slice(0, 80),
    description: variable.description.slice(0, 240) || title.slice(0, 240),
    content: variable.value.slice(0, 2000),
    source: variable.source
  };
}

export function mergeImportedSkills(
  state: AdventureSkills,
  imported: AdventureSkill[]
): AdventureSkills {
  let next = state;

  for (const skill of imported) {
    next = upsertSkillInState(next, skill);
  }

  return next;
}
