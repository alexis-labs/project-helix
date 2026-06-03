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

const provider = readEnv("LLM_PROVIDER") || "openrouter";
const defaultModel =
  provider === "openai"
    ? "gpt-4.1-mini"
    : provider === "google"
      ? "gemini-2.5-flash"
      : "openrouter/free";
const providerKeyName = `${provider.toUpperCase()}_API_KEY`;

export const llmConfig = {
  provider,
  apiKey:
    readEnv("LLM_API_KEY") ||
    readEnv(providerKeyName) ||
    readEnv("OPENAI_API_KEY"),
  baseUrl:
    readEnv("OPENAI_BASE_URL") ||
    (provider === "openrouter"
      ? "https://openrouter.ai/api/v1"
      : provider === "google"
        ? "https://generativelanguage.googleapis.com/v1beta/openai/"
        : undefined),
  model: readEnv("OPENAI_MODEL") || defaultModel,
  temperature: 0.85,
  maxCompletionTokens: Number(readEnv("LLM_MAX_COMPLETION_TOKENS") || 1024),
  contextWindowTokens: Number(readEnv("LLM_CONTEXT_WINDOW") || 128_000)
};

export function buildCompletionParams() {
  const shared = {
    temperature: llmConfig.temperature
  };

  if (llmConfig.provider === "google") {
    return { ...shared, max_tokens: llmConfig.maxCompletionTokens };
  }

  return { ...shared, max_completion_tokens: llmConfig.maxCompletionTokens };
}

export { buildSummaryPrompt } from "./prompt/summary.ts";
