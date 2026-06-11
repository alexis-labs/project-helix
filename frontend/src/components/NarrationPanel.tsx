import { useEffect, useMemo, useRef, useState } from "react";
import { loadingNarration } from "../content/story";
import { uiText } from "../content/uiText";
import type { AttributeKey } from "../game/attributeChanges";
import type { Turn } from "../types";
import type { LlmDebugPayload } from "../../../shared/llmDebug";
import { AttributeChangeList } from "./AttributeChangeList";
import { LlmDebugContent, LlmDebugTrigger } from "./LlmDebugPanel";

type NarrationPanelProps = {
  attributeChanges?: Partial<Record<AttributeKey, number>> | null;
  currentAction: string;
  currentReply: string;
  history: Turn[];
  isLoading: boolean;
  llmDebug?: LlmDebugPayload | null;
};

export function NarrationPanel({
  attributeChanges,
  currentAction,
  currentReply,
  history,
  isLoading,
  llmDebug = null
}: NarrationPanelProps) {
  const targetText = isLoading ? loadingNarration : currentReply;
  const shouldReduceMotion = useMemo(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );
  const [displayedText, setDisplayedText] = useState(targetText);
  const [debugOpen, setDebugOpen] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const showAttributeChanges =
    !isLoading && displayedText === targetText && Boolean(currentAction);
  const showDebug = !isLoading && Boolean(currentAction) && Boolean(llmDebug);
  const visibleHistory = isLoading
    ? [...history, { role: "narrator" as const, content: loadingNarration }]
    : history.length > 0
      ? history
      : currentReply
        ? [{ role: "narrator" as const, content: currentReply }]
        : [];
  const latestNarratorIndex = [...visibleHistory]
    .reverse()
    .findIndex((turn) => turn.role === "narrator");
  const latestNarratorTurnIndex =
    latestNarratorIndex === -1
      ? -1
      : visibleHistory.length - 1 - latestNarratorIndex;

  useEffect(() => {
    setDebugOpen(false);
  }, [currentAction]);

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
    const panel = panelRef.current;

    if (!panel) {
      return;
    }

    panel.scrollTo({
      top: panel.scrollHeight,
      behavior: shouldReduceMotion ? "auto" : "smooth"
    });
  }, [currentAction, displayedText, shouldReduceMotion, visibleHistory.length]);

  return (
    <article className="narration-panel" aria-live="polite" ref={panelRef}>
      <div className="chat-turn-list">
        {visibleHistory.map((turn, index) => {
          const isLatestNarrator =
            turn.role === "narrator" && index === latestNarratorTurnIndex;
          const text = isLatestNarrator ? displayedText : turn.content;

          if (!text.trim()) {
            return null;
          }

          return (
            <section
              className={[
                "chat-turn",
                turn.role === "player" ? "is-player" : "is-narrator"
              ].join(" ")}
              key={`${turn.role}-${index}-${turn.content.slice(0, 24)}`}
            >
              <div className="narration-speaker-block">
                <div className="narration-speaker-row">
                  <span className="speaker">
                    {turn.role === "player"
                      ? uiText.currentActionLabel
                      : uiText.narratorLabel}
                  </span>
                  {isLatestNarrator && showDebug ? (
                    <LlmDebugTrigger
                      debug={llmDebug}
                      isOpen={debugOpen}
                      onToggle={() => setDebugOpen((open) => !open)}
                    />
                  ) : null}
                </div>
                {isLatestNarrator && debugOpen && llmDebug ? (
                  <LlmDebugContent debug={llmDebug} />
                ) : null}
              </div>
              <p
                aria-label={isLatestNarrator ? targetText : turn.content}
                className={isLatestNarrator ? "typewriter-text" : undefined}
              >
                {text}
                {isLatestNarrator && !shouldReduceMotion && !isLoading ? (
                  <span aria-hidden="true" className="text-cursor" />
                ) : null}
              </p>
            </section>
          );
        })}
      </div>
      {showAttributeChanges ? (
        <AttributeChangeList
          changes={attributeChanges}
          className="attribute-change-list--chat"
        />
      ) : null}
    </article>
  );
}
