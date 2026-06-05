import { useState, type ChangeEvent } from "react";
import {
  BookMarked,
  BrainCircuit,
  Info,
  PanelRightClose,
  PanelRightOpen,
  Palette,
  Plus,
  ScrollText,
  StickyNote,
  Trash2
} from "lucide-react";
import { OPENROUTER_MODELS } from "../../../shared/adventureSettings";
import { uiText } from "../content/uiText";
import { EreaderToneSlider } from "./EreaderToneSlider";
import { FontSizeSlider } from "./FontSizeSlider";
import { StateIndicators } from "./StateIndicators";
import type { AttributeKey } from "../game/attributeChanges";
import type {
  AdventureSettings,
  GameAttributes,
  GameStatus,
  SidebarAction,
  StoryCard
} from "../types";

type SidebarSection = "plot" | "storyCards" | "details" | "models" | "appearance";

type HistoryPanelProps = {
  actions: SidebarAction[];
  adventureSettings: AdventureSettings;
  attributeChanges?: Partial<Record<AttributeKey, number>> | null;
  attributes: GameAttributes;
  ereaderTone: number;
  fontScale: number;
  isOpen: boolean;
  onAdventureSettingsChange: (settings: AdventureSettings) => void;
  onAppearanceChange: (appearance: AdventureSettings["appearance"]) => void;
  onToggle: () => void;
  status: GameStatus;
};

const settingsTabs: {
  id: SidebarSection;
  group: "Adventure" | "Gameplay";
  label: string;
  description: string;
  icon: typeof ScrollText;
}[] = [
  {
    id: "plot",
    group: "Adventure",
    label: "Plot",
    description: "Regras, resumo e tom enviados ao narrador.",
    icon: ScrollText
  },
  {
    id: "storyCards",
    group: "Adventure",
    label: "Story Cards",
    description: "Memorias ativadas por triggers no texto recente.",
    icon: StickyNote
  },
  {
    id: "details",
    group: "Adventure",
    label: "Details",
    description: "Metadados locais desta aventura.",
    icon: Info
  },
  {
    id: "models",
    group: "Gameplay",
    label: "AI Models",
    description: "Modelo OpenRouter usado no proximo turno.",
    icon: BrainCircuit
  },
  {
    id: "appearance",
    group: "Gameplay",
    label: "Appearance",
    description: "Tema, luminosidade e tamanho do texto.",
    icon: Palette
  }
];

function splitCommaList(value: string) {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function createStoryCard(): StoryCard {
  return {
    id: `card-${Date.now()}`,
    title: "Nova memoria",
    triggers: [],
    text: "",
    isActive: true
  };
}

export function HistoryPanel({
  actions,
  adventureSettings,
  attributeChanges,
  attributes,
  ereaderTone,
  fontScale,
  isOpen,
  onAdventureSettingsChange,
  onAppearanceChange,
  onToggle,
  status
}: HistoryPanelProps) {
  const [activeSection, setActiveSection] = useState<SidebarSection>("plot");
  const ToggleIcon = isOpen ? PanelRightClose : PanelRightOpen;
  const activeTab =
    settingsTabs.find((tab) => tab.id === activeSection) ?? settingsTabs[0];

  function updatePlot<K extends keyof AdventureSettings["plot"]>(
    key: K,
    value: AdventureSettings["plot"][K]
  ) {
    onAdventureSettingsChange({
      ...adventureSettings,
      plot: { ...adventureSettings.plot, [key]: value }
    });
  }

  function updateDetails<K extends keyof AdventureSettings["details"]>(
    key: K,
    value: AdventureSettings["details"][K]
  ) {
    onAdventureSettingsChange({
      ...adventureSettings,
      details: { ...adventureSettings.details, [key]: value }
    });
  }

  function updateStoryCard(cardId: string, nextCard: StoryCard) {
    onAdventureSettingsChange({
      ...adventureSettings,
      storyCards: adventureSettings.storyCards.map((card) =>
        card.id === cardId ? nextCard : card
      )
    });
  }

  function removeStoryCard(cardId: string) {
    onAdventureSettingsChange({
      ...adventureSettings,
      storyCards: adventureSettings.storyCards.filter((card) => card.id !== cardId)
    });
  }

  function addStoryCard() {
    onAdventureSettingsChange({
      ...adventureSettings,
      storyCards: [...adventureSettings.storyCards, createStoryCard()]
    });
  }

  function updateSelectedModel(model: string) {
    onAdventureSettingsChange({
      ...adventureSettings,
      selectedModel: model
    });
  }

  function updateAppearance(appearance: AdventureSettings["appearance"]) {
    onAppearanceChange(appearance);
    onAdventureSettingsChange({
      ...adventureSettings,
      appearance
    });
  }

  function handleThemeChange(event: ChangeEvent<HTMLSelectElement>) {
    updateAppearance({
      ...adventureSettings.appearance,
      theme: event.target.value === "light" ? "light" : "dark"
    });
  }

  return (
    <aside
      className={["history-panel", isOpen ? "is-open" : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        aria-label={uiText.sidebarActionsLabel}
        className="sidebar-actions"
        role="toolbar"
      >
        {actions.map((action) => {
          const ActionIcon = action.icon;

          return (
            <button
              aria-label={action.label}
              aria-pressed={action.isPressed}
              className={[
                "sidebar-action",
                action.isActive ? "is-active" : "",
                action.isPressed ? "is-pressed" : ""
              ]
                .filter(Boolean)
                .join(" ")}
              key={action.id}
              onClick={action.onClick}
              title={action.label}
              type="button"
            >
              <ActionIcon size={16} strokeWidth={1.5} aria-hidden="true" />
            </button>
          );
        })}
        <button
          aria-expanded={isOpen}
          aria-label={isOpen ? uiText.sidebarCollapseLabel : uiText.sidebarExpandLabel}
          className="history-toggle"
          onClick={onToggle}
          type="button"
        >
          <ToggleIcon size={17} strokeWidth={1.8} aria-hidden="true" />
        </button>
      </div>

      {isOpen ? (
        <div className="adventure-settings">
          <div className="settings-heading">
            <BookMarked size={17} strokeWidth={1.7} aria-hidden="true" />
            <div>
              <p className="settings-kicker">Configuracao</p>
              <h2>{adventureSettings.details.title || "Blindfold"}</h2>
            </div>
          </div>

          <nav className="settings-nav" aria-label="Definicoes da aventura">
            {settingsTabs.map((tab) => {
              const Icon = tab.icon;

              return (
                <button
                  aria-current={activeSection === tab.id ? "page" : undefined}
                  className={[
                    "settings-nav-item",
                    activeSection === tab.id ? "is-active" : ""
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id)}
                  title={`${tab.group}: ${tab.label}`}
                  type="button"
                >
                  <Icon size={15} strokeWidth={1.6} aria-hidden="true" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="settings-editor" key={activeSection}>
            <header className="settings-section-head">
              <p>{activeTab.group}</p>
              <h3>{activeTab.label}</h3>
              <span>{activeTab.description}</span>
            </header>

            {activeSection === "plot" ? (
              <section className="settings-section" aria-label="Plot">
                <label className="settings-field">
                  <span>Instrucoes da IA</span>
                  <textarea
                    value={adventureSettings.plot.aiInstructions}
                    onChange={(event) =>
                      updatePlot("aiInstructions", event.target.value)
                    }
                    rows={4}
                  />
                </label>
                <label className="settings-field">
                  <span>Resumo da historia</span>
                  <textarea
                    value={adventureSettings.plot.storySummary}
                    onChange={(event) =>
                      updatePlot("storySummary", event.target.value)
                    }
                    rows={4}
                  />
                </label>
                <label className="settings-field">
                  <span>Essenciais do enredo</span>
                  <textarea
                    value={adventureSettings.plot.plotEssentials}
                    onChange={(event) =>
                      updatePlot("plotEssentials", event.target.value)
                    }
                    rows={4}
                  />
                </label>
                <label className="settings-field">
                  <span>Nota do autor</span>
                  <textarea
                    value={adventureSettings.plot.authorNote}
                    onChange={(event) => updatePlot("authorNote", event.target.value)}
                    rows={3}
                  />
                </label>
                <label className="settings-check">
                  <input
                    checked={adventureSettings.plot.thirdPerson}
                    onChange={(event) =>
                      updatePlot("thirdPerson", event.target.checked)
                    }
                    type="checkbox"
                  />
                  <span>Narrar Jack em terceira pessoa</span>
                </label>
              </section>
            ) : null}

            {activeSection === "storyCards" ? (
              <section className="settings-section" aria-label="Story Cards">
                <button
                  className="settings-add-button"
                  onClick={addStoryCard}
                  type="button"
                >
                  <Plus size={15} strokeWidth={1.8} aria-hidden="true" />
                  <span>Adicionar card</span>
                </button>
                <div className="story-card-list">
                  {adventureSettings.storyCards.map((card) => (
                    <article className="story-card-editor" key={card.id}>
                      <div className="story-card-editor-head">
                        <label className="settings-check">
                          <input
                            checked={card.isActive}
                            onChange={(event) =>
                              updateStoryCard(card.id, {
                                ...card,
                                isActive: event.target.checked
                              })
                            }
                            type="checkbox"
                          />
                          <span>Ativo</span>
                        </label>
                        <button
                          aria-label="Apagar story card"
                          className="settings-icon-button"
                          onClick={() => removeStoryCard(card.id)}
                          type="button"
                        >
                          <Trash2 size={15} strokeWidth={1.6} aria-hidden="true" />
                        </button>
                      </div>
                      <label className="settings-field">
                        <span>Titulo</span>
                        <input
                          value={card.title}
                          onChange={(event) =>
                            updateStoryCard(card.id, {
                              ...card,
                              title: event.target.value
                            })
                          }
                        />
                      </label>
                      <label className="settings-field">
                        <span>Triggers</span>
                        <input
                          value={card.triggers.join(", ")}
                          onChange={(event) =>
                            updateStoryCard(card.id, {
                              ...card,
                              triggers: splitCommaList(event.target.value)
                            })
                          }
                          placeholder="abrigo, escola, olhos"
                        />
                      </label>
                      <label className="settings-field">
                        <span>Texto</span>
                        <textarea
                          value={card.text}
                          onChange={(event) =>
                            updateStoryCard(card.id, {
                              ...card,
                              text: event.target.value
                            })
                          }
                          rows={4}
                        />
                      </label>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            {activeSection === "details" ? (
              <section className="settings-section" aria-label="Details">
                <label className="settings-field">
                  <span>Titulo</span>
                  <input
                    value={adventureSettings.details.title}
                    onChange={(event) => updateDetails("title", event.target.value)}
                  />
                </label>
                <label className="settings-field">
                  <span>Descricao</span>
                  <textarea
                    value={adventureSettings.details.description}
                    onChange={(event) =>
                      updateDetails("description", event.target.value)
                    }
                    rows={4}
                  />
                </label>
                <label className="settings-field">
                  <span>Tags</span>
                  <input
                    value={adventureSettings.details.tags.join(", ")}
                    onChange={(event) =>
                      updateDetails("tags", splitCommaList(event.target.value))
                    }
                  />
                </label>
                <label className="settings-field">
                  <span>Visibilidade</span>
                  <select
                    value={adventureSettings.details.visibility}
                    onChange={(event) =>
                      updateDetails(
                        "visibility",
                        event.target.value === "local" ? "local" : "private"
                      )
                    }
                  >
                    <option value="private">Privada</option>
                    <option value="local">Local</option>
                  </select>
                </label>
                <label className="settings-field">
                  <span>Classificacao</span>
                  <select
                    value={adventureSettings.details.rating}
                    onChange={(event) =>
                      updateDetails(
                        "rating",
                        event.target.value === "teen" ? "teen" : "mature"
                      )
                    }
                  >
                    <option value="teen">Teen</option>
                    <option value="mature">Mature</option>
                  </select>
                </label>
              </section>
            ) : null}

            {activeSection === "models" ? (
              <section className="settings-section" aria-label="AI Models">
                <div className="model-option-list">
                  {OPENROUTER_MODELS.map((model) => (
                    <label
                      className={[
                        "model-option",
                        adventureSettings.selectedModel === model.id
                          ? "is-selected"
                          : ""
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      key={model.id}
                    >
                      <input
                        checked={adventureSettings.selectedModel === model.id}
                        name="openrouter-model"
                        onChange={() => updateSelectedModel(model.id)}
                        type="radio"
                      />
                      <span className="model-option-body">
                        <span className="model-option-title">
                          {model.label}
                          {"isFree" in model && model.isFree ? <em>Free</em> : null}
                        </span>
                        <span className="model-option-meta">
                          {model.provider} -{" "}
                          {model.contextWindowTokens.toLocaleString("pt-PT")} tokens
                        </span>
                        <span className="model-option-description">
                          {model.description}
                        </span>
                        <code>{model.id}</code>
                      </span>
                    </label>
                  ))}
                </div>
              </section>
            ) : null}

            {activeSection === "appearance" ? (
              <section className="settings-section" aria-label="Appearance">
                <label className="settings-field">
                  <span>Tema</span>
                  <select
                    value={adventureSettings.appearance.theme}
                    onChange={handleThemeChange}
                  >
                    <option value="dark">Escuro</option>
                    <option value="light">Claro</option>
                  </select>
                </label>
                <EreaderToneSlider
                  onChange={(value) => {
                    updateAppearance({
                      ...adventureSettings.appearance,
                      ereaderTone: value
                    });
                  }}
                  value={ereaderTone}
                />
                <FontSizeSlider
                  onChange={(value) => {
                    updateAppearance({
                      ...adventureSettings.appearance,
                      fontScale: value
                    });
                  }}
                  value={fontScale}
                />
              </section>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="sidebar-footer">
        <StateIndicators
          attributeChanges={attributeChanges}
          attributes={attributes}
          inventory={status.inventory}
          location={status.location}
        />
      </div>
    </aside>
  );
}
