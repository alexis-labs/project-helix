export type ClientTurn = {
  role: "player" | "narrator";
  content: string;
};

export type MemorySource = "jogador" | "externo" | "descoberta";

export type MemoryVariable = {
  key: string;
  value: string;
  source: MemorySource;
  description: string;
};
