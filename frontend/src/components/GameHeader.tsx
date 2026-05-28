import { Moon, Sun, Volume2 } from "lucide-react";
import { uiText } from "../content/uiText";

type GameHeaderProps = {
  isAmbientOn: boolean;
  isLightTheme: boolean;
  onToggleAmbient: () => void;
  onToggleTheme: () => void;
};

export function GameHeader({
  isAmbientOn,
  isLightTheme,
  onToggleAmbient,
  onToggleTheme
}: GameHeaderProps) {
  const titleSplitIndex = 5;
  const titleStart = uiText.title.slice(0, titleSplitIndex);
  const titleEnd = uiText.title.slice(titleSplitIndex);
  const ThemeIcon = isLightTheme ? Moon : Sun;

  return (
    <header className="title-block">
      <div>
        <h1 aria-label={uiText.title}>
          <span aria-hidden="true" className="title-word">
            <span className="title-word-start">{titleStart}</span>
            <span className="title-word-end">{titleEnd}</span>
          </span>
        </h1>
        <p>{uiText.subtitle}</p>
      </div>
      <div className="header-actions">
        <button
          aria-label={isLightTheme ? uiText.themeDarkLabel : uiText.themeLightLabel}
          aria-pressed={isLightTheme}
          className="icon-mark"
          onClick={onToggleTheme}
          title={isLightTheme ? uiText.themeDarkLabel : uiText.themeLightLabel}
          type="button"
        >
          <ThemeIcon size={16} strokeWidth={1.5} />
        </button>
        <button
          aria-label={isAmbientOn ? uiText.audioOnLabel : uiText.audioOffLabel}
          aria-pressed={isAmbientOn}
          className={isAmbientOn ? "icon-mark is-active" : "icon-mark"}
          onClick={onToggleAmbient}
          title={isAmbientOn ? uiText.audioOnLabel : uiText.audioOffLabel}
          type="button"
        >
          <Volume2 size={16} strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
}
