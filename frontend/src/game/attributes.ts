import type { GameAttributes } from "../types";

export const ATTRIBUTE_MAX = 100;

export type CriticalAttribute = keyof GameAttributes;

const CRITICAL_ATTRIBUTE_ORDER: CriticalAttribute[] = [
  "injuries",
  "fear",
  "exhaustion",
  "hunger"
];

export function clampAttributes(attributes: GameAttributes): GameAttributes {
  return {
    fear: Math.min(Math.max(attributes.fear, 0), ATTRIBUTE_MAX),
    injuries: Math.min(Math.max(attributes.injuries, 0), ATTRIBUTE_MAX),
    hunger: Math.min(Math.max(attributes.hunger, 0), ATTRIBUTE_MAX),
    exhaustion: Math.min(Math.max(attributes.exhaustion, 0), ATTRIBUTE_MAX)
  };
}

export function getCriticalAttribute(
  attributes: GameAttributes
): CriticalAttribute | null {
  for (const key of CRITICAL_ATTRIBUTE_ORDER) {
    if (attributes[key] >= ATTRIBUTE_MAX) {
      return key;
    }
  }

  return null;
}

export function hasAttributeAtMax(attributes: GameAttributes) {
  return getCriticalAttribute(attributes) !== null;
}
