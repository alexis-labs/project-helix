export type AdventureAppearance = {
  theme: "dark" | "light";
  ereaderTone: number;
  fontScale: number;
};

export type OpenRouterModelOption = {
  id: string;
  label: string;
  provider: string;
  contextWindowTokens: number;
  description: string;
  isFree?: boolean;
};

export type LlmRuntimeSettings = {
  temperature: number;
  maxCompletionTokens: number;
  contextWindowTokens: number;
};

export type AdventureSettings = {
  prompt: string;
  additionalMemories: string;
  appearance: AdventureAppearance;
  selectedModel: string;
  llm: LlmRuntimeSettings;
};

export const OPENROUTER_MODELS = [
  {
    id: "mistralai/mistral-nemo",
    label: "Mistral Nemo",
    provider: "Mistral AI",
    contextWindowTokens: 128_000,
    description: "Equilibrado, rapido e bom para narracao curta."
  },
  {
    id: "nvidia/nemotron-3-nano-30b-a3b:free",
    label: "Nemotron 3 Nano Free",
    provider: "NVIDIA",
    contextWindowTokens: 256_000,
    description: "Modelo gratuito oficial da NVIDIA para chat e agentes.",
    isFree: true
  },
  {
    id: "openrouter/free",
    label: "OpenRouter Free Router",
    provider: "OpenRouter",
    contextWindowTokens: 128_000,
    description: "Router gratuito que escolhe um modelo free disponivel.",
    isFree: true
  }
] as const satisfies OpenRouterModelOption[];

export const DEFAULT_OPENROUTER_MODEL = "mistralai/mistral-nemo";

export const DEFAULT_LLM_RUNTIME_SETTINGS: LlmRuntimeSettings = {
  temperature: 0.85,
  maxCompletionTokens: 1024,
  contextWindowTokens: 128_000
};

export const DEFAULT_ADVENTURE_SETTINGS: AdventureSettings = {
  prompt: "",
  additionalMemories: "",
  appearance: {
    theme: "dark",
    ereaderTone: 0,
    fontScale: 92
  },
  selectedModel: DEFAULT_OPENROUTER_MODEL,
  llm: { ...DEFAULT_LLM_RUNTIME_SETTINGS }
};

const modelIds = new Set<string>(OPENROUTER_MODELS.map((model) => model.id));

export function isAllowedOpenRouterModel(model: string) {
  return modelIds.has(model);
}

export function resolveOpenRouterModel(model: string | undefined) {
  return model && isAllowedOpenRouterModel(model)
    ? model
    : DEFAULT_OPENROUTER_MODEL;
}
