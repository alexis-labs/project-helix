import { useEffect, useState, type FormEvent } from "react";
import { Moon, Sun, Volume2 } from "lucide-react";
import { requestNarration } from "../api/play";
import { useAmbientAudio } from "../audio/useAmbientAudio";
import {
  connectionFailureNarration,
  openingNarration
} from "../content/story";
import { uiText } from "../content/uiText";
import type { SidebarAction, Turn, GameAttributes } from "../types";
import { CommandInput } from "./CommandInput";
import { GameHeader } from "./GameHeader";
import { HistoryPanel } from "./HistoryPanel";
import { NarrationPanel } from "./NarrationPanel";

const INITIAL_ATTRIBUTES: GameAttributes = {
  fear: 20,
  injuries: 0,
  hunger: 10,
  exhaustion: 15
};

function stripUiStateBlock(narratorResponse: string) {
  const lines = narratorResponse.split("\n");
  const stateBlockStart = lines.findIndex((line) =>
    /^(ESTADO_UI:|MEDO:)/i.test(line.trim())
  );

  if (stateBlockStart === -1) {
    return narratorResponse.trim();
  }

  return lines.slice(0, stateBlockStart).join("\n").trim();
}

function extractAttributes(narratorResponse: string): GameAttributes | null {
  const lines = narratorResponse.split("\n");
  const attributes: Partial<GameAttributes> = {};

  for (const line of lines) {
    if (line.includes("MEDO:")) {
      const match = line.match(/MEDO:\s*(\d+)/);
      if (match) attributes.fear = parseInt(match[1], 10);
    } else if (line.includes("FERIMENTOS:")) {
      const match = line.match(/FERIMENTOS:\s*(\d+)/);
      if (match) attributes.injuries = parseInt(match[1], 10);
    } else if (line.includes("FOME:")) {
      const match = line.match(/FOME:\s*(\d+)/);
      if (match) attributes.hunger = parseInt(match[1], 10);
    } else if (line.includes("EXAUSTÃO:")) {
      const match = line.match(/EXAUSTÃO:\s*(\d+)/);
      if (match) attributes.exhaustion = parseInt(match[1], 10);
    }
  }

  if (
    attributes.fear !== undefined &&
    attributes.injuries !== undefined &&
    attributes.hunger !== undefined &&
    attributes.exhaustion !== undefined
  ) {
    return attributes as GameAttributes;
  }

  return null;
}

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
  const [attributes, setAttributes] = useState<GameAttributes>(INITIAL_ATTRIBUTES);
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
      const reply = await requestNarration(trimmed, history);
      const visibleReply = stripUiStateBlock(reply) || reply;
      const narratorTurn: Turn = {
        role: "narrator",
        content: visibleReply,
        contextContent: reply
      };

      setCurrentReply(visibleReply);
      setHistory((previous) => [...previous, narratorTurn]);

      const extractedAttributes = extractAttributes(reply);
      if (extractedAttributes) {
        setAttributes(extractedAttributes);
      }
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
        attributes={attributes}
        history={history}
        isOpen={isHistoryOpen}
        onToggle={() => setIsHistoryOpen((current) => !current)}
      />
    </main>
  );
}
