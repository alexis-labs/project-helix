import { RotateCcw } from "lucide-react";
import type { CriticalAttribute } from "../game/attributes";
import { uiText } from "../content/uiText";

type GameOverPanelProps = {
  cause: CriticalAttribute;
  summary: string;
  isLoading: boolean;
  onReturnToMenu: () => void;
};

export function GameOverPanel({
  cause,
  summary,
  isLoading,
  onReturnToMenu
}: GameOverPanelProps) {
  return (
    <article
      aria-busy={isLoading}
      aria-labelledby="game-over-title"
      className="game-over-panel"
    >
      <header className="game-over-header">
        <p className="game-over-eyebrow">{uiText.gameOverEyebrow}</p>
        <h2 id="game-over-title">{uiText.gameOverTitle}</h2>
        <p className="game-over-cause">{uiText.gameOverCause(cause)}</p>
      </header>

      <section aria-label={uiText.gameOverSummaryLabel} className="game-over-summary">
        {isLoading ? (
          <p className="game-over-loading">{uiText.gameOverSummaryLoading}</p>
        ) : (
          summary.split("\n\n").map((paragraph) => (
            <p key={paragraph.slice(0, 48)}>{paragraph}</p>
          ))
        )}
      </section>

      <footer className="game-over-actions">
        <button
          className="main-menu-button main-menu-button--primary"
          disabled={isLoading}
          onClick={onReturnToMenu}
          type="button"
        >
          <RotateCcw aria-hidden="true" size={18} strokeWidth={2.25} />
          <span>{uiText.gameOverReturnToMenu}</span>
        </button>
      </footer>
    </article>
  );
}
