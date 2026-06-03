import type { Turn } from "../types";

export type DiaryEntry = {
  id: string;
  index: number;
  turns: Turn[];
};

export function buildDiaryEntries(history: Turn[]): DiaryEntry[] {
  const entries: DiaryEntry[] = [];
  let cursor = 0;
  let entryIndex = 0;

  while (cursor < history.length) {
    const turn = history[cursor];
    const turns: Turn[] = [turn];

    if (
      turn.role === "player" &&
      cursor + 1 < history.length &&
      history[cursor + 1].role === "narrator"
    ) {
      turns.push(history[cursor + 1]);
      cursor += 2;
    } else {
      cursor += 1;
    }

    entryIndex += 1;
    entries.push({
      id: `diary-${entryIndex}`,
      index: entryIndex,
      turns
    });
  }

  return entries;
}

function entrySearchBlob(entry: DiaryEntry, playerLabel: string, narratorLabel: string) {
  return entry.turns
    .map((turn) => {
      const roleLabel = turn.role === "player" ? playerLabel : narratorLabel;
      return `${roleLabel} ${turn.content}`;
    })
    .join("\n")
    .toLowerCase();
}

export function filterDiaryEntries(
  entries: DiaryEntry[],
  query: string,
  labels: { player: string; narrator: string }
): DiaryEntry[] {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return entries;
  }

  return entries.filter((entry) =>
    entrySearchBlob(entry, labels.player, labels.narrator).includes(normalized)
  );
}

export function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
