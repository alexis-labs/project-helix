import { useEffect, useState, type FormEvent } from "react";
import { Moon, Sun, Volume2 } from "lucide-react";
import { requestNarration } from "../api/play";
import { useAmbientAudio } from "../audio/useAmbientAudio";
import {
  connectionFailureNarration,
  openingNarration
} from "../content/story";
import { uiText } from "../content/uiText";
import type { SidebarAction, Turn } from "../types";
import { CommandInput } from "./CommandInput";
import { GameHeader } from "./GameHeader";
import { HistoryPanel } from "./HistoryPanel";
import { NarrationPanel } from "./NarrationPanel";

export function App() {
  const { isAmbientOn, toggleAmbient } = useAmbientAudio();
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const savedTheme = window.localStorage.getItem("blindfold-theme");

    return savedTheme === "light" ? "light" : "dark";
  });
  const [currentReply, setCurrentReply] = useState(openingNarration);
  const [currentAction, setCurrentAction] = useState("");
  const [history, setHistory] = useState<Turn[]>([
    { role: "narrator", content: openingNarration }
  ]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const isLightTheme = theme === "light";
  const sidebarActions: SidebarAction[] = [
    {
      id: "theme",
      label: isLightTheme ? uiText.themeDarkLabel : uiText.themeLightLabel,
      icon: isLightTheme ? Moon : Sun,
      isPressed: isLightTheme,
      onClick: () =>
        setTheme((currentTheme) => (currentTheme === "light" ? "dark" : "light"))
    },
    {
      id: "audio",
      label: isAmbientOn ? uiText.audioOnLabel : uiText.audioOffLabel,
      icon: Volume2,
      isActive: isAmbientOn,
      isPressed: isAmbientOn,
      onClick: toggleAmbient
    }
  ];

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("blindfold-theme", theme);
  }, [theme]);

  async function submitAction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = message.trim();

    if (!trimmed || isLoading) {
      return;
    }

    const playerTurn: Turn = { role: "player", content: trimmed };
    const nextHistory = [...history, playerTurn];

    setCurrentAction(trimmed);
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
        <GameHeader />
        <NarrationPanel
          currentAction={currentAction}
          currentReply={currentReply}
          isLoading={isLoading}
        />
        <CommandInput
          isLoading={isLoading}
          message={message}
          onMessageChange={setMessage}
          onSubmit={submitAction}
        />
        {error ? <p className="error-text">{error}</p> : null}
      </section>

      <HistoryPanel
        actions={sidebarActions}
        history={history}
        isOpen={isHistoryOpen}
        onToggle={() => setIsHistoryOpen((current) => !current)}
      />
    </main>
  );
}
