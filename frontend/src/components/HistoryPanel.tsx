import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { uiText } from "../content/uiText";
import type { Turn } from "../types";

type HistoryPanelProps = {
  history: Turn[];
};

export function HistoryPanel({ history }: HistoryPanelProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <aside
      className={isOpen ? "history-panel is-open" : "history-panel"}
      aria-label={uiText.historyAriaLabel}
    >
      <div className="history-heading">
        <h2>{uiText.historyTitle}</h2>
        <button
          aria-expanded={isOpen}
          aria-label={isOpen ? "Fechar histórico" : "Abrir histórico"}
          className="history-toggle"
          onClick={() => setIsOpen((current) => !current)}
          type="button"
        >
          <ChevronDown size={18} strokeWidth={1.6} />
        </button>
      </div>
      <div className="history-list" aria-hidden={!isOpen}>
        {history.map((turn, index) => (
          <div className="history-turn" key={`${turn.role}-${index}`}>
            <span>{turn.role === "player" ? uiText.playerLabel : uiText.narratorLabel}</span>
            <p>{turn.content}</p>
          </div>
        ))}
      </div>
    </aside>
  );
}
