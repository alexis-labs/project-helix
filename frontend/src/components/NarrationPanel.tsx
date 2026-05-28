import { loadingNarration } from "../content/story";
import { uiText } from "../content/uiText";

type NarrationPanelProps = {
  currentReply: string;
  isLoading: boolean;
};

export function NarrationPanel({ currentReply, isLoading }: NarrationPanelProps) {
  return (
    <article className="narration-panel" aria-live="polite">
      <span className="speaker">{uiText.narratorLabel}</span>
      <p>{isLoading ? loadingNarration : currentReply}</p>
    </article>
  );
}
