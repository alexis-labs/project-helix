import path from "node:path";
import { fileURLToPath } from "node:url";

import dotenv from "dotenv";

const envPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../.env"
);

dotenv.config({ path: envPath });

const readEnv = (name: string) => {
  const value = process.env[name]?.trim();
  return value || undefined;
};

const provider = "openrouter";
const defaultModel = "nvidia/nemotron-3.5-content-safety:free";

export const llmConfig = {
  provider,
  apiKey:
    readEnv("LLM_API_KEY") ||
    readEnv("OPENROUTER_API_KEY") ||
    readEnv("OPENAI_API_KEY"),
  baseUrl: readEnv("OPENAI_BASE_URL") || "https://openrouter.ai/api/v1",
  model: readEnv("OPENAI_MODEL") || defaultModel,
  temperature: 0.85,
  maxCompletionTokens: Number(readEnv("LLM_MAX_COMPLETION_TOKENS") || 1024),
  contextWindowTokens: Number(readEnv("LLM_CONTEXT_WINDOW") || 128_000)
};

export function buildCompletionParams() {
  return {
    temperature: llmConfig.temperature,
    max_completion_tokens: llmConfig.maxCompletionTokens
  };
}

export { buildSummaryPrompt } from "./prompt/summary.ts";
