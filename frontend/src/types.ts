import type { LucideIcon } from "lucide-react";

export type Turn = {
  role: "player" | "narrator";
  content: string;
  contextContent?: string;
};

export type SidebarAction = {
  id: string;
  label: string;
  icon: LucideIcon;
  isActive?: boolean;
  isPressed?: boolean;
  onClick: () => void;
};

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

export type AdventureMemory = {
  variables: Record<string, MemoryVariable>;
};
