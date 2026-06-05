export type StoryCard = {
  id: string;
  title: string;
  triggers: string[];
  text: string;
  isActive: boolean;
};

export type AdventureDetails = {
  title: string;
  description: string;
  tags: string[];
  visibility: "private" | "local";
  rating: "teen" | "mature";
};

export type AdventurePlot = {
  aiInstructions: string;
  storySummary: string;
  plotEssentials: string;
  authorNote: string;
  thirdPerson: boolean;
};

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

export type AdventureSettings = {
  plot: AdventurePlot;
  storyCards: StoryCard[];
  details: AdventureDetails;
  appearance: AdventureAppearance;
  selectedModel: string;
};

export const OPENROUTER_MODELS = [
  {
    id: "mistralai/mistral-nemo",
    label: "Mistral Nemo",
    provider: "Mistral AI",
    contextWindowTokens: 128_000,
    description: "Equilibrado, rápido e bom para narração curta."
  },
  {
    id: "openai/gpt-4.1-mini",
    label: "GPT-4.1 Mini",
    provider: "OpenAI",
    contextWindowTokens: 1_000_000,
    description: "Forte em coerência e seguimento de regras."
  },
  {
    id: "google/gemini-3.5-flash",
    label: "Gemini 3.5 Flash",
    provider: "Google",
    contextWindowTokens: 1_000_000,
    description: "Rápido, com grande janela de contexto."
  },
  {
    id: "deepseek/deepseek-chat",
    label: "DeepSeek Chat",
    provider: "DeepSeek",
    contextWindowTokens: 64_000,
    description: "Bom para progressão lógica e resposta direta."
  },
  {
    id: "nvidia/nemotron-3-ultra-550b-a55b:free",
    label: "Nemotron 3 Ultra Free",
    provider: "NVIDIA",
    contextWindowTokens: 128_000,
    description: "Opção gratuita para testes.",
    isFree: true
  },
  {
    id: "nvidia/nemotron-3.5-content-safety:free",
    label: "Nemotron 3.5 Content Safety Free",
    provider: "NVIDIA",
    contextWindowTokens: 128_000,
    description: "Modelo gratuito focado em moderação e segurança de conteúdo.",
    isFree: true
  }
] as const satisfies OpenRouterModelOption[];

export const DEFAULT_OPENROUTER_MODEL = "mistralai/mistral-nemo";

export const DEFAULT_ADVENTURE_SETTINGS: AdventureSettings = {
  plot: {
    aiInstructions:
      "Mantém a narração curta, sensorial e tensa. O jogador está vendado e nunca deve receber descrições visuais diretas.",
    storySummary:
      "Jack tenta sobreviver depois de perder a mãe durante uma evacuação marcada por uma infeção transmitida pelo contacto visual.",
    plotEssentials:
      "Jack está vendado. A mãe está desaparecida. O abrigo da escola proíbe saídas. A infeção apaga a identidade dos infetados.",
    authorNote:
      "Terror psicológico íntimo. Frases contidas. Sons, toque, cheiro e respiração importam mais do que explicações.",
    thirdPerson: false
  },
  storyCards: [
    {
      id: "abrigo",
      title: "Abrigo da escola",
      triggers: ["abrigo", "escola", "responsáveis"],
      text:
        "O abrigo ocupa uma escola secundária. Os responsáveis controlam as saídas e escondem informação sobre evacuações antigas.",
      isActive: true
    },
    {
      id: "infeccao",
      title: "Infeção visual",
      triggers: ["infecção", "infeção", "infectados", "infetados", "olhos"],
      text:
        "A infeção transmite-se por contacto visual direto. Os infetados perdem identidade, voz própria e memória.",
      isActive: true
    }
  ],
  details: {
    title: "Blindfold",
    description: "Terror psicológico interativo em texto, jogado sem visão.",
    tags: ["terror", "sobrevivência", "vendado"],
    visibility: "private",
    rating: "mature"
  },
  appearance: {
    theme: "dark",
    ereaderTone: 0,
    fontScale: 92
  },
  selectedModel: DEFAULT_OPENROUTER_MODEL
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
