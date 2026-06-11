import {
  DEFAULT_ADVENTURE_SETTINGS,
  resolveOpenRouterModel
} from "../../../shared/adventureSettings";
import type { ActiveGameState } from "./initialState";
import {
  createInitialSkills,
  ensureDefaultSkillLibrary,
  mergeImportedSkills,
  migrateMemoryToSkills,
  migrateSkillsToV7,
  parseAdditionalMemoriesToSkills
} from "./adventureSkills";
import type {
  AdventureMemory,
  AdventureSettings,
  AdventureSkill,
  AdventureSkills,
  GameAttributes,
  GameStatus,
  MemoryVariable,
  SkillFolder,
  Turn
} from "../types";

const STORAGE_KEY = "blindfold-save";
const SAVE_VERSION = 7;

export type SavedGamePayload = {
  version: number;
  savedAt: string;
  currentReply: string;
  currentAction: string;
  history: Turn[];
  attributes: GameAttributes;
  status: GameStatus;
  skills?: AdventureSkills;
  memory?: AdventureMemory;
  adventureSettings?: AdventureSettings;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isTurn(value: unknown): value is Turn {
  if (!isRecord(value)) {
    return false;
  }

  const role = value.role;
  const content = value.content;

  if (
    (role !== "player" && role !== "narrator") ||
    typeof content !== "string" ||
    (value.contextContent !== undefined && typeof value.contextContent !== "string")
  ) {
    return false;
  }

  const changes = value.attributeChanges;

  if (changes === undefined) {
    return true;
  }

  if (!isRecord(changes)) {
    return false;
  }

  const numericKeys = ["fear", "injuries", "hunger", "exhaustion"] as const;

  return Object.entries(changes).every(
    ([key, delta]) =>
      numericKeys.includes(key as (typeof numericKeys)[number]) &&
      typeof delta === "number"
  );
}

function isAttributes(value: unknown): value is GameAttributes {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.fear === "number" &&
    typeof value.injuries === "number" &&
    typeof value.hunger === "number" &&
    typeof value.exhaustion === "number"
  );
}

function isStatus(value: unknown): value is GameStatus {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.location === "string" &&
    Array.isArray(value.inventory) &&
    value.inventory.every((item) => typeof item === "string")
  );
}

function isSkillSource(value: unknown): value is AdventureSkill["source"] {
  return value === "jogador" || value === "externo" || value === "descoberta";
}

function isSkillFolder(value: unknown): value is SkillFolder {
  if (!isRecord(value)) {
    return false;
  }

  const parentId = value.parentId;

  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    (parentId === null || parentId === undefined || typeof parentId === "string")
  );
}

function isSkill(value: unknown): value is AdventureSkill {
  if (!isRecord(value)) {
    return false;
  }

  const folderId = value.folderId;

  return (
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.description === "string" &&
    typeof value.content === "string" &&
    isSkillSource(value.source) &&
    (folderId === undefined ||
      folderId === null ||
      typeof folderId === "string")
  );
}

function isSkills(value: unknown): value is AdventureSkills {
  if (!isRecord(value) || !isRecord(value.skills)) {
    return false;
  }

  const folders = value.folders;

  if (
    folders !== undefined &&
    (!isRecord(folders) || !Object.values(folders).every(isSkillFolder))
  ) {
    return false;
  }

  return Object.values(value.skills).every(isSkill);
}

function isMemoryVariable(value: unknown): value is MemoryVariable {
  if (!isRecord(value)) {
    return false;
  }

  const source = value.source;

  return (
    typeof value.key === "string" &&
    typeof value.value === "string" &&
    typeof value.description === "string" &&
    isSkillSource(source)
  );
}

function isMemory(value: unknown): value is AdventureMemory {
  if (!isRecord(value) || !isRecord(value.variables)) {
    return false;
  }

  return Object.values(value.variables).every(isMemoryVariable);
}

function cloneDefaultAdventureSettings(): AdventureSettings {
  return structuredClone(DEFAULT_ADVENTURE_SETTINGS);
}

function normalizeText(value: unknown, fallback: string, maxLength = 8000) {
  return typeof value === "string" ? value.slice(0, maxLength) : fallback;
}

function normalizeNumber(
  value: unknown,
  fallback: number,
  min: number,
  max: number
) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, value));
}

function normalizeAdventureSettings(value: unknown): AdventureSettings {
  const defaults = cloneDefaultAdventureSettings();

  if (!isRecord(value)) {
    return defaults;
  }

  const appearance = isRecord(value.appearance) ? value.appearance : {};
  const llm = isRecord(value.llm) ? value.llm : {};

  return {
    prompt: normalizeText(value.prompt, defaults.prompt, 20_000),
    initialText: normalizeText(value.initialText, defaults.initialText, 12_000),
    additionalMemories: normalizeText(
      value.additionalMemories,
      defaults.additionalMemories,
      12_000
    ),
    skillsEnabled: value.skillsEnabled === false ? false : defaults.skillsEnabled,
    appearance: {
      theme: appearance.theme === "light" ? "light" : defaults.appearance.theme,
      ereaderTone: normalizeNumber(
        appearance.ereaderTone,
        defaults.appearance.ereaderTone,
        0,
        100
      ),
      fontScale: normalizeNumber(
        appearance.fontScale,
        defaults.appearance.fontScale,
        70,
        140
      ),
      lineHeight: normalizeNumber(
        appearance.lineHeight,
        defaults.appearance.lineHeight,
        140,
        220
      ),
      contentWidth: normalizeNumber(
        appearance.contentWidth,
        defaults.appearance.contentWidth,
        48,
        84
      ),
      typeface: appearance.typeface === "sans" ? "sans" : defaults.appearance.typeface,
      reducedMotion: appearance.reducedMotion === true
    },
    selectedModel: resolveOpenRouterModel(
      normalizeText(value.selectedModel, defaults.selectedModel, 120)
    ),
    llm: {
      temperature: normalizeNumber(
        llm.temperature,
        defaults.llm.temperature,
        0,
        2
      ),
      maxCompletionTokens: normalizeNumber(
        llm.maxCompletionTokens,
        defaults.llm.maxCompletionTokens,
        128,
        4096
      ),
      contextWindowTokens: normalizeNumber(
        llm.contextWindowTokens,
        defaults.llm.contextWindowTokens,
        4096,
        1_000_000
      )
    }
  };
}

function migrateLegacySave(
  saved: SavedGamePayload,
  adventureSettings: AdventureSettings
): { skills: AdventureSkills; adventureSettings: AdventureSettings } {
  let skills = saved.skills && isSkills(saved.skills)
    ? saved.skills
    : createInitialSkills();

  if (saved.memory && isMemory(saved.memory)) {
    skills = mergeImportedSkills(skills, Object.values(migrateMemoryToSkills(saved.memory).skills));
  }

  const imported = parseAdditionalMemoriesToSkills(
    adventureSettings.additionalMemories
  );

  if (imported.length > 0) {
    skills = mergeImportedSkills(skills, imported);
  }

  return {
    skills: ensureDefaultSkillLibrary(migrateSkillsToV7(skills)),
    adventureSettings: {
      ...adventureSettings,
      additionalMemories: ""
    }
  };
}

function parseSavedGame(raw: string): SavedGamePayload | null {
  try {
    const parsed: unknown = JSON.parse(raw);

    if (!isRecord(parsed)) {
      return null;
    }

    const version = parsed.version;

    if (![1, 2, 3, 4, 5, SAVE_VERSION].includes(Number(version))) {
      return null;
    }

    if (
      typeof parsed.savedAt !== "string" ||
      typeof parsed.currentReply !== "string" ||
      typeof parsed.currentAction !== "string" ||
      !Array.isArray(parsed.history) ||
      !parsed.history.every(isTurn) ||
      !isAttributes(parsed.attributes) ||
      !isStatus(parsed.status)
    ) {
      return null;
    }

    if (Number(version) >= SAVE_VERSION && parsed.skills !== undefined && !isSkills(parsed.skills)) {
      return null;
    }

    if (
      Number(version) >= 2 &&
      Number(version) < SAVE_VERSION &&
      parsed.memory !== undefined &&
      !isMemory(parsed.memory)
    ) {
      return null;
    }

    return parsed as SavedGamePayload;
  } catch {
    return null;
  }
}

export function hasSavedGame() {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw ? parseSavedGame(raw) !== null : false;
}

export function loadSavedGame(): ActiveGameState | null {
  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return null;
  }

  const saved = parseSavedGame(raw);

  if (!saved) {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }

  const adventureSettings = normalizeAdventureSettings(saved.adventureSettings);
  const migrated = migrateLegacySave(saved, adventureSettings);

  return {
    currentReply: saved.currentReply,
    currentAction: saved.currentAction,
    history: saved.history,
    attributes: saved.attributes,
    status: {
      location: saved.status.location,
      inventory: [...saved.status.inventory]
    },
    skills: migrated.skills,
    adventureSettings: migrated.adventureSettings
  };
}

export function saveGame(state: ActiveGameState) {
  const payload: SavedGamePayload = {
    version: SAVE_VERSION,
    savedAt: new Date().toISOString(),
    currentReply: state.currentReply,
    currentAction: state.currentAction,
    history: state.history,
    attributes: state.attributes,
    status: state.status,
    skills: state.skills,
    adventureSettings: state.adventureSettings
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function clearSavedGame() {
  window.localStorage.removeItem(STORAGE_KEY);
}
