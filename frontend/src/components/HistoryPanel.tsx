import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { useEffect, useRef } from "react";
import { uiText } from "../content/uiText";
import type { Turn } from "../types";

type HistoryPanelProps = {
  history: Turn[];
  isOpen: boolean;
  onToggle: () => void;
};

export function HistoryPanel({ history, isOpen, onToggle }: HistoryPanelProps) {
  const listRef = useRef<HTMLOListElement>(null);
  const ToggleIcon = isOpen ? PanelRightClose : PanelRightOpen;

  useEffect(() => {
    const list = listRef.current;

    if (!list || !isOpen) {
      return;
    }

    list.scrollTop = list.scrollHeight;
  }, [history, isOpen]);

  return (
    <aside
      className={isOpen ? "history-panel is-open" : "history-panel"}
      aria-label={uiText.historyAriaLabel}
    >
      <div className="history-heading">
        <h2>{uiText.historyTitle}</h2>
        <button
          aria-expanded={isOpen}
          aria-label={isOpen ? uiText.historyCollapseLabel : uiText.historyExpandLabel}
          className="history-toggle"
          onClick={onToggle}
          type="button"
        >
          <ToggleIcon size={17} strokeWidth={1.8} aria-hidden="true" />
        </button>
      </div>
      <ol className="history-list" aria-hidden={!isOpen} ref={listRef}>
        {history.map((turn, index) => (
          <li className="history-turn" key={`${turn.role}-${index}`}>
            <div className="history-meta">
              <span className="history-index">{String(index + 1).padStart(2, "0")}</span>
              <span className="history-role">
                {turn.role === "player" ? uiText.playerLabel : uiText.narratorLabel}
              </span>
            </div>
            <p>{turn.content}</p>
          </li>
        ))}
      </ol>
    </aside>
  );
}
