import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { BookOpen, Moon, Sun, Volume2 } from "lucide-react";
import { fetchContextLimits } from "../api/health";
import { requestNarration } from "../api/play";
import { requestStorySummary } from "../api/summary";
import { useAmbientAudio } from "../audio/useAmbientAudio";
import { useEreaderTone } from "../hooks/useEreaderTone";
import { useFontScale } from "../hooks/useFontScale";
import { useSidebarResize } from "../hooks/useSidebarResize";
import {
  clearSavedGame,
  hasSavedGame,
  loadSavedGame,
  saveGame
} from "../game/gameSave";
import { applyAppearanceToDocument } from "../game/appearance";
import { createNewGameState } from "../game/initialState";
import {
  createManualSkill,
  mergeSkillUpdates,
  recordPlayerActionSkill,
  upsertSkillInState
} from "../game/adventureSkills";
import {
  estimateNextRequestTokens,
  getFallbackContextLimits,
  toContextPercent,
  type ContextLimits
} from "../game/contextTokens";
import {
  clampAttributes,
  getCriticalAttribute,
  hasAttributeAtMax,
  type CriticalAttribute
} from "../game/attributes";
import { getAttributeDeltas } from "../game/attributeChanges";
import { buildDiaryEntries, filterDiaryEntries } from "../game/diaryEntries";
import {
  connectionFailureNarration,
  openingNarration
} from "../content/story";
import { uiText } from "../content/uiText";
import type { ActiveGameState } from "../game/initialState";
import type {
  AdventureSettings,
  AdventureSkills,
  GameAttributes,
  GameStatus,
  SidebarAction,
  Turn
} from "../types";
import {
  AdventureSettingsPanel,
  type SettingsSection
} from "./AdventureSettingsPanel";
import { AttributeChangeOverlay } from "./AttributeChangeOverlay";
import { CommandInput } from "./CommandInput";
import { GameHeader } from "./GameHeader";
import { GameOverPanel } from "./GameOverPanel";
import { HistoryPanel } from "./HistoryPanel";
import { MainMenu } from "./MainMenu";
import { SkillsPanel } from "./SkillsPanel";
import { NarrationPanel } from "./NarrationPanel";
import { StorySearchBar } from "./StorySearchBar";
import { StorySearchResults } from "./StorySearchResults";
import type { LlmDebugPayload } from "../../../shared/llmDebug";
import { sanitizeNarratorReply } from "../../../shared/narratorReply";

function extractAttributes(narratorResponse: string): GameAttributes | null {
  const lines = narratorResponse.split("\n");
  const attributes: Partial<GameAttributes> = {};

  for (const line of lines) {
    const asciiExhaustionMatch = line.match(/EXAUSTAO:\s*(\d+)/i);

    if (asciiExhaustionMatch) {
      attributes.exhaustion = parseInt(asciiExhaustionMatch[1], 10);
      continue;
    }

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

function normalizeUiLabel(line: string) {
  return line
    .trim()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleUpperCase("pt-PT");
}

function isUiStateHeading(line: string) {
  const normalized = normalizeUiLabel(line);

  if (
    /^(MEDO|FERIMENTOS|FOME|EXAUSTAO|INVENTARIO|LOCALIZACAO|OBJETIVO ATUAL):/i.test(
      normalized
    )
  ) {
    return true;
  }
  return /^(MEDO|FERIMENTOS|FOME|EXAUSTÃO|INVENTÁRIO|LOCALIZAÇÃO|OBJETIVO ATUAL):/i.test(
    line.trim()
  );
}

function extractInventory(narratorResponse: string): string[] | null {
  const lines = narratorResponse.split("\n");
  const normalizedInventoryStart = lines.findIndex((line) =>
    /^INVENTARIO:/i.test(normalizeUiLabel(line))
  );

  if (normalizedInventoryStart !== -1) {
    const items: string[] = [];

    for (const rawLine of lines.slice(normalizedInventoryStart + 1)) {
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
  const normalizedLocationStart = lines.findIndex((line) =>
    /^LOCALIZACAO:/i.test(normalizeUiLabel(line))
  );

  if (normalizedLocationStart !== -1) {
    const firstLineValue = lines[normalizedLocationStart]
      .split(":")
      .slice(1)
      .join(":")
      .trim();

    if (firstLineValue) {
      return stripPlaceholder(firstLineValue);
    }

    for (const rawLine of lines.slice(normalizedLocationStart + 1)) {
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

type CenterPanel = "diary" | `settings-${SettingsSection}` | null;

function toSettingsPanel(section: SettingsSection): CenterPanel {
  return `settings-${section}`;
}

function getSettingsSection(panel: CenterPanel): SettingsSection | null {
  if (!panel?.startsWith("settings-")) {
    return null;
  }

  return panel.replace("settings-", "") as SettingsSection;
}

export function App() {
  const { isAmbientOn, toggleAmbient } = useAmbientAudio();
  const { tone: ereadTone, setTone: setEreadTone } = useEreaderTone();
  const { fontScale, setFontScale } = useFontScale();
  const [screen, setScreen] = useState<"menu" | "playing">("menu");
  const [canContinue, setCanContinue] = useState(hasSavedGame);
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const savedTheme = window.localStorage.getItem("blindfold-theme");

    return savedTheme === "light" ? "light" : "dark";
  });
  const [currentReply, setCurrentReply] = useState(openingNarration);
  const [currentAction, setCurrentAction] = useState("");
  const [currentLlmDebug, setCurrentLlmDebug] = useState<LlmDebugPayload | null>(null);
  const [history, setHistory] = useState<Turn[]>([
    { role: "narrator", content: openingNarration }
  ]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const [storySearchQuery, setStorySearchQuery] = useState("");
  const [activeCenterPanel, setActiveCenterPanel] = useState<CenterPanel>(null);
  const [attributes, setAttributes] = useState(createNewGameState().attributes);
  const [status, setStatus] = useState(createNewGameState().status);
  const [skills, setSkills] = useState<AdventureSkills>(createNewGameState().skills);
  const [adventureSettings, setAdventureSettings] = useState<AdventureSettings>(
    createNewGameState().adventureSettings
  );
  const [contextLimits, setContextLimits] = useState<ContextLimits>(
    getFallbackContextLimits
  );
  const [confirmedContextUsage, setConfirmedContextUsage] = useState<{
    promptTokens: number;
    historyLength: number;
  } | null>(null);
  const [gameOver, setGameOver] = useState<{
    cause: CriticalAttribute;
    summary: string;
    isSummaryLoading: boolean;
  } | null>(null);
  const isLightTheme = theme === "light";
  const { isResizing, shellStyle, sidebarWidth, startResize } =
    useSidebarResize(isHistoryOpen);
  const sidebarActions: SidebarAction[] = [
    {
      id: "theme",
      label: isLightTheme ? uiText.themeDarkLabel : uiText.themeLightLabel,
      icon: isLightTheme ? Moon : Sun,
      isPressed: isLightTheme,
      onClick: () => {
        const nextTheme: AdventureSettings["appearance"]["theme"] =
          theme === "light" ? "dark" : "light";
        const nextSettings = {
          ...adventureSettings,
          appearance: {
            ...adventureSettings.appearance,
            theme: nextTheme
          }
        };

        setTheme(nextTheme);
        updateAdventureSettings(nextSettings);
      }
    },
    {
      id: "diary",
      label: uiText.diaryToggleLabel,
      icon: BookOpen,
      isActive: activeCenterPanel === "diary",
      isPressed: activeCenterPanel === "diary",
      onClick: () => {
        setStorySearchQuery("");
        setActiveCenterPanel((current) => (current === "diary" ? null : "diary"));
      }
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
    applyAppearanceToDocument(adventureSettings.appearance);
    setTheme(adventureSettings.appearance.theme);
    setEreadTone(adventureSettings.appearance.ereaderTone);
    setFontScale(adventureSettings.appearance.fontScale);
  }, [adventureSettings.appearance, setFontScale]);

  useEffect(() => {
    if (screen !== "playing") {
      return;
    }

    let cancelled = false;

    void fetchContextLimits().then((limits) => {
      if (!cancelled) {
        setContextLimits(limits);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [screen]);

  const estimatedContextTokens = useMemo(
    () =>
      estimateNextRequestTokens({
        history,
        skills,
        draftMessage: message,
        limits: contextLimits
      }),
    [history, skills, message, contextLimits]
  );

  const contextUsedTokens =
    confirmedContextUsage &&
    confirmedContextUsage.historyLength === history.length &&
    !message.trim()
      ? confirmedContextUsage.promptTokens
      : estimatedContextTokens;

  const contextPercent = toContextPercent(
    contextUsedTokens,
    contextLimits.contextWindowTokens
  );

  const diaryEntries = useMemo(() => buildDiaryEntries(history), [history]);
  const filteredDiaryEntries = useMemo(
    () =>
      filterDiaryEntries(diaryEntries, storySearchQuery, {
        player: uiText.playerLabel,
        narrator: uiText.narratorLabel
      }),
    [diaryEntries, storySearchQuery]
  );
  const isStorySearchActive = storySearchQuery.trim().length > 0;
  const activeSettingsSection = getSettingsSection(activeCenterPanel);
  const isSandboxSettingsOpen = activeSettingsSection !== null;

  const currentAttributeChanges = useMemo(() => {
    const lastTurn = history.at(-1);

    if (lastTurn?.role === "narrator") {
      return lastTurn.attributeChanges ?? null;
    }

    return null;
  }, [history]);

  function applyGameState(state: ActiveGameState) {
    setCurrentReply(state.currentReply);
    setCurrentAction(state.currentAction);
    setHistory(state.history);
    setAttributes(state.attributes);
    setStatus(state.status);
    setSkills(state.skills);
    setAdventureSettings(state.adventureSettings);
    setTheme(state.adventureSettings.appearance.theme);
    setEreadTone(state.adventureSettings.appearance.ereaderTone);
    setFontScale(state.adventureSettings.appearance.fontScale);
    setMessage("");
    setError("");
    setIsLoading(false);
    setGameOver(null);
    setActiveCenterPanel(null);
    setCurrentLlmDebug(null);
  }

  function updateAdventureSettings(nextSettings: AdventureSettings) {
    setAdventureSettings(nextSettings);

    if (screen !== "playing") {
      return;
    }

    persistProgress({
      currentReply,
      currentAction,
      history,
      attributes,
      status,
      skills,
      adventureSettings: nextSettings
    });
  }

  function updateAttributes(nextAttributes: GameAttributes) {
    setAttributes(nextAttributes);

    if (screen !== "playing") {
      return;
    }

    persistProgress({
      currentReply,
      currentAction,
      history,
      attributes: nextAttributes,
      status,
      skills,
      adventureSettings
    });
  }

  function updateStatus(nextStatus: GameStatus) {
    setStatus(nextStatus);

    if (screen !== "playing") {
      return;
    }

    persistProgress({
      currentReply,
      currentAction,
      history,
      attributes,
      status: nextStatus,
      skills,
      adventureSettings
    });
  }

  function updateSkills(nextSkills: AdventureSkills) {
    setSkills(nextSkills);

    if (screen !== "playing") {
      return;
    }

    persistProgress({
      currentReply,
      currentAction,
      history,
      attributes,
      status,
      skills: nextSkills,
      adventureSettings
    });
  }

  function updateInventory(nextInventory: string[]) {
    updateStatus({
      ...status,
      inventory: nextInventory
    });
  }

  function addManualSkill(input: {
    title: string;
    description: string;
    content: string;
  }) {
    const skill = createManualSkill(skills, input);

    if (!skill) {
      return;
    }

    updateSkills(upsertSkillInState(skills, skill));
  }

  function applySandboxConfiguration(
    nextSettings: AdventureSettings,
    nextAttributes: GameAttributes,
    nextStatus: GameStatus,
    nextSkills: AdventureSkills
  ) {
    setAdventureSettings(nextSettings);
    setAttributes(nextAttributes);
    setStatus(nextStatus);
    setSkills(nextSkills);
    setTheme(nextSettings.appearance.theme);
    setEreadTone(nextSettings.appearance.ereaderTone);
    setFontScale(nextSettings.appearance.fontScale);

    if (screen !== "playing") {
      return;
    }

    persistProgress({
      currentReply,
      currentAction,
      history,
      attributes: nextAttributes,
      status: nextStatus,
      skills: nextSkills,
      adventureSettings: nextSettings
    });
  }

  const updateAppearance = useCallback(
    (appearance: AdventureSettings["appearance"]) => {
      applyAppearanceToDocument(appearance);
      setTheme(appearance.theme);
      setEreadTone(appearance.ereaderTone);
      setFontScale(appearance.fontScale);
    },
    [setEreadTone, setFontScale]
  );

  async function triggerGameOver(
    cause: CriticalAttribute,
    completedHistory: Turn[],
    nextSkills: AdventureSkills,
    settings: AdventureSettings
  ) {
    setGameOver({ cause, summary: "", isSummaryLoading: true });
    clearSavedGame();
    setCanContinue(false);

    const summary = await requestStorySummary(
      completedHistory,
      nextSkills,
      cause,
      settings
    );
    setGameOver({ cause, summary, isSummaryLoading: false });
  }

  function returnToMenu() {
    setScreen("menu");
    setGameOver(null);
    setActiveCenterPanel(null);
  }

  function openSettingsPanel(section: SettingsSection) {
    setStorySearchQuery("");
    setActiveCenterPanel(toSettingsPanel(section));
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

    const clampedAttributes = clampAttributes(saved.attributes);

    if (hasAttributeAtMax(clampedAttributes)) {
      const cause = getCriticalAttribute(clampedAttributes);

      if (cause) {
        void triggerGameOver(
          cause,
          saved.history,
          saved.skills,
          saved.adventureSettings
        );
      }
    }
  }

  async function submitAction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = message.trim();

    if (!trimmed || isLoading || gameOver) {
      return;
    }

    const playerTurn: Turn = { role: "player", content: trimmed };
    const nextHistory = [...history, playerTurn];
    const nextSkills = recordPlayerActionSkill(skills, trimmed);

    setCurrentAction(trimmed);
    setHistory(nextHistory);
    setSkills(nextSkills);
    setMessage("");
    setStorySearchQuery("");
    setActiveCenterPanel(null);
    setIsLoading(true);
    setError("");
    setCurrentLlmDebug(null);

    persistProgress({
      currentReply,
      currentAction: trimmed,
      history: nextHistory,
      attributes,
      status,
      skills: nextSkills,
      adventureSettings
    });
    setCanContinue(true);

    try {
      const { reply, skillUpdates, usage, debug } = await requestNarration(
        trimmed,
        history,
        nextSkills,
        attributes,
        status,
        adventureSettings
      );
      const visibleReply = sanitizeNarratorReply(reply) || reply;
      const extractedAttributes = extractAttributes(reply);
      const nextAttributes = clampAttributes(extractedAttributes ?? attributes);
      const attributeDeltas = extractedAttributes
        ? getAttributeDeltas(attributes, nextAttributes)
        : {};
      const narratorTurn: Turn = {
        role: "narrator",
        content: visibleReply,
        contextContent: reply,
        ...(Object.keys(attributeDeltas).length > 0
          ? { attributeChanges: attributeDeltas }
          : {})
      };
      const completedHistory = [...nextHistory, narratorTurn];

      setCurrentReply(visibleReply);
      setHistory(completedHistory);
      setCurrentLlmDebug(debug);

      if (extractedAttributes) {
        setAttributes(nextAttributes);
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

      const nextSkillsFromReply = mergeSkillUpdates(nextSkills, skillUpdates);
      setSkills(nextSkillsFromReply);

      if (usage) {
        setContextLimits((current) => ({
          ...current,
          contextWindowTokens: usage.contextLimit || current.contextWindowTokens
        }));
        setConfirmedContextUsage({
          promptTokens: usage.promptTokens,
          historyLength: completedHistory.length
        });
      }

      persistProgress({
        currentReply: visibleReply,
        currentAction: trimmed,
        history: completedHistory,
        attributes: nextAttributes,
        status: nextStatus,
        skills: nextSkillsFromReply,
        adventureSettings
      });

      if (hasAttributeAtMax(nextAttributes)) {
        const cause = getCriticalAttribute(nextAttributes);

        if (cause) {
          await triggerGameOver(
            cause,
            completedHistory,
            nextSkillsFromReply,
            adventureSettings
          );
        }

        return;
      }

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
        status,
        skills: nextSkills,
        adventureSettings
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
      <section
        className={[
          "play-area",
          isSandboxSettingsOpen ? "is-sandbox-settings" : ""
        ]
          .filter(Boolean)
          .join(" ")}
        aria-label={uiText.mainAriaLabel}
      >
        {isSandboxSettingsOpen ? (
          <AdventureSettingsPanel
            activeSection={activeSettingsSection}
            adventureSettings={adventureSettings}
            attributes={attributes}
            skills={skills}
            status={status}
            onApplyChanges={applySandboxConfiguration}
            onClose={() => setActiveCenterPanel(null)}
            onInventoryChange={updateInventory}
            onPreviewAppearance={updateAppearance}
            onSectionChange={openSettingsPanel}
          />
        ) : (
          <>
            <GameHeader />
            <StorySearchBar
              onQueryChange={(query) => {
                setStorySearchQuery(query);

                if (query.trim()) {
                  setActiveCenterPanel(null);
                }
              }}
              query={storySearchQuery}
              resultCount={filteredDiaryEntries.length}
              totalEntries={diaryEntries.length}
            />
            <AttributeChangeOverlay
              changes={currentAttributeChanges}
              pulseKey={history.length}
            />
            <div className="play-main-panel">
              <div
                aria-hidden={activeCenterPanel !== null || isStorySearchActive}
                className={[
                  "play-story-stack",
                  activeCenterPanel !== null || isStorySearchActive
                    ? "is-view-hidden"
                    : ""
                ]
                  .filter(Boolean)
                  .join(" ")}
                hidden={activeCenterPanel !== null || isStorySearchActive}
              >
                <NarrationPanel
                  attributeChanges={currentAttributeChanges}
                  currentAction={currentAction}
                  currentReply={currentReply}
                  isLoading={isLoading}
                  llmDebug={currentLlmDebug}
                />
                {gameOver ? (
                  <GameOverPanel
                    cause={gameOver.cause}
                    isLoading={gameOver.isSummaryLoading}
                    onReturnToMenu={returnToMenu}
                    summary={gameOver.summary}
                  />
                ) : null}
              </div>
              {isStorySearchActive ? (
                <StorySearchResults history={history} query={storySearchQuery} />
              ) : activeCenterPanel === "diary" ? (
                <SkillsPanel skills={skills} onAddSkill={addManualSkill} />
              ) : null}
            </div>
            {!gameOver ? (
              <CommandInput
                contextLimitTokens={contextLimits.contextWindowTokens}
                contextPercent={contextPercent}
                contextUsedTokens={contextUsedTokens}
                isLoading={isLoading}
                message={message}
                onMessageChange={setMessage}
                onSubmit={submitAction}
              />
            ) : null}
            {error ? <p className="error-text">{error}</p> : null}
          </>
        )}
      </section>

      {isHistoryOpen ? (
        <div
          aria-label={uiText.sidebarResizeLabel}
          aria-orientation="vertical"
          aria-valuemax={400}
          aria-valuemin={240}
          aria-valuenow={sidebarWidth}
          className="sidebar-resize-handle"
          onPointerDown={startResize}
          role="separator"
          tabIndex={0}
        />
      ) : null}

      <HistoryPanel
        actions={sidebarActions}
        activeSettingsSection={activeSettingsSection}
        attributeChanges={currentAttributeChanges}
        attributes={attributes}
        isOpen={isHistoryOpen}
        onOpenSettings={openSettingsPanel}
        onBackToChat={() => setActiveCenterPanel(null)}
        onToggle={() => setIsHistoryOpen((current) => !current)}
        status={status}
      />
    </main>
  );
}
