import { Volume2 } from "lucide-react";
import { uiText } from "../content/uiText";
import blindfoldLogo from "../images/blindfold_logo.png";

type GameHeaderProps = {
  isAmbientOn: boolean;
  onToggleAmbient: () => void;
};

export function GameHeader({ isAmbientOn, onToggleAmbient }: GameHeaderProps) {
  return (
    <header className="title-block">
      <div>
        <img src={blindfoldLogo} alt="Blindfold" className="site-logo" />
        <p>{uiText.subtitle}</p>
      </div>
      <button
        aria-label={isAmbientOn ? uiText.audioOnLabel : uiText.audioOffLabel}
        aria-pressed={isAmbientOn}
        className={isAmbientOn ? "audio-mark is-active" : "audio-mark"}
        onClick={onToggleAmbient}
        title={isAmbientOn ? uiText.audioOnLabel : uiText.audioOffLabel}
        type="button"
      >
        <Volume2 size={16} strokeWidth={1.5} />
      </button>
    </header>
  );
}
