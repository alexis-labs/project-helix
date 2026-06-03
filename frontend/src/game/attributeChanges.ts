import { uiText } from "../content/uiText";
import type { GameAttributes } from "../types";

export type AttributeKey = keyof GameAttributes;

export const ATTRIBUTE_KEYS: AttributeKey[] = [
  "fear",
  "injuries",
  "hunger",
  "exhaustion"
];

export function getAttributeDeltas(
  previous: GameAttributes,
  next: GameAttributes
): Partial<Record<AttributeKey, number>> {
  const deltas: Partial<Record<AttributeKey, number>> = {};

  for (const key of ATTRIBUTE_KEYS) {
    const delta = next[key] - previous[key];

    if (delta !== 0) {
      deltas[key] = delta;
    }
  }

  return deltas;
}

export function hasAttributeDeltas(
  deltas: Partial<Record<AttributeKey, number>> | null | undefined
): deltas is Partial<Record<AttributeKey, number>> {
  return Boolean(deltas && Object.keys(deltas).length > 0);
}

export function formatAttributeChangesForSearch(
  changes: Partial<Record<AttributeKey, number>>
) {
  return ATTRIBUTE_KEYS.filter((key) => changes[key] !== undefined)
    .map((key) => uiText.attributeChangeLabel(changes[key]!, uiText.attributeNames[key]))
    .join(" ");
}
