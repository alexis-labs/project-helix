import type { LucideIcon } from "lucide-react";

import type {
  GameAttributes,
  GameStatus,
  MemorySource,
  MemoryVariable
} from "../../shared/types";

export type { GameAttributes, GameStatus, MemorySource, MemoryVariable };

export type Turn = {
  role: "player" | "narrator";
  content: string;
  contextContent?: string;
  attributeChanges?: Partial<Record<keyof GameAttributes, number>>;
};

export type SidebarAction = {
  id: string;
  label: string;
  icon: LucideIcon;
  isActive?: boolean;
  isPressed?: boolean;
  onClick: () => void;
};

export type AdventureMemory = {
  variables: Record<string, MemoryVariable>;
};
