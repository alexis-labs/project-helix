import {
  DEFAULT_ADVENTURE_SETTINGS,
  type AdventureSettings,
  type StoryCard
} from "../../../../shared/adventureSettings.ts";
import type { ClientTurn } from "../types.ts";

const MAX_TEXT_LENGTH = 1600;
const MAX_CARD_COUNT = 24;
const MAX_TRIGGER_COUNT = 8;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeText(value: unknown, fallback = "", maxLength = MAX_TEXT_LENGTH) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : fallback;
}

function normalizeBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function normalizeStringList(value: unknown, fallback: string[], maxItems: number) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const entries = value
    .map((entry) => normalizeText(entry, "", 80))
    .filter((entry) => entry.length > 0)
    .slice(0, maxItems);

  return entries.length > 0 ? entries : fallback;
}

function normalizeStoryCard(value: unknown, index: number): StoryCard | null {
  if (!isRecord(value)) {
    return null;
  }

  const title = normalizeText(value.title, "", 90);
  const text = normalizeText(value.text, "", 1200);

  if (!title || !text) {
    return null;
  }

  return {
    id: normalizeText(value.id, `card-${index + 1}`, 60) || `card-${index + 1}`,
    title,
    triggers: normalizeStringList(value.triggers, [], MAX_TRIGGER_COUNT),
    text,
    isActive: normalizeBoolean(value.isActive, true)
  };
}

export function normalizeAdventureSettings(value: unknown): AdventureSettings {
  if (!isRecord(value)) {
    return DEFAULT_ADVENTURE_SETTINGS;
  }

  const defaults = DEFAULT_ADVENTURE_SETTINGS;
  const plot = isRecord(value.plot) ? value.plot : {};
  const details = isRecord(value.details) ? value.details : {};
  const appearance = isRecord(value.appearance) ? value.appearance : {};
  const rawCards = Array.isArray(value.storyCards) ? value.storyCards : [];
  const storyCards = rawCards
    .map(normalizeStoryCard)
    .filter((card): card is StoryCard => card !== null)
    .slice(0, MAX_CARD_COUNT);

  return {
    plot: {
      aiInstructions: normalizeText(
        plot.aiInstructions,
        defaults.plot.aiInstructions
      ),
      storySummary: normalizeText(plot.storySummary, defaults.plot.storySummary),
      plotEssentials: normalizeText(
        plot.plotEssentials,
        defaults.plot.plotEssentials
      ),
      authorNote: normalizeText(plot.authorNote, defaults.plot.authorNote, 900),
      thirdPerson: normalizeBoolean(plot.thirdPerson, defaults.plot.thirdPerson)
    },
    storyCards: storyCards.length > 0 ? storyCards : defaults.storyCards,
    details: {
      title: normalizeText(details.title, defaults.details.title, 90),
      description: normalizeText(
        details.description,
        defaults.details.description,
        500
      ),
      tags: normalizeStringList(details.tags, defaults.details.tags, 8),
      visibility:
        details.visibility === "local" || details.visibility === "private"
          ? details.visibility
          : defaults.details.visibility,
      rating:
        details.rating === "teen" || details.rating === "mature"
          ? details.rating
          : defaults.details.rating
    },
    appearance: {
      theme: appearance.theme === "light" ? "light" : defaults.appearance.theme,
      ereaderTone:
        typeof appearance.ereaderTone === "number"
          ? Math.min(100, Math.max(0, appearance.ereaderTone))
          : defaults.appearance.ereaderTone,
      fontScale:
        typeof appearance.fontScale === "number"
          ? Math.min(130, Math.max(85, appearance.fontScale))
          : defaults.appearance.fontScale
    },
    selectedModel: normalizeText(
      value.selectedModel,
      defaults.selectedModel,
      120
    )
  };
}

function findTriggeredCards(
  storyCards: StoryCard[],
  message: string,
  history: ClientTurn[]
) {
  const recentText = [message, ...history.slice(-4).map((turn) => turn.content)]
    .join("\n")
    .toLocaleLowerCase("pt-PT");

  return storyCards.filter((card) => {
    if (!card.isActive) {
      return false;
    }

    if (card.triggers.length === 0) {
      return false;
    }

    return card.triggers.some((trigger) =>
      recentText.includes(trigger.toLocaleLowerCase("pt-PT"))
    );
  });
}

export function formatAdventureSettingsForPrompt(
  settings: AdventureSettings,
  message: string,
  history: ClientTurn[]
) {
  const sections = [
    "# DEFINIÇÕES DA AVENTURA",
    `Título: ${settings.details.title}`,
    `Descrição: ${settings.details.description}`,
    `Tags: ${settings.details.tags.join(", ")}`,
    "",
    "Instruções de IA:",
    settings.plot.aiInstructions,
    "",
    "Resumo da história:",
    settings.plot.storySummary,
    "",
    "Essenciais do enredo:",
    settings.plot.plotEssentials,
    "",
    "Nota do autor:",
    settings.plot.authorNote,
    "",
    settings.plot.thirdPerson
      ? "Usa terceira pessoa para referir Jack."
      : "Usa segunda pessoa para falar com o jogador."
  ];
  const triggeredCards = findTriggeredCards(settings.storyCards, message, history);

  if (triggeredCards.length > 0) {
    sections.push(
      "",
      "# STORY CARDS ACTIVOS",
      ...triggeredCards.map((card) => `${card.title}: ${card.text}`)
    );
  }

  return sections.join("\n");
}
