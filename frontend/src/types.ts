import type { LucideIcon } from "lucide-react";

import type {
  AdventureSettings,
  OpenRouterModelOption,
  ReadingTypeface
} from "../../shared/adventureSettings";

import type {
  AdventureSkill,
  AdventureSkills,
  GameAttributes,
  GameStatus,
  SkillFolder,
  SkillSource
} from "../../shared/types";

export type {
  AdventureSettings,
  ReadingTypeface,
  AdventureSkill,
  AdventureSkills,
  GameAttributes,
  GameStatus,
  SkillFolder,
  SkillSource,
  OpenRouterModelOption
};

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

// Legacy types kept for save migration from v5
export type MemorySource = SkillSource;

export type MemoryVariable = {
  key: string;
  value: string;
  source: MemorySource;
  description: string;
};

export type AdventureMemory = {
  variables: Record<string, MemoryVariable>;
};
