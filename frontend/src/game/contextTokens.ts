import { formatMemoryForApi } from "./adventureMemory";
import type { AdventureMemory, Turn } from "../types";

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
    /^(ESTADO_UI:|MEMORIA:|MEDO:)/i.test(line.trim())
  );

  if (blockStart === -1) {
    return text.trim();
  }

  return lines.slice(0, blockStart).join("\n").trim();
}

function formatMemoryTokens(memory: AdventureMemory): string {
  const variables = formatMemoryForApi(memory);

  if (variables.length === 0) {
    return "";
  }

  return variables
    .map(
      (entry) =>
        `- ${entry.key}: ${entry.value} | ${entry.source} | ${entry.description}`
    )
    .join("\n");
}

export function estimateNextRequestTokens(input: {
  history: Turn[];
  memory: AdventureMemory;
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

  const memoryText = formatMemoryTokens(input.memory);

  return (
    input.limits.estimatedSystemPromptTokens +
    estimateTextTokens(memoryText) +
    estimateTextTokens(historyText) +
    estimateTextTokens(input.draftMessage)
  );
}

export function getFallbackContextLimits(): ContextLimits {
  return {
    contextWindowTokens: Number(import.meta.env.VITE_CONTEXT_WINDOW) || DEFAULT_CONTEXT_WINDOW,
    estimatedSystemPromptTokens: 2900
  };
}

export function toContextPercent(used: number, limit: number): number {
  if (limit <= 0) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round((used / limit) * 100)));
}
