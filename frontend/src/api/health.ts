import {
  getFallbackContextLimits,
  type ContextLimits
} from "../game/contextTokens";

type HealthResponse = {
  ok?: boolean;
  llm?: {
    contextWindowTokens?: number;
    estimatedSystemPromptTokens?: number;
  };
};

function resolveApiBase() {
  const configured = import.meta.env.VITE_API_URL?.trim();

  if (configured) {
    return configured.replace(/\/$/, "");
  }

  if (import.meta.env.DEV) {
    return "";
  }

  return "http://localhost:3011";
}

export async function fetchContextLimits(): Promise<ContextLimits> {
  const fallbackLimits = getFallbackContextLimits();
  const apiBase = resolveApiBase();

  try {
    const response = await fetch(`${apiBase}/api/health`);

    if (!response.ok) {
      return fallbackLimits;
    }

    const data = (await response.json()) as HealthResponse;
    const window = data.llm?.contextWindowTokens;
    const system = data.llm?.estimatedSystemPromptTokens;

    return {
      contextWindowTokens:
        typeof window === "number" && window > 0
          ? window
          : fallbackLimits.contextWindowTokens,
      estimatedSystemPromptTokens:
        typeof system === "number" && system > 0
          ? system
          : fallbackLimits.estimatedSystemPromptTokens
    };
  } catch {
    return fallbackLimits;
  }
}
