import { useMemo, useRef, useEffect } from "react";
import { uiText } from "../content/uiText";
import { buildDiaryEntries, filterDiaryEntries } from "../game/diaryEntries";
import { AttributeChangeList } from "./AttributeChangeList";
import { DiaryHighlight } from "./DiaryHighlight";
import type { Turn } from "../types";

type StorySearchResultsProps = {
  history: Turn[];
  query: string;
};

export function StorySearchResults({ history, query }: StorySearchResultsProps) {
  const scrollRef = useRef<HTMLElement>(null);
  const allEntries = useMemo(() => buildDiaryEntries(history), [history]);
  const visibleEntries = useMemo(
    () =>
      filterDiaryEntries(allEntries, query, {
        player: uiText.playerLabel,
        narrator: uiText.narratorLabel
      }),
    [allEntries, query]
  );

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [query]);

  return (
    <article
      aria-label={uiText.diarySearchResultsAriaLabel}
      className="story-search-results narration-panel"
      ref={scrollRef}
    >
      {visibleEntries.length === 0 ? (
        <p className="story-search-empty">{uiText.diaryNoResults}</p>
      ) : (
        <ol className="diary-list">
          {visibleEntries.map((entry) => (
            <li className="diary-entry" key={entry.id}>
              <header className="diary-entry-header">
                <span className="diary-entry-index">
                  {uiText.diaryEntryLabel(entry.index)}
                </span>
              </header>
              {entry.turns.map((turn, turnIndex) => {
                const isPlayer = turn.role === "player";

                return (
                  <section
                    className={[
                      "diary-passage",
                      isPlayer ? "is-player" : "is-narrator"
                    ].join(" ")}
                    key={`${entry.id}-${turn.role}-${turnIndex}`}
                  >
                    <h3 className="diary-passage-heading">
                      {isPlayer ? uiText.diaryPlayerHeading : uiText.diaryNarratorHeading}
                    </h3>
                    <p>
                      <DiaryHighlight query={query} text={turn.content} />
                    </p>
                    {turn.attributeChanges ? (
                      <AttributeChangeList
                        changes={turn.attributeChanges}
                        className="attribute-change-list--diary"
                      />
                    ) : null}
                  </section>
                );
              })}
            </li>
          ))}
        </ol>
      )}
    </article>
  );
}
