import type { AdventureSettings } from "../../../shared/adventureSettings.ts";
import {
  DEFAULT_ADVENTURE_SETTINGS,
  isSkillsEnabled,
  resolveOpenRouterModel
} from "../../../shared/adventureSettings.ts";
import type {
  AdventureSkill,
  GameAttributes,
  GameStatus,
  SkillFolder
} from "../../../shared/types.ts";
import {
  formatConsultedSkillsForPrompt,
  formatSkillsIndexForPrompt
} from "./skills.ts";

export type BuildSystemPromptInput = {
  attributes?: GameAttributes;
  status?: GameStatus;
  skills?: AdventureSkill[];
  folders?: SkillFolder[];
  consultedSkills?: AdventureSkill[];
  adventureSettings?: AdventureSettings;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeText(value: unknown, fallback = "", maxLength = 8000) {
  return typeof value === "string" ? value.slice(0, maxLength) : fallback;
}

function normalizeRuntimeNumber(
  value: unknown,
  fallback: number,
  min: number,
  max: number
) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, value));
}

export function normalizeAdventureSettings(value: unknown): AdventureSettings {
  const defaults = DEFAULT_ADVENTURE_SETTINGS;

  if (!isRecord(value)) {
    return structuredClone(defaults);
  }

  const appearance = isRecord(value.appearance) ? value.appearance : {};
  const llm = isRecord(value.llm) ? value.llm : {};

  return {
    prompt: normalizeText(value.prompt, defaults.prompt, 20_000),
    additionalMemories: normalizeText(
      value.additionalMemories,
      defaults.additionalMemories,
      12_000
    ),
    skillsEnabled: value.skillsEnabled === false ? false : defaults.skillsEnabled,
    appearance: {
      theme: appearance.theme === "light" ? "light" : defaults.appearance.theme,
      ereaderTone: normalizeRuntimeNumber(
        appearance.ereaderTone,
        defaults.appearance.ereaderTone,
        0,
        100
      ),
      fontScale: normalizeRuntimeNumber(
        appearance.fontScale,
        defaults.appearance.fontScale,
        70,
        140
      ),
      lineHeight: normalizeRuntimeNumber(
        appearance.lineHeight,
        defaults.appearance.lineHeight,
        140,
        220
      ),
      contentWidth: normalizeRuntimeNumber(
        appearance.contentWidth,
        defaults.appearance.contentWidth,
        48,
        84
      ),
      typeface: appearance.typeface === "sans" ? "sans" : defaults.appearance.typeface,
      reducedMotion: appearance.reducedMotion === true
    },
    selectedModel: resolveOpenRouterModel(
      normalizeText(value.selectedModel, defaults.selectedModel, 120)
    ),
    llm: {
      temperature: normalizeRuntimeNumber(
        llm.temperature,
        defaults.llm.temperature,
        0,
        2
      ),
      maxCompletionTokens: normalizeRuntimeNumber(
        llm.maxCompletionTokens,
        defaults.llm.maxCompletionTokens,
        128,
        4096
      ),
      contextWindowTokens: normalizeRuntimeNumber(
        llm.contextWindowTokens,
        defaults.llm.contextWindowTokens,
        4096,
        1_000_000
      )
    }
  };
}

function formatStats(attributes?: GameAttributes) {
  if (!attributes) {
    return "";
  }

  const hasRuntimeStats = Object.values(attributes).some((value) => value > 0);

  if (!hasRuntimeStats) {
    return "";
  }

  return [
    "# STATS",
    `MEDO: ${attributes.fear}/100`,
    `FERIMENTOS: ${attributes.injuries}/100`,
    `FOME: ${attributes.hunger}/100`,
    `EXAUSTAO: ${attributes.exhaustion}/100`
  ].join("\n");
}

function formatItems(status?: GameStatus) {
  if (!status || status.inventory.length === 0) {
    return "";
  }

  const items = status.inventory.map((item) => `- ${item}`).join("\n");

  return ["# ITEMS", items].join("\n");
}

function formatLocation(status?: GameStatus) {
  if (!status || !status.location.trim()) {
    return "";
  }

  return ["# LOCALIZACAO", status.location.trim()].join("\n");
}

const DEFAULT_NARRATOR_PROMPT = [
  "Es o narrador de uma aventura de texto interativa em portugues.",
  "Responde em segunda pessoa, descrevendo o mundo e reagindo as acoes do jogador.",
  "Quando o jogador pergunta por factos (idade, nome, local, lore), responde com base nos factos relevantes.",
  "Em perguntas directas e simples (ex.: 'onde estou?', 'como me chamo?'), responde com uma ou duas frases curtas.",
  "Responde APENAS com texto de narracao. Nunca repitas instrucoes, titulos de skills, metadata, nem a acao do jogador.",
  "Nao quebres a quarta parede nem digas que nao sabes por seres uma IA."
].join(" ");

export function buildSystemPrompt(input: BuildSystemPromptInput) {
  const settings = normalizeAdventureSettings(input.adventureSettings);
  const skillsEnabled = isSkillsEnabled(settings);
  const sections = [
    settings.prompt.trim() || DEFAULT_NARRATOR_PROMPT,
    formatStats(input.attributes),
    formatItems(input.status),
    formatLocation(input.status),
    ...(skillsEnabled
      ? [
          formatSkillsIndexForPrompt(input.skills ?? [], input.folders ?? []),
          formatConsultedSkillsForPrompt(input.consultedSkills ?? [])
        ]
      : [])
  ].filter((section) => section.trim().length > 0);

  return sections.join("\n\n");
}

export function buildBaseSystemPrompt() {
  return "";
}

export function buildSummaryPrompt(
  cause: string,
  settings: AdventureSettings,
  skills: AdventureSkill[] = [],
  folders: SkillFolder[] = []
) {
  const normalized = normalizeAdventureSettings(settings);
  const sections = [
    normalized.prompt.trim(),
    `Resume o final da sessao de forma breve. Causa: ${cause}.`,
    ...(isSkillsEnabled(normalized)
      ? [formatSkillsIndexForPrompt(skills, folders)]
      : [])
  ].filter((section) => section.trim().length > 0);

  return sections.join("\n\n");
}
