export type {
  AdventureSkill,
  AdventureSkills,
  GameAttributes,
  GameStatus,
  SkillFolder,
  SkillSource
} from "../../../shared/types.ts";

export type { AdventureSettings } from "../../../shared/adventureSettings.ts";

export type ClientTurn = {
  role: "player" | "narrator";
  content: string;
};
