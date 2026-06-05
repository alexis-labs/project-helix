import { useEffect, useState, type ChangeEvent } from "react";
import {
  Activity,
  AlertTriangle,
  Backpack,
  BrainCircuit,
  CheckCircle2,
  RefreshCw,
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
  status: GameStatus;
  onApplyChanges: (
    settings: AdventureSettings,
    attributes: GameAttributes,
    status: GameStatus
  ) => void;
  onClose: () => void;
  onSectionChange: (section: SettingsSection) => void;
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

function cloneSettings(settings: AdventureSettings): AdventureSettings {
  return structuredClone(settings);
}

function cloneAttributes(nextAttributes: GameAttributes): GameAttributes {
  return { ...nextAttributes };
}

function cloneStatus(nextStatus: GameStatus): GameStatus {
  return {
    location: nextStatus.location,
    inventory: [...nextStatus.inventory]
  };
}

function areDraftsEqual(
  settings: AdventureSettings,
  attributes: GameAttributes,
  status: GameStatus,
  draftSettings: AdventureSettings,
  draftAttributes: GameAttributes,
  draftStatus: GameStatus
) {
  return (
    JSON.stringify(settings) === JSON.stringify(draftSettings) &&
    JSON.stringify(attributes) === JSON.stringify(draftAttributes) &&
    JSON.stringify(status) === JSON.stringify(draftStatus)
  );
}

export function AdventureSettingsPanel({
  activeSection,
  adventureSettings,
  attributes,
  status,
  onApplyChanges,
  onClose,
  onSectionChange
}: AdventureSettingsPanelProps) {
  const activeTab =
    settingsTabs.find((tab) => tab.id === activeSection) ?? settingsTabs[0];
  const [draftSettings, setDraftSettings] = useState(() =>
    cloneSettings(adventureSettings)
  );
  const [draftAttributes, setDraftAttributes] = useState(() =>
    cloneAttributes(attributes)
  );
  const [draftStatus, setDraftStatus] = useState(() => cloneStatus(status));
  const [applyStatus, setApplyStatus] = useState<
    "idle" | "dirty" | "success" | "error"
  >("idle");
  const hasDraftChanges = !areDraftsEqual(
    adventureSettings,
    attributes,
    status,
    draftSettings,
    draftAttributes,
    draftStatus
  );
  const visibleApplyStatus = hasDraftChanges ? "dirty" : applyStatus;

  useEffect(() => {
    setDraftSettings(cloneSettings(adventureSettings));
  }, [adventureSettings]);

  useEffect(() => {
    setDraftAttributes(cloneAttributes(attributes));
  }, [attributes]);

  useEffect(() => {
    setDraftStatus(cloneStatus(status));
  }, [status]);

  useEffect(() => {
    if (applyStatus !== "success") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setApplyStatus("idle");
    }, 2200);

    return () => window.clearTimeout(timeoutId);
  }, [applyStatus]);

  function updatePrompt(prompt: string) {
    setApplyStatus("dirty");
    setDraftSettings({
      ...draftSettings,
      prompt
    });
  }

  function updateAdditionalMemories(additionalMemories: string) {
    setApplyStatus("dirty");
    setDraftSettings({
      ...draftSettings,
      additionalMemories
    });
  }

  function updateAttribute(key: keyof GameAttributes, value: number) {
    setApplyStatus("dirty");
    setDraftAttributes({
      ...draftAttributes,
      [key]: clampStat(value)
    });
  }

  function updateSelectedModel(model: string) {
    setApplyStatus("dirty");
    setDraftSettings({
      ...draftSettings,
      selectedModel: model
    });
  }

  function updateLlm<K extends keyof AdventureSettings["llm"]>(
    key: K,
    value: AdventureSettings["llm"][K]
  ) {
    setApplyStatus("dirty");
    setDraftSettings({
      ...draftSettings,
      llm: {
        ...draftSettings.llm,
        [key]: value
      }
    });
  }

  function updateAppearance(appearance: AdventureSettings["appearance"]) {
    setApplyStatus("dirty");
    setDraftSettings({
      ...draftSettings,
      appearance
    });
  }

  function handleThemeChange(event: ChangeEvent<HTMLSelectElement>) {
    updateAppearance({
      ...draftSettings.appearance,
      theme: event.target.value === "light" ? "light" : "dark"
    });
  }

  function applyDrafts() {
    try {
      onApplyChanges(draftSettings, draftAttributes, draftStatus);
      setApplyStatus("success");
    } catch {
      setApplyStatus("error");
    }
  }

  const ApplyIcon =
    visibleApplyStatus === "success"
      ? CheckCircle2
      : visibleApplyStatus === "error"
        ? AlertTriangle
        : RefreshCw;
  const applyLabel =
    visibleApplyStatus === "success"
      ? "Atualizado"
      : visibleApplyStatus === "error"
        ? "Erro"
        : visibleApplyStatus === "dirty"
          ? "Atualizar alterações"
          : "Atualizar";

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
        <button
          className={[
            "settings-apply-button",
            `is-${visibleApplyStatus}`
          ].join(" ")}
          onClick={applyDrafts}
          type="button"
        >
          <ApplyIcon size={15} strokeWidth={1.8} aria-hidden="true" />
          <span>{applyLabel}</span>
        </button>

        {activeSection === "prompt" ? (
          <section className="settings-section" aria-label="Prompt">
            <label className="settings-field">
              <span>Prompt</span>
              <textarea
                value={draftSettings.prompt}
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
                  value={draftAttributes.fear}
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
                  value={draftAttributes.injuries}
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
                  value={draftAttributes.hunger}
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
                  value={draftAttributes.exhaustion}
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
                value={joinLines(draftStatus.inventory)}
                onChange={(event) => {
                  setApplyStatus("dirty");
                  setDraftStatus({
                    ...draftStatus,
                    inventory: splitLines(event.target.value)
                  });
                }}
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
                value={draftStatus.location}
                onChange={(event) => {
                  setApplyStatus("dirty");
                  setDraftStatus({
                    ...draftStatus,
                    location: event.target.value
                  });
                }}
              />
            </label>
          </section>
        ) : null}

        {activeSection === "memories" ? (
          <section className="settings-section" aria-label="Memorias adicionais">
            <label className="settings-field">
              <span>Memorias adicionais</span>
              <textarea
                value={draftSettings.additionalMemories}
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
                  value={draftSettings.llm.temperature}
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
                  value={draftSettings.llm.maxCompletionTokens}
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
                  value={draftSettings.llm.contextWindowTokens}
                />
              </label>
            </div>
            <div className="model-option-list">
              {OPENROUTER_MODELS.map((model) => (
                <label
                  className={[
                    "model-option",
                    draftSettings.selectedModel === model.id ? "is-selected" : ""
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  key={model.id}
                >
                  <input
                    checked={draftSettings.selectedModel === model.id}
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
                value={draftSettings.appearance.theme}
                onChange={handleThemeChange}
              >
                <option value="dark">Escuro</option>
                <option value="light">Claro</option>
              </select>
            </label>
            <EreaderToneSlider
              onChange={(value) => {
                updateAppearance({
                  ...draftSettings.appearance,
                  ereaderTone: value
                });
              }}
              value={draftSettings.appearance.ereaderTone}
            />
            <FontSizeSlider
              onChange={(value) => {
                updateAppearance({
                  ...draftSettings.appearance,
                  fontScale: value
                });
              }}
              value={draftSettings.appearance.fontScale}
            />
          </section>
        ) : null}
      </div>
    </section>
  );
}
