import { openingNarration } from "../content/story";
import type { GameAttributes, GameStatus, Turn } from "../types";

export const INITIAL_ATTRIBUTES: GameAttributes = {
  fear: 20,
  injuries: 0,
  hunger: 10,
  exhaustion: 15
};

export const INITIAL_STATUS: GameStatus = {
  location: "Abrigo da escola secundária",
  inventory: [
    "Venda improvisada",
    "Fotografia antiga da mãe",
    "Garrafa de água meio cheia"
  ]
};

export type ActiveGameState = {
  currentReply: string;
  currentAction: string;
  history: Turn[];
  attributes: GameAttributes;
  status: GameStatus;
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
    }
  };
}
