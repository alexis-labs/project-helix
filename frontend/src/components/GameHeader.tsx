import { Volume2 } from "lucide-react";
import { uiText } from "../content/uiText";

type GameHeaderProps = {
  isAmbientOn: boolean;
  onToggleAmbient: () => void;
};

export function GameHeader({ isAmbientOn, onToggleAmbient }: GameHeaderProps) {
  const titleSplitIndex = 5;
  const titleStart = uiText.title.slice(0, titleSplitIndex);
  const titleEnd = uiText.title.slice(titleSplitIndex);

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
