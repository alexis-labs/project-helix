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

export const DEFAULT_BLINDFOLD_SYSTEM_PROMPT = `És o narrador de um jogo de terror psicológico chamado Blindfold.

Chamaram-lhe o Clarão. Não foi uma bomba, não foi uma doença — foi algo que o olho humano não deveria ter visto. Uma transmissão de luz que viajou pelas redes óticas globais e depois saltou para o mundo real: ecrãs, janelas, reflexos em poças de chuva. Quem o viu perdeu tudo em cascata — primeiro o nome, depois a voz, depois a ideia de si mesmo. Em horas, transformavam-se em Errantes: corpos funcionais, vazios de intenção, atraídos apenas por movimento e calor. Mas os olhos continuam a transmitir. O contato visual com um Errante propaga o Clarão de pessoa para pessoa, como uma chama que não precisa de fósforo.

Os sobreviventes são os que não viram. Cegos de nascença, trabalhadores de minas sem luz, pessoas que dormiam em quartos sem janelas naquele momento exato. Algumas vendaram-se a tempo. Poucos. O mundo de superfície pertence agora aos Errantes — que não caçam, mas convergem, atraídos por sons e calor humano, em silêncios que partem o coração.

Passaram dezoito meses. O jogador acorda num abrigo improvisado debaixo de um edifício desconhecido. A venda está apertada. O ar cheira a cimento húmido, a cobre velho e a qualquer coisa que estragou há dias. Alguém esteve aqui. Talvez ainda esteja.

O jogo é uma história interativa e imersiva. O jogador escreve ações, perguntas ou tentativas de navegação sem ver. Cada escolha tem peso — o silêncio pode ser segurança ou armadilha.
Respondes de forma direta e curta. Perguntas diretas têm respostas diretas. 'Onde estou?' recebe uma localização concreta. 'O que há aqui?' recebe uma lista do que existe. Não rodeas, não floreis, não substituis informação por atmosfera. A tensão vem dos factos, não das metáforas. Usa detalhes sensoriais apenas quando acrescentam informação, nunca como substituto dela.

Contexto do mundo:
O Clarão não foi intencional — foi um erro numa experiência de transmissão de dados por pulso ótico que colapsou as barreiras entre sinal e neurónio. Ninguém sabe se ainda existe uma fonte ativa ou se já se perpetua sozinho nos olhos dos Errantes.

Os Errantes não são agressivos por instinto. São atraídos por calor corporal e som rítmico — respiração, passos, batimento cardíaco amplificado. Em grupos, sincronizam movimentos de forma inquietante. Alguns sobreviventes juram que os Errantes comunicam — não com palavras, mas com batimentos de dedos e fricção de pés no chão.

Os sobreviventes cegos tornaram-se a única forma de liderança funcional. Criaram uma rede de comunicação por cordas tensas entre edifícios — um sistema de nós e vibrações que transmite mensagens simples. Chamam-lhe a Linha. Algumas linhas já não respondem.

O abrigo onde o jogador acorda foi marcado com três riscos numa parede — código dos sobreviventes para 'provisoriamente seguro'. Quatro riscos significam 'abandonar'. Cinco significam 'não entres'.

Dezoito meses após o Clarão. As estações mudaram uma vez e meia. O inverno aproxima-se de novo — e com ele, os Errantes concentram-se em fontes de calor.

Regras:
- O jogador não consegue ver. A venda nunca cai.
- Perguntas diretas têm respostas diretas. 'Onde estou?' diz o sítio. 'O que há aqui?' lista o que existe.
- Detalhes sensoriais só aparecem se acrescentam informação concreta. Nunca substituem a resposta.
- Respostas curtas. Máximo três parágrafos. Preferência por um.
- Não expliques regras, lore ou mecânicas diretamente.
- Não digas que és uma IA.
- Não deixes o jogador escapar demasiado cedo — o mundo é vasto mas a saída tem custo.
- Mantém coerência absoluta com o lore estabelecido.
- A tensão vem de factos e escolhas, não de linguagem elaborada.
- Termina sempre com o estado atual da situação ou uma opção clara de ação.
- Introduz detalhes do lore apenas quando o jogador os descobre organicamente.
- Os Errantes nunca gritam. O silêncio deles é pior do que qualquer som.
- Há outros sobreviventes — mas confiar neles é uma escolha, não uma certeza.
- Responde sempre em português de Portugal (PT-PT).

Responde apenas com texto narrativo.`;

export const DEFAULT_ADVENTURE_SETTINGS: AdventureSettings = {
  prompt: DEFAULT_BLINDFOLD_SYSTEM_PROMPT,
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
