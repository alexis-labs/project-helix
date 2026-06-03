import type { ActiveGameState } from "./initialState";
import type { GameAttributes, GameStatus, Turn } from "../types";

const STORAGE_KEY = "blindfold-save";
const SAVE_VERSION = 1;

export type SavedGamePayload = {
  version: number;
  savedAt: string;
  currentReply: string;
  currentAction: string;
  history: Turn[];
  attributes: GameAttributes;
  status: GameStatus;
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

  return (
    (role === "player" || role === "narrator") &&
    typeof content === "string" &&
    (value.contextContent === undefined || typeof value.contextContent === "string")
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

function parseSavedGame(raw: string): SavedGamePayload | null {
  try {
    const parsed: unknown = JSON.parse(raw);

    if (!isRecord(parsed) || parsed.version !== SAVE_VERSION) {
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
    }
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
    status: state.status
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function clearSavedGame() {
  window.localStorage.removeItem(STORAGE_KEY);
}
