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
    id: "nvidia/nemotron-3-ultra-550b-a55b:free",
    label: "Nemotron 3 Ultra Free",
    provider: "NVIDIA",
    contextWindowTokens: 128_000,
    description: "Opcao gratuita para testes.",
    isFree: true
  },
  {
    id: "nvidia/nemotron-3.5-content-safety:free",
    label: "Nemotron 3.5 Content Safety Free",
    provider: "NVIDIA",
    contextWindowTokens: 128_000,
    description: "Modelo gratuito focado em moderacao e seguranca de conteudo.",
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
