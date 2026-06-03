export type GameAttributes = {
  fear: number;
  injuries: number;
  hunger: number;
  exhaustion: number;
};

export type GameStatus = {
  location: string;
  inventory: string[];
};

export type MemorySource = "jogador" | "externo" | "descoberta";

export type MemoryVariable = {
  key: string;
  value: string;
  source: MemorySource;
  description: string;
};
