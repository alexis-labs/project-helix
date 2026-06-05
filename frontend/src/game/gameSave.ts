import {
  DEFAULT_ADVENTURE_SETTINGS,
  resolveOpenRouterModel
} from "../../../shared/adventureSettings";
import type { ActiveGameState } from "./initialState";
import { createInitialMemory } from "./adventureMemory";
import type {
  AdventureMemory,
  AdventureSettings,
  GameAttributes,
  GameStatus,
  MemoryVariable,
  Turn
} from "../types";

const STORAGE_KEY = "blindfold-save";
const SAVE_VERSION = 5;

export type SavedGamePayload = {
  version: number;
  savedAt: string;
  currentReply: string;
  currentAction: string;
  history: Turn[];
  attributes: GameAttributes;
  status: GameStatus;
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

function isMemoryVariable(value: unknown): value is MemoryVariable {
  if (!isRecord(value)) {
    return false;
  }

  const source = value.source;

  return (
    typeof value.key === "string" &&
    typeof value.value === "string" &&
    typeof value.description === "string" &&
    (source === "jogador" || source === "externo" || source === "descoberta")
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
    additionalMemories: normalizeText(
      value.additionalMemories,
      defaults.additionalMemories,
      12_000
    ),
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
      )
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

function parseSavedGame(raw: string): SavedGamePayload | null {
  try {
    const parsed: unknown = JSON.parse(raw);

    if (!isRecord(parsed)) {
      return null;
    }

    const version = parsed.version;

    if (![1, 2, 3, 4, SAVE_VERSION].includes(Number(version))) {
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

    if (Number(version) >= 2 && parsed.memory !== undefined && !isMemory(parsed.memory)) {
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

  return {
    currentReply: saved.currentReply,
    currentAction: saved.currentAction,
    history: saved.history,
    attributes: saved.attributes,
    status: {
      location: saved.status.location,
      inventory: [...saved.status.inventory]
    },
    memory: saved.memory ?? createInitialMemory(),
    adventureSettings: normalizeAdventureSettings(saved.adventureSettings)
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
    memory: state.memory,
    adventureSettings: state.adventureSettings
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function clearSavedGame() {
  window.localStorage.removeItem(STORAGE_KEY);
}
