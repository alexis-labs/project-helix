import { formatMemoryForPrompt } from "../memory.ts";
import type { MemoryVariable } from "../types.ts";
import type { GameAttributes, GameStatus } from "../../../../shared/types.ts";
import { attributeSystem } from "./attributeSystem.ts";
import {
  formatCharacterSection,
  formatInitialStateSection
} from "./character.ts";
import { formatItemsSection } from "./items.ts";
import { narratorRules } from "./narratorRules.ts";
import { npcs } from "./npcs.ts";
import { responseFormat } from "./responseFormat.ts";
import { formatRuntimeStateForPrompt } from "./stateContext.ts";
import { formatStoryWorldSection } from "./storyWorld.ts";
import { storyBeats } from "./storyBeats.ts";

const SECTION_SEPARATOR = "\n\n---\n\n";

export type BuildSystemPromptInput = {
  memory: MemoryVariable[];
  attributes?: GameAttributes;
  status?: GameStatus;
};

export function buildSystemPrompt(input: BuildSystemPromptInput) {
  const sections = [
    narratorRules,
    attributeSystem,
    formatCharacterSection(),
    formatInitialStateSection(),
    formatStoryWorldSection(),
    formatItemsSection(),
    npcs,
    storyBeats,
    responseFormat,
    formatMemoryForPrompt(input.memory),
    formatRuntimeStateForPrompt(input.attributes, input.status)
  ].filter((section) => section.trim().length > 0);

  return sections.join(SECTION_SEPARATOR);
}

export function buildBaseSystemPrompt() {
  return buildSystemPrompt({ memory: [] });
}
