import { uiText } from "../content/uiText";
import type { Turn } from "../types";

type HistoryPanelProps = {
  history: Turn[];
};

export function HistoryPanel({ history }: HistoryPanelProps) {
  return (
    <aside className="history-panel" aria-label={uiText.historyAriaLabel}>
      <h2>{uiText.historyTitle}</h2>
      <div className="history-list">
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
