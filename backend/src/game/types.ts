export type {
  GameAttributes,
  GameStatus,
  MemorySource,
  MemoryVariable
} from "../../../shared/types.ts";

export type ClientTurn = {
  role: "player" | "narrator";
  content: string;
};
