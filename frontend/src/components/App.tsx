import { useState, type FormEvent } from "react";
import { requestNarration } from "../api/play";
import { useAmbientAudio } from "../audio/useAmbientAudio";
import {
  connectionFailureNarration,
  openingNarration
} from "../content/story";
import { uiText } from "../content/uiText";
import type { Turn } from "../types";
import { CommandInput } from "./CommandInput";
import { GameHeader } from "./GameHeader";
import { HistoryPanel } from "./HistoryPanel";
import { NarrationPanel } from "./NarrationPanel";

export function App() {
  const { isAmbientOn, toggleAmbient } = useAmbientAudio();
  const [currentReply, setCurrentReply] = useState(openingNarration);
  const [history, setHistory] = useState<Turn[]>([
    { role: "narrator", content: openingNarration }
  ]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);

  async function submitAction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = message.trim();

    if (!trimmed || isLoading) {
      return;
    }

    const playerTurn: Turn = { role: "player", content: trimmed };
    const nextHistory = [...history, playerTurn];

    setHistory(nextHistory);
    setMessage("");
    setIsLoading(true);
    setError("");

    try {
      const reply = await requestNarration(trimmed, nextHistory);
      const narratorTurn: Turn = { role: "narrator", content: reply };

      setCurrentReply(reply);
      setHistory((previous) => [...previous, narratorTurn]);
    } catch (caughtError) {
      const fallback =
        caughtError instanceof Error ? caughtError.message : uiText.connectionError;

      setError(fallback);
      setCurrentReply(connectionFailureNarration);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className={isHistoryOpen ? "game-shell" : "game-shell is-history-collapsed"}>
      <section className="play-area" aria-label={uiText.mainAriaLabel}>
        <GameHeader isAmbientOn={isAmbientOn} onToggleAmbient={toggleAmbient} />
        <NarrationPanel currentReply={currentReply} isLoading={isLoading} />
        <CommandInput
          isLoading={isLoading}
          message={message}
          onMessageChange={setMessage}
          onSubmit={submitAction}
        />
        {error ? <p className="error-text">{error}</p> : null}
      </section>

      <HistoryPanel
        history={history}
        isOpen={isHistoryOpen}
        onToggle={() => setIsHistoryOpen((current) => !current)}
      />
    </main>
  );
}
