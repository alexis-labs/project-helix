import { Volume2 } from "lucide-react";
import { uiText } from "../content/uiText";

export function GameHeader() {
  return (
    <header className="title-block">
      <div>
        <h1>{uiText.title}</h1>
        <p>{uiText.subtitle}</p>
      </div>
      <div className="audio-mark" aria-hidden="true">
        <Volume2 size={20} strokeWidth={1.4} />
      </div>
    </header>
  );
}
