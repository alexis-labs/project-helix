import { RotateCcw } from "lucide-react";
import { uiText } from "../content/uiText";

type GameHeaderProps = {
  onRestart: () => void;
  theme: "dark" | "light";
};

export function GameHeader({ onRestart, theme }: GameHeaderProps) {
  const logoSrc = theme === "light" ? "/images/black_on_white.png" : "/images/white_on_black.png";

  return (
    <header className="title-block">
      <img src={logoSrc} alt="Blindfold" className="game-logo" />
      <button
        aria-label={uiText.restartGameLabel}
        className="restart-game-button"
        onClick={onRestart}
        title={uiText.restartGameLabel}
        type="button"
      >
        <RotateCcw aria-hidden="true" size={15} strokeWidth={1.8} />
      </button>
    </header>
  );
}
