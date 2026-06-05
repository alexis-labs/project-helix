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

export type SkillSource = "jogador" | "externo" | "descoberta";

export type SkillFolder = {
  id: string;
  name: string;
  parentId: string | null;
};

export type AdventureSkill = {
  id: string;
  folderId: string | null;
  title: string;
  description: string;
  content: string;
  source: SkillSource;
};

export type AdventureSkills = {
  folders: Record<string, SkillFolder>;
  skills: Record<string, AdventureSkill>;
};
