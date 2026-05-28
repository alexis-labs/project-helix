import { useEffect, useMemo, useState } from "react";
import { loadingNarration } from "../content/story";
import { uiText } from "../content/uiText";

type NarrationPanelProps = {
  currentReply: string;
  isLoading: boolean;
};

export function NarrationPanel({ currentReply, isLoading }: NarrationPanelProps) {
  const targetText = isLoading ? loadingNarration : currentReply;
  const shouldReduceMotion = useMemo(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );
  const [displayedText, setDisplayedText] = useState(targetText);

  useEffect(() => {
    if (shouldReduceMotion || isLoading) {
      setDisplayedText(targetText);
      return;
    }

    setDisplayedText("");

    let index = 0;
    const intervalId = window.setInterval(() => {
      index += 1;
      setDisplayedText(targetText.slice(0, index));

      if (index >= targetText.length) {
        window.clearInterval(intervalId);
      }
    }, 18);

    return () => window.clearInterval(intervalId);
  }, [isLoading, shouldReduceMotion, targetText]);

  return (
    <article className="narration-panel" aria-live="polite">
      <span className="speaker">{uiText.narratorLabel}</span>
      <p aria-label={targetText} className="typewriter-text">
        {displayedText}
        {!shouldReduceMotion && !isLoading ? (
          <span aria-hidden="true" className="text-cursor" />
        ) : null}
      </p>
    </article>
  );
}
