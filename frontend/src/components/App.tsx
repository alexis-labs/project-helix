import { useEffect, useState, type FormEvent } from "react";
import { Moon, Sun, Volume2 } from "lucide-react";
import { requestNarration } from "../api/play";
import { useAmbientAudio } from "../audio/useAmbientAudio";
import { useEreaderTone } from "../hooks/useEreaderTone";
import { useSidebarResize } from "../hooks/useSidebarResize";
import {
  clearSavedGame,
  hasSavedGame,
  loadSavedGame,
  saveGame
} from "../game/gameSave";
import { createNewGameState } from "../game/initialState";
import {
  connectionFailureNarration,
  openingNarration
} from "../content/story";
import { uiText } from "../content/uiText";
import type { ActiveGameState } from "../game/initialState";
import type { GameAttributes, GameStatus, SidebarAction, Turn } from "../types";
import { CommandInput } from "./CommandInput";
import { GameHeader } from "./GameHeader";
import { HistoryPanel } from "./HistoryPanel";
import { MainMenu } from "./MainMenu";
import { NarrationPanel } from "./NarrationPanel";

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

function isUiStateHeading(line: string) {
  return /^(MEDO|FERIMENTOS|FOME|EXAUSTÃO|INVENTÁRIO|LOCALIZAÇÃO|OBJETIVO ATUAL):/i.test(
    line.trim()
  );
}

function extractInventory(narratorResponse: string): string[] | null {
  const lines = narratorResponse.split("\n");
  const inventoryStart = lines.findIndex((line) =>
    /^INVENTÁRIO:/i.test(line.trim())
  );

  if (inventoryStart === -1) {
    return null;
  }

  const items: string[] = [];

  for (const rawLine of lines.slice(inventoryStart + 1)) {
    const line = rawLine.trim();

    if (isUiStateHeading(line)) {
      break;
    }

    if (!line) {
      continue;
    }

    const item = line.replace(/^[-*]\s*/, "").trim();

    if (/^(nenhum|vazio|sem itens|\(.*\))$/i.test(item)) {
      continue;
    }

    items.push(item);
  }

  return items;
}

function stripPlaceholder(value: string) {
  return value.replace(/^\((.*)\)$/, "$1").trim();
}

function extractLocation(narratorResponse: string): string | null {
  const lines = narratorResponse.split("\n");
  const locationStart = lines.findIndex((line) =>
    /^LOCALIZAÇÃO:/i.test(line.trim())
  );

  if (locationStart === -1) {
    return null;
  }

  const firstLineValue = lines[locationStart].split(":").slice(1).join(":").trim();

  if (firstLineValue) {
    return stripPlaceholder(firstLineValue);
  }

  for (const rawLine of lines.slice(locationStart + 1)) {
    const line = rawLine.trim();

    if (!line) {
      continue;
    }

    if (isUiStateHeading(line)) {
      break;
    }

    return stripPlaceholder(line);
  }

  return null;
}

function persistProgress(state: ActiveGameState) {
  saveGame(state);
}

export function App() {
  const { isAmbientOn, toggleAmbient } = useAmbientAudio();
  const { tone: ereadTone, setTone: setEreadTone } = useEreaderTone();
  const [screen, setScreen] = useState<"menu" | "playing">("menu");
  const [canContinue, setCanContinue] = useState(hasSavedGame);
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
  const [isEreaderToneOpen, setIsEreaderToneOpen] = useState(false);
  const [attributes, setAttributes] = useState(createNewGameState().attributes);
  const [status, setStatus] = useState(createNewGameState().status);
  const isLightTheme = theme === "light";
  const { isResizing, shellStyle, sidebarWidth, startResize } =
    useSidebarResize(isHistoryOpen);
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
      id: "ereader-tone",
      label: uiText.ereadToneToggleLabel,
      icon: Sun,
      isPressed: isEreaderToneOpen,
      onClick: () =>
        setIsEreaderToneOpen((current) => {
          const next = !current;

          if (next) {
            setIsHistoryOpen(true);
          }

          return next;
        })
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

  function applyGameState(state: ActiveGameState) {
    setCurrentReply(state.currentReply);
    setCurrentAction(state.currentAction);
    setHistory(state.history);
    setAttributes(state.attributes);
    setStatus(state.status);
    setMessage("");
    setError("");
    setIsLoading(false);
  }

  function startNewGame() {
    clearSavedGame();
    const freshState = createNewGameState();
    applyGameState(freshState);
    persistProgress(freshState);
    setCanContinue(true);
    setScreen("playing");
  }

  function continueGame() {
    const saved = loadSavedGame();

    if (!saved) {
      setCanContinue(false);
      return;
    }

    applyGameState(saved);
    setScreen("playing");
  }

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

    persistProgress({
      currentReply,
      currentAction: trimmed,
      history: nextHistory,
      attributes,
      status
    });
    setCanContinue(true);

    try {
      const reply = await requestNarration(trimmed, history);
      const visibleReply = stripUiStateBlock(reply) || reply;
      const narratorTurn: Turn = {
        role: "narrator",
        content: visibleReply,
        contextContent: reply
      };
      const completedHistory = [...nextHistory, narratorTurn];

      setCurrentReply(visibleReply);
      setHistory(completedHistory);

      const extractedAttributes = extractAttributes(reply);
      const nextAttributes = extractedAttributes ?? attributes;

      if (extractedAttributes) {
        setAttributes(extractedAttributes);
      }

      const extractedInventory = extractInventory(reply);
      const extractedLocation = extractLocation(reply);
      const nextStatus: GameStatus =
        extractedInventory || extractedLocation
          ? {
              inventory: extractedInventory ?? status.inventory,
              location: extractedLocation ?? status.location
            }
          : status;

      if (extractedInventory || extractedLocation) {
        setStatus(nextStatus);
      }

      persistProgress({
        currentReply: visibleReply,
        currentAction: trimmed,
        history: completedHistory,
        attributes: nextAttributes,
        status: nextStatus
      });
      setCanContinue(true);
    } catch (caughtError) {
      const fallback =
        caughtError instanceof Error ? caughtError.message : uiText.connectionError;

      setError(fallback);
      setCurrentReply(connectionFailureNarration);

      persistProgress({
        currentReply: connectionFailureNarration,
        currentAction: trimmed,
        history: nextHistory,
        attributes,
        status
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (screen === "menu") {
    return (
      <MainMenu
        canContinue={canContinue}
        onContinue={continueGame}
        onNewGame={startNewGame}
      />
    );
  }

  return (
    <main
      className={[
        "game-shell",
        isHistoryOpen ? "is-sidebar-open" : "is-history-collapsed",
        isResizing ? "is-sidebar-resizing" : ""
      ]
        .filter(Boolean)
        .join(" ")}
      style={shellStyle}
    >
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

      {isHistoryOpen ? (
        <div
          aria-label={uiText.sidebarResizeLabel}
          aria-orientation="vertical"
          aria-valuemax={560}
          aria-valuemin={280}
          aria-valuenow={sidebarWidth}
          className="sidebar-resize-handle"
          onPointerDown={startResize}
          role="separator"
          tabIndex={0}
        />
      ) : null}

      <HistoryPanel
        actions={sidebarActions}
        attributes={attributes}
        ereaderTone={ereadTone}
        history={history}
        isEreaderToneOpen={isEreaderToneOpen}
        isOpen={isHistoryOpen}
        onEreaderToneChange={setEreadTone}
        onToggle={() => setIsHistoryOpen((current) => !current)}
        status={status}
      />
    </main>
  );
}
