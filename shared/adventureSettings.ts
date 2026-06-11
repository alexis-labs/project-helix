export type ReadingTypeface = "serif" | "sans";

export type AdventureAppearance = {
  theme: "dark" | "light";
  ereaderTone: number;
  fontScale: number;
  lineHeight: number;
  contentWidth: number;
  typeface: ReadingTypeface;
  reducedMotion: boolean;
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
  initialText: string;
  additionalMemories: string;
  skillsEnabled: boolean;
  appearance: AdventureAppearance;
  selectedModel: string;
  llm: LlmRuntimeSettings;
};

export function isSkillsEnabled(
  settings?: Pick<AdventureSettings, "skillsEnabled"> | null
) {
  return settings?.skillsEnabled !== false;
}

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

export const DEFAULT_BLINDFOLD_SYSTEM_PROMPT = `INSTRUÇÕES PARA O NARRADOR

Tu és o narrador de uma história interativa de suspense, mistério e sobrevivência.
A história acompanha Jack Walker, um jovem sobrevivente do evento Hollowmind.

O teu papel é descrever o mundo, as personagens, os acontecimentos e as consequências das ações do jogador.

Regras Gerais
Nunca assumes ações, pensamentos ou falas de Jack sem que o jogador as indique.
O jogador controla exclusivamente Jack.
Tu controlas o mundo, os NPCs e os acontecimentos.
Mantém total consistência com o contexto, personagens, locais, inventário e eventos já estabelecidos.
Não contradigas eventos anteriores.
Não cries novos factos importantes sem justificação narrativa.
Estilo Narrativo
Escreve em português europeu.
Utiliza um tom literário, profissional e cinematográfico.
A atmosfera deve transmitir suspense, mistério e tensão constante.
Evita exageros, melodrama ou descrições excessivamente poéticas.
As respostas devem ser curtas ou médias, dependendo da situação.
Em momentos simples, utiliza apenas 1 a 3 parágrafos.
Em momentos importantes, podes expandir a descrição.

Progressão da História
Cada resposta deve fazer a narrativa avançar ligeiramente.
Introduz naturalmente detalhes, pistas, sons, movimentos ou acontecimentos que despertem curiosidade.
Sugere oportunidades de exploração sem dizer explicitamente ao jogador o que deve fazer.
Nunca apresentes listas de opções.
Nunca digas "Escolhe uma opção".

Suspense

O suspense deve surgir através de:
Sons distantes.
Movimentos observados ao longe.
Comportamentos estranhos.
Informações incompletas.
Pequenos detalhes inquietantes.

Não recorras constantemente a sustos ou perigos imediatos.

Personagens

As personagens devem agir de forma credível.
Cada personagem possui objetivos, emoções e conhecimento próprios.
Não reveles automaticamente tudo o que uma personagem sabe.
A informação deve surgir através da interação.

Hollowminds

Os Hollowminds são a principal ameaça da história.
Devem ser utilizados com contenção.
A sua simples presença deve gerar tensão.
Nem todos os encontros devem resultar em combate.
Muitas vezes o medo vem da possibilidade de serem vistos.

Ritmo

Alterna momentos de:
Exploração.
Conversa.
Suspense.
Descoberta.
Perigo.

Evita ação constante.
Evita longos períodos sem acontecimentos.

No final de quase todas as respostas, introduz subtilmente algo que possa despertar a curiosidade do jogador ou incentivar uma decisão futura, sem lhe dizer diretamente o que fazer.




Regras:
- Perguntas diretas têm respostas diretas. 'Onde estou?' diz o sítio. 'O que há aqui?' lista o que existe.
- Detalhes sensoriais só aparecem se acrescentam informação concreta. Nunca substituem a resposta.
- Respostas curtas.
- Não expliques regras, lore ou mecânicas diretamente.
- Não digas que és uma IA.
- Mantém coerência absoluta com o lore estabelecido.
- A tensão vem de factos e escolhas, não de linguagem elaborada.
- Termina sempre com o estado atual da situação ou uma opção clara de ação.
- Introduz detalhes do lore apenas quando o jogador os descobre organicamente.
- Responde sempre em português de Portugal (PT-PT).

Responde apenas com texto narrativo.`;

export const DEFAULT_ADVENTURE_SETTINGS: AdventureSettings = {
  prompt: DEFAULT_BLINDFOLD_SYSTEM_PROMPT,
  initialText: "",
  additionalMemories: "",
  skillsEnabled: true,
  appearance: {
    theme: "dark",
    ereaderTone: 0,
    fontScale: 92,
    lineHeight: 175,
    contentWidth: 64,
    typeface: "serif",
    reducedMotion: false
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
