import { DEFAULT_ADVENTURE_SETTINGS } from "../../../shared/adventureSettings";
import { gameContent } from "../../../shared/gameContent";
import { openingNarration } from "../content/story";
import type {
  AdventureMemory,
  AdventureSettings,
  GameAttributes,
  GameStatus,
  Turn
} from "../types";
import { createInitialMemory } from "./adventureMemory";

export const INITIAL_ATTRIBUTES: GameAttributes = {
  ...gameContent.initialAttributes
};

export const INITIAL_STATUS: GameStatus = {
  location: gameContent.initialStatus.location,
  inventory: [...gameContent.initialStatus.inventory]
};

export type ActiveGameState = {
  currentReply: string;
  currentAction: string;
  history: Turn[];
  attributes: GameAttributes;
  status: GameStatus;
  memory: AdventureMemory;
  adventureSettings: AdventureSettings;
};

export function createNewGameState(): ActiveGameState {
  return {
    currentReply: openingNarration,
    currentAction: "",
    history: [{ role: "narrator", content: openingNarration }],
    attributes: { ...INITIAL_ATTRIBUTES },
    status: {
      location: INITIAL_STATUS.location,
      inventory: [...INITIAL_STATUS.inventory]
    },
    memory: createInitialMemory(),
    adventureSettings: structuredClone(DEFAULT_ADVENTURE_SETTINGS)
  };
}
