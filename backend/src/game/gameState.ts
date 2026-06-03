import type { GameAttributes, GameStatus } from "../../../shared/types.ts";

function clampAttribute(value: unknown) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return undefined;
  }

  return Math.min(100, Math.max(0, Math.round(value)));
}

export function normalizeAttributes(value: unknown): GameAttributes | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Record<string, unknown>;
  const fear = clampAttribute(record.fear);
  const injuries = clampAttribute(record.injuries);
  const hunger = clampAttribute(record.hunger);
  const exhaustion = clampAttribute(record.exhaustion);

  if (
    fear === undefined ||
    injuries === undefined ||
    hunger === undefined ||
    exhaustion === undefined
  ) {
    return undefined;
  }

  return { fear, injuries, hunger, exhaustion };
}

export function normalizeStatus(value: unknown): GameStatus | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Record<string, unknown>;
  const location =
    typeof record.location === "string" ? record.location.trim().slice(0, 160) : undefined;

  if (!location) {
    return undefined;
  }

  const inventory = Array.isArray(record.inventory)
    ? record.inventory
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim().slice(0, 120))
        .filter(Boolean)
        .slice(0, 24)
    : [];

  return { location, inventory };
}
