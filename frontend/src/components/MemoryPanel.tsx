import { useMemo } from "react";
import { uiText } from "../content/uiText";
import { listMemoryVariables } from "../game/adventureMemory";
import type { AdventureMemory, MemorySource } from "../types";

type MemoryPanelProps = {
  memory: AdventureMemory;
};

const sourceTags: Record<MemorySource, string> = {
  jogador: uiText.diaryTagPlayer,
  externo: uiText.diaryTagExternal,
  descoberta: uiText.diaryTagDiscovery
};

export function MemoryPanel({ memory }: MemoryPanelProps) {
  const notes = useMemo(
    () =>
      listMemoryVariables(memory).sort((left, right) =>
        left.description.localeCompare(right.description, "pt")
      ),
    [memory]
  );

  return (
    <section aria-label={uiText.diaryAriaLabel} className="diary-view">
      <h2 className="diary-view-title">{uiText.diaryTitle}</h2>

      {notes.length === 0 ? (
        <p className="diary-view-empty">{uiText.diaryEmpty}</p>
      ) : (
        <ul className="diary-view-list">
          {notes.map((note) => (
            <li className="diary-note" key={note.key}>
              <p className="diary-note-text">{note.description}</p>
              <span className={`diary-tag diary-tag-${note.source}`}>
                {sourceTags[note.source]}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
