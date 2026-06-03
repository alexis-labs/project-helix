import { Search, X } from "lucide-react";
import { uiText } from "../content/uiText";

type StorySearchBarProps = {
  onQueryChange: (value: string) => void;
  query: string;
  resultCount: number;
  totalEntries: number;
};

export function StorySearchBar({
  onQueryChange,
  query,
  resultCount,
  totalEntries
}: StorySearchBarProps) {
  const isSearching = query.trim().length > 0;

  return (
    <div className="story-search">
      <label className="story-search-field" htmlFor="story-search-input">
        <Search aria-hidden="true" size={15} strokeWidth={1.8} />
        <input
          aria-label={uiText.diarySearchLabel}
          autoComplete="off"
          id="story-search-input"
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={uiText.diarySearchPlaceholder}
          spellCheck={false}
          type="search"
          value={query}
        />
        {query ? (
          <button
            aria-label={uiText.diarySearchClear}
            className="story-search-clear"
            onClick={() => onQueryChange("")}
            type="button"
          >
            <X aria-hidden="true" size={14} strokeWidth={2} />
          </button>
        ) : null}
      </label>
      {isSearching ? (
        <p className="story-search-meta" aria-live="polite">
          {uiText.diaryResultsLabel(resultCount, totalEntries)}
        </p>
      ) : (
        <p className="story-search-hint">{uiText.diarySearchHint}</p>
      )}
    </div>
  );
}
