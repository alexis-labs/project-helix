import { formatFoldersForApi, formatSkillsForApi } from "./adventureSkills";
import type { AdventureSkills, Turn } from "../types";

export const DEFAULT_CONTEXT_WINDOW = 128_000;

export type ContextLimits = {
  contextWindowTokens: number;
  estimatedSystemPromptTokens: number;
};

export type ContextUsageSnapshot = {
  usedTokens: number;
  limitTokens: number;
};

function estimateTextTokens(text: string): number {
  const trimmed = text.trim();

  if (!trimmed) {
    return 0;
  }

  return Math.ceil(trimmed.length / 3.5);
}

function stripTechnicalBlocks(text: string) {
  const lines = text.split("\n");
  const blockStart = lines.findIndex((line) =>
    /^(ESTADO_UI:|MEDO:)/i.test(line.trim())
  );

  if (blockStart === -1) {
    return text.trim();
  }

  return lines.slice(0, blockStart).join("\n").trim();
}

function formatSkillsIndexTokens(skills: AdventureSkills): string {
  const entries = formatSkillsForApi(skills);
  const folders = formatFoldersForApi(skills);
  const folderNames = new Map(folders.map((folder) => [folder.id, folder.name]));

  if (entries.length === 0 && folders.length === 0) {
    return "";
  }

  const lines: string[] = [];

  for (const folder of folders) {
    lines.push(`[${folder.name}]`);
  }

  for (const skill of entries) {
    const prefix = skill.folderId && folderNames.has(skill.folderId)
      ? `[${folderNames.get(skill.folderId)}] `
      : "";
    lines.push(`${prefix}- ${skill.id}: ${skill.title} | ${skill.description}`);
  }

  return lines.join("\n");
}

export function estimateNextRequestTokens(input: {
  history: Turn[];
  skills: AdventureSkills;
  draftMessage: string;
  limits: ContextLimits;
}): number {
  const historyText = input.history
    .slice(-10)
    .map((turn) => {
      const content =
        turn.role === "narrator"
          ? stripTechnicalBlocks(turn.contextContent || turn.content)
          : turn.content;

      return content;
    })
    .join("\n");

  const skillsText = formatSkillsIndexTokens(input.skills);

  return (
    input.limits.estimatedSystemPromptTokens +
    estimateTextTokens(skillsText) +
    estimateTextTokens(historyText) +
    estimateTextTokens(input.draftMessage)
  );
}

export function getFallbackContextLimits(): ContextLimits {
  return {
    contextWindowTokens: Number(import.meta.env.VITE_CONTEXT_WINDOW) || DEFAULT_CONTEXT_WINDOW,
    estimatedSystemPromptTokens: 0
  };
}

export function toContextPercent(used: number, limit: number): number {
  if (limit <= 0) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round((used / limit) * 100)));
}
