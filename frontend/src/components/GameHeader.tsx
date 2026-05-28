import { Volume2 } from "lucide-react";
import { uiText } from "../content/uiText";

type GameHeaderProps = {
  isAmbientOn: boolean;
  onToggleAmbient: () => void;
};

export function GameHeader({ isAmbientOn, onToggleAmbient }: GameHeaderProps) {
  return (
    <header className="title-block">
      <div>
        <h1>{uiText.title}</h1>
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
        <Volume2 size={20} strokeWidth={1.4} />
      </button>
    </header>
  );
}
