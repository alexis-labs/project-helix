import { useEffect, useMemo, useRef, useState } from "react";
import { loadingNarration } from "../content/story";
import { uiText } from "../content/uiText";
import type { AttributeKey } from "../game/attributeChanges";
import { AttributeChangeList } from "./AttributeChangeList";

type NarrationPanelProps = {
  attributeChanges?: Partial<Record<AttributeKey, number>> | null;
  currentAction: string;
  currentReply: string;
  isLoading: boolean;
};

export function NarrationPanel({
  attributeChanges,
  currentAction,
  currentReply,
  isLoading
}: NarrationPanelProps) {
  const targetText = isLoading ? loadingNarration : currentReply;
  const shouldReduceMotion = useMemo(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );
  const [displayedText, setDisplayedText] = useState(targetText);
  const panelRef = useRef<HTMLElement>(null);
  const showAttributeChanges =
    !isLoading && displayedText === targetText && Boolean(currentAction);

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

  useEffect(() => {
    panelRef.current?.scrollTo({ top: 0 });
  }, [currentAction, targetText]);

  useEffect(() => {
    const panel = panelRef.current;

    if (!panel) {
      return;
    }

    panel.scrollTop = panel.scrollHeight;
  }, [currentAction, displayedText]);

  return (
    <article className="narration-panel" aria-live="polite" ref={panelRef}>
      {currentAction ? (
        <div className="current-action">
          <span>{uiText.currentActionLabel}</span>
          <p>{currentAction}</p>
        </div>
      ) : null}
      <span className="speaker">{uiText.narratorLabel}</span>
      <p aria-label={targetText} className="typewriter-text">
        {displayedText}
        {!shouldReduceMotion && !isLoading ? (
          <span aria-hidden="true" className="text-cursor" />
        ) : null}
      </p>
      {showAttributeChanges ? (
        <AttributeChangeList
          changes={attributeChanges}
          className="attribute-change-list--chat"
        />
      ) : null}
    </article>
  );
}
