import { DEFAULT_ADVENTURE_SETTINGS } from "../../../shared/adventureSettings";
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
const SAVE_VERSION = 3;

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

function normalizeText(value: unknown, fallback: string) {
  return typeof value === "string" ? value : fallback;
}

function normalizeStringList(value: unknown, fallback: string[]) {
  return Array.isArray(value) && value.every((entry) => typeof entry === "string")
    ? value
    : fallback;
}

function normalizeAdventureSettings(value: unknown): AdventureSettings {
  const defaults = cloneDefaultAdventureSettings();

  if (!isRecord(value)) {
    return defaults;
  }

  const plot = isRecord(value.plot) ? value.plot : {};
  const details = isRecord(value.details) ? value.details : {};
  const appearance = isRecord(value.appearance) ? value.appearance : {};
  const storyCards = Array.isArray(value.storyCards)
    ? value.storyCards
        .filter(isRecord)
        .map((card, index) => ({
          id: normalizeText(card.id, `card-${index + 1}`),
          title: normalizeText(card.title, ""),
          triggers: normalizeStringList(card.triggers, []),
          text: normalizeText(card.text, ""),
          isActive:
            typeof card.isActive === "boolean" ? card.isActive : true
        }))
        .filter((card) => card.title.trim() && card.text.trim())
    : defaults.storyCards;

  return {
    plot: {
      aiInstructions: normalizeText(
        plot.aiInstructions,
        defaults.plot.aiInstructions
      ),
      storySummary: normalizeText(plot.storySummary, defaults.plot.storySummary),
      plotEssentials: normalizeText(
        plot.plotEssentials,
        defaults.plot.plotEssentials
      ),
      authorNote: normalizeText(plot.authorNote, defaults.plot.authorNote),
      thirdPerson:
        typeof plot.thirdPerson === "boolean"
          ? plot.thirdPerson
          : defaults.plot.thirdPerson
    },
    storyCards: storyCards.length > 0 ? storyCards : defaults.storyCards,
    details: {
      title: normalizeText(details.title, defaults.details.title),
      description: normalizeText(details.description, defaults.details.description),
      tags: normalizeStringList(details.tags, defaults.details.tags),
      visibility:
        details.visibility === "local" || details.visibility === "private"
          ? details.visibility
          : defaults.details.visibility,
      rating:
        details.rating === "teen" || details.rating === "mature"
          ? details.rating
          : defaults.details.rating
    },
    appearance: {
      theme: appearance.theme === "light" ? "light" : defaults.appearance.theme,
      ereaderTone:
        typeof appearance.ereaderTone === "number"
          ? appearance.ereaderTone
          : defaults.appearance.ereaderTone,
      fontScale:
        typeof appearance.fontScale === "number"
          ? appearance.fontScale
          : defaults.appearance.fontScale
    },
    selectedModel: normalizeText(value.selectedModel, defaults.selectedModel)
  };
}

function parseSavedGame(raw: string): SavedGamePayload | null {
  try {
    const parsed: unknown = JSON.parse(raw);

    if (!isRecord(parsed)) {
      return null;
    }

    const version = parsed.version;

    if (version !== 1 && version !== 2 && version !== SAVE_VERSION) {
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

    if (version >= 2 && parsed.memory !== undefined && !isMemory(parsed.memory)) {
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
