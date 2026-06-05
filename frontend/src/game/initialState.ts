import { DEFAULT_ADVENTURE_SETTINGS } from "../../../shared/adventureSettings";
import type {
  AdventureSettings,
  AdventureSkills,
  GameAttributes,
  GameStatus,
  Turn
} from "../types";
import { createInitialSkills } from "./adventureSkills";

export const INITIAL_ATTRIBUTES: GameAttributes = {
  fear: 0,
  injuries: 0,
  hunger: 0,
  exhaustion: 0
};

export const INITIAL_STATUS: GameStatus = {
  location: "",
  inventory: []
};

export type ActiveGameState = {
  currentReply: string;
  currentAction: string;
  history: Turn[];
  attributes: GameAttributes;
  status: GameStatus;
  skills: AdventureSkills;
  adventureSettings: AdventureSettings;
};

export function createNewGameState(): ActiveGameState {
  return {
    currentReply: "",
    currentAction: "",
    history: [],
    attributes: { ...INITIAL_ATTRIBUTES },
    status: {
      location: INITIAL_STATUS.location,
      inventory: [...INITIAL_STATUS.inventory]
    },
    skills: createInitialSkills(),
    adventureSettings: structuredClone(DEFAULT_ADVENTURE_SETTINGS)
  };
}
