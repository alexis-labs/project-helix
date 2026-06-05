import { type ChangeEvent } from "react";
import {
  Activity,
  Backpack,
  BrainCircuit,
  MapPin,
  NotebookText,
  Palette,
  ScrollText,
  X
} from "lucide-react";
import { OPENROUTER_MODELS } from "../../../shared/adventureSettings";
import { EreaderToneSlider } from "./EreaderToneSlider";
import { FontSizeSlider } from "./FontSizeSlider";
import type { AdventureSettings, GameAttributes, GameStatus } from "../types";

export type SettingsSection =
  | "prompt"
  | "stats"
  | "items"
  | "location"
  | "memories"
  | "models"
  | "appearance";

type AdventureSettingsPanelProps = {
  activeSection: SettingsSection;
  adventureSettings: AdventureSettings;
  attributes: GameAttributes;
  ereaderTone: number;
  fontScale: number;
  status: GameStatus;
  onAdventureSettingsChange: (settings: AdventureSettings) => void;
  onAppearanceChange: (appearance: AdventureSettings["appearance"]) => void;
  onAttributesChange: (attributes: GameAttributes) => void;
  onClose: () => void;
  onSectionChange: (section: SettingsSection) => void;
  onStatusChange: (status: GameStatus) => void;
};

const settingsTabs: {
  id: SettingsSection;
  group: "Sandbox" | "Gameplay";
  label: string;
  description: string;
  icon: typeof ScrollText;
}[] = [
  {
    id: "prompt",
    group: "Sandbox",
    label: "Prompt",
    description: "System prompt enviado ao modelo. Vazio por defeito.",
    icon: ScrollText
  },
  {
    id: "stats",
    group: "Sandbox",
    label: "Stats",
    description: "Estado numerico atual do jogo.",
    icon: Activity
  },
  {
    id: "items",
    group: "Sandbox",
    label: "Items",
    description: "Itens atuais na mochila.",
    icon: Backpack
  },
  {
    id: "location",
    group: "Sandbox",
    label: "Localizacao",
    description: "Local atual enviado ao modelo.",
    icon: MapPin
  },
  {
    id: "memories",
    group: "Sandbox",
    label: "Memorias adicionais",
    description: "Notas livres adicionadas ao system prompt.",
    icon: NotebookText
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

export const settingsNavItems = settingsTabs.map(({ id, group, label, icon }) => ({
  id,
  group,
  label,
  icon
}));

function clampStat(value: number) {
  if (Number.isNaN(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(value)));
}

function splitLines(value: string) {
  return value
    .split("\n")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function joinLines(values: string[]) {
  return values.join("\n");
}

export function AdventureSettingsPanel({
  activeSection,
  adventureSettings,
  attributes,
  ereaderTone,
  fontScale,
  status,
  onAdventureSettingsChange,
  onAppearanceChange,
  onAttributesChange,
  onClose,
  onSectionChange,
  onStatusChange
}: AdventureSettingsPanelProps) {
  const activeTab =
    settingsTabs.find((tab) => tab.id === activeSection) ?? settingsTabs[0];

  function updatePrompt(prompt: string) {
    onAdventureSettingsChange({
      ...adventureSettings,
      prompt
    });
  }

  function updateAdditionalMemories(additionalMemories: string) {
    onAdventureSettingsChange({
      ...adventureSettings,
      additionalMemories
    });
  }

  function updateAttribute(key: keyof GameAttributes, value: number) {
    onAttributesChange({
      ...attributes,
      [key]: clampStat(value)
    });
  }

  function updateSelectedModel(model: string) {
    onAdventureSettingsChange({
      ...adventureSettings,
      selectedModel: model
    });
  }

  function updateLlm<K extends keyof AdventureSettings["llm"]>(
    key: K,
    value: AdventureSettings["llm"][K]
  ) {
    onAdventureSettingsChange({
      ...adventureSettings,
      llm: {
        ...adventureSettings.llm,
        [key]: value
      }
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
    <section className="settings-view" aria-label="Definicoes da sandbox">
      <header className="settings-view-header">
        <div>
          <p>{activeTab.group}</p>
          <h2>{activeTab.label}</h2>
          <span>{activeTab.description}</span>
        </div>
        <button
          aria-label="Fechar definicoes"
          className="settings-close-button"
          onClick={onClose}
          type="button"
        >
          <X size={18} strokeWidth={1.8} aria-hidden="true" />
        </button>
      </header>

      <nav className="settings-view-tabs" aria-label="Secoes das definicoes">
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
              onClick={() => onSectionChange(tab.id)}
              type="button"
            >
              <Icon size={15} strokeWidth={1.6} aria-hidden="true" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="settings-view-body">
        {activeSection === "prompt" ? (
          <section className="settings-section" aria-label="Prompt">
            <label className="settings-field">
              <span>Prompt</span>
              <textarea
                value={adventureSettings.prompt}
                onChange={(event) => updatePrompt(event.target.value)}
                rows={14}
              />
            </label>
          </section>
        ) : null}

        {activeSection === "stats" ? (
          <section className="settings-section" aria-label="Stats">
            <div className="llm-config-grid">
              <label className="settings-field">
                <span>Medo</span>
                <input
                  max={100}
                  min={0}
                  onChange={(event) =>
                    updateAttribute("fear", Number(event.target.value))
                  }
                  type="number"
                  value={attributes.fear}
                />
              </label>
              <label className="settings-field">
                <span>Ferimentos</span>
                <input
                  max={100}
                  min={0}
                  onChange={(event) =>
                    updateAttribute("injuries", Number(event.target.value))
                  }
                  type="number"
                  value={attributes.injuries}
                />
              </label>
              <label className="settings-field">
                <span>Fome</span>
                <input
                  max={100}
                  min={0}
                  onChange={(event) =>
                    updateAttribute("hunger", Number(event.target.value))
                  }
                  type="number"
                  value={attributes.hunger}
                />
              </label>
              <label className="settings-field">
                <span>Exaustao</span>
                <input
                  max={100}
                  min={0}
                  onChange={(event) =>
                    updateAttribute("exhaustion", Number(event.target.value))
                  }
                  type="number"
                  value={attributes.exhaustion}
                />
              </label>
            </div>
          </section>
        ) : null}

        {activeSection === "items" ? (
          <section className="settings-section" aria-label="Items">
            <label className="settings-field">
              <span>Mochila</span>
              <textarea
                value={joinLines(status.inventory)}
                onChange={(event) =>
                  onStatusChange({
                    ...status,
                    inventory: splitLines(event.target.value)
                  })
                }
                rows={12}
              />
            </label>
          </section>
        ) : null}

        {activeSection === "location" ? (
          <section className="settings-section" aria-label="Localizacao">
            <label className="settings-field">
              <span>Localizacao</span>
              <input
                value={status.location}
                onChange={(event) =>
                  onStatusChange({
                    ...status,
                    location: event.target.value
                  })
                }
              />
            </label>
          </section>
        ) : null}

        {activeSection === "memories" ? (
          <section className="settings-section" aria-label="Memorias adicionais">
            <label className="settings-field">
              <span>Memorias adicionais</span>
              <textarea
                value={adventureSettings.additionalMemories}
                onChange={(event) => updateAdditionalMemories(event.target.value)}
                rows={14}
              />
            </label>
          </section>
        ) : null}

        {activeSection === "models" ? (
          <section className="settings-section" aria-label="AI Models">
            <div className="llm-config-grid">
              <label className="settings-field">
                <span>Temperature</span>
                <input
                  max={2}
                  min={0}
                  onChange={(event) =>
                    updateLlm("temperature", Number(event.target.value))
                  }
                  step={0.05}
                  type="number"
                  value={adventureSettings.llm.temperature}
                />
              </label>
              <label className="settings-field">
                <span>Max completion tokens</span>
                <input
                  max={4096}
                  min={128}
                  onChange={(event) =>
                    updateLlm("maxCompletionTokens", Number(event.target.value))
                  }
                  step={128}
                  type="number"
                  value={adventureSettings.llm.maxCompletionTokens}
                />
              </label>
              <label className="settings-field">
                <span>Context window</span>
                <input
                  max={1000000}
                  min={4096}
                  onChange={(event) =>
                    updateLlm("contextWindowTokens", Number(event.target.value))
                  }
                  step={1024}
                  type="number"
                  value={adventureSettings.llm.contextWindowTokens}
                />
              </label>
            </div>
            <div className="model-option-list">
              {OPENROUTER_MODELS.map((model) => (
                <label
                  className={[
                    "model-option",
                    adventureSettings.selectedModel === model.id ? "is-selected" : ""
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
    </section>
  );
}
