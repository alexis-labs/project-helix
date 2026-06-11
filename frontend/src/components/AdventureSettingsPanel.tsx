import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  Activity,
  AlertTriangle,
  Backpack,
  BrainCircuit,
  CheckCircle2,
  FileText,
  Plus,
  RefreshCw,
  MapPin,
  NotebookText,
  Palette,
  ScrollText,
  Trash2,
  X
} from "lucide-react";
import { OPENROUTER_MODELS } from "../../../shared/adventureSettings";
import { uiText } from "../content/uiText";
import { cloneSkills, finalizeSkillsState } from "../game/adventureSkills";
import { AppearancePreview } from "./AppearancePreview";
import { EreaderToneSlider } from "./EreaderToneSlider";
import { FontSizeSlider } from "./FontSizeSlider";
import { SettingsRangeSlider } from "./SettingsRangeSlider";
import { SkillsWorkbench } from "./skills/SkillsWorkbench";
import type {
  AdventureSettings,
  AdventureSkills,
  GameAttributes,
  GameStatus
} from "../types";

export type SettingsSection =
  | "prompt"
  | "initialText"
  | "stats"
  | "items"
  | "location"
  | "skills"
  | "models"
  | "appearance";

type AdventureSettingsPanelProps = {
  activeSection: SettingsSection;
  adventureSettings: AdventureSettings;
  attributes: GameAttributes;
  skills: AdventureSkills;
  status: GameStatus;
  onApplyChanges: (
    settings: AdventureSettings,
    attributes: GameAttributes,
    status: GameStatus,
    skills: AdventureSkills
  ) => void;
  onClose: () => void;
  onInventoryChange: (inventory: string[]) => void;
  onPreviewAppearance: (appearance: AdventureSettings["appearance"]) => void;
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
    id: "initialText",
    group: "Sandbox",
    label: "Texto inicial",
    description: "Texto apresentado na primeira interacao.",
    icon: FileText
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
    id: "skills",
    group: "Sandbox",
    label: uiText.skillsSettingsLabel,
    description: uiText.skillsSettingsDescription,
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

const statFields: {
  key: keyof GameAttributes;
  label: string;
  tone: "fear" | "injuries" | "hunger" | "exhaustion";
}[] = [
  { key: "fear", label: "Medo", tone: "fear" },
  { key: "injuries", label: "Ferimentos", tone: "injuries" },
  { key: "hunger", label: "Fome", tone: "hunger" },
  { key: "exhaustion", label: "Exaustao", tone: "exhaustion" }
];

const llmParamHints: Record<keyof AdventureSettings["llm"], string> = {
  temperature: "0 = deterministico, 2 = mais criativo.",
  maxCompletionTokens: "Limite de tokens gerados por resposta.",
  contextWindowTokens: "Janela de contexto enviada ao modelo."
};

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
  skills: AdventureSkills,
  draftSettings: AdventureSettings,
  draftAttributes: GameAttributes,
  draftStatus: GameStatus,
  draftSkills: AdventureSkills
) {
  return (
    JSON.stringify(settings) === JSON.stringify(draftSettings) &&
    JSON.stringify(attributes) === JSON.stringify(draftAttributes) &&
    JSON.stringify(status) === JSON.stringify(draftStatus) &&
    JSON.stringify(skills) === JSON.stringify(draftSkills)
  );
}

export function AdventureSettingsPanel({
  activeSection,
  adventureSettings,
  attributes,
  skills,
  status,
  onApplyChanges,
  onClose,
  onInventoryChange,
  onPreviewAppearance,
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
  const [draftSkills, setDraftSkills] = useState(() => cloneSkills(skills));
  const [newInventoryItem, setNewInventoryItem] = useState("");
  const [applyStatus, setApplyStatus] = useState<
    "idle" | "dirty" | "success" | "error"
  >("idle");
  const hasDraftChanges = !areDraftsEqual(
    adventureSettings,
    attributes,
    status,
    skills,
    draftSettings,
    draftAttributes,
    draftStatus,
    draftSkills
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
    setDraftSkills(cloneSkills(skills));
  }, [skills]);

  useEffect(() => {
    if (applyStatus !== "success") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setApplyStatus("idle");
    }, 2200);

    return () => window.clearTimeout(timeoutId);
  }, [applyStatus]);

  const committedAppearanceRef = useRef(adventureSettings.appearance);
  committedAppearanceRef.current = adventureSettings.appearance;

  useEffect(() => {
    if (activeSection === "appearance") {
      onPreviewAppearance(draftSettings.appearance);
      return;
    }

    onPreviewAppearance(adventureSettings.appearance);
  }, [
    activeSection,
    adventureSettings.appearance,
    draftSettings.appearance,
    onPreviewAppearance
  ]);

  useEffect(
    () => () => {
      onPreviewAppearance(committedAppearanceRef.current);
    },
    [onPreviewAppearance]
  );

  function updatePrompt(prompt: string) {
    setApplyStatus("dirty");
    setDraftSettings({
      ...draftSettings,
      prompt
    });
  }

  function updateInitialText(initialText: string) {
    setApplyStatus("dirty");
    setDraftSettings({
      ...draftSettings,
      initialText
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

  function updateSkillsEnabled(skillsEnabled: boolean) {
    setApplyStatus("dirty");
    setDraftSettings({
      ...draftSettings,
      skillsEnabled
    });
  }

  function handleThemeChange(event: ChangeEvent<HTMLInputElement>) {
    updateAppearance({
      ...draftSettings.appearance,
      theme: event.target.value === "light" ? "light" : "dark"
    });
  }

  function commitInventory(inventory: string[]) {
    const nextInventory = inventory
      .map((item) => item.trim())
      .filter(Boolean);

    setDraftStatus({
      ...draftStatus,
      inventory: nextInventory
    });
    onInventoryChange(nextInventory);
    setApplyStatus("success");
  }

  function addInventoryItem() {
    const item = newInventoryItem.trim();

    if (!item) {
      return;
    }

    commitInventory([...draftStatus.inventory, item]);
    setNewInventoryItem("");
  }

  function updateInventoryDraft(index: number, value: string) {
    const nextInventory = draftStatus.inventory.map((item, itemIndex) =>
      itemIndex === index ? value : item
    );

    setApplyStatus("dirty");
    setDraftStatus({
      ...draftStatus,
      inventory: nextInventory
    });
  }

  function commitInventoryDraft() {
    commitInventory(draftStatus.inventory);
  }

  function removeInventoryItem(index: number) {
    commitInventory(
      draftStatus.inventory.filter((_item, itemIndex) => itemIndex !== index)
    );
  }

  function updateDraftSkills(nextSkills: AdventureSkills) {
    setApplyStatus("dirty");
    setDraftSkills(nextSkills);
  }

  function applyDrafts() {
    try {
      onApplyChanges(
        draftSettings,
        draftAttributes,
        draftStatus,
        finalizeSkillsState(draftSkills)
      );
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
      <div className="settings-view-top">
        <header className="settings-view-header">
          <h2 className="settings-view-title" title={activeTab.description}>
            <span className="settings-view-kicker">{activeTab.group}</span>
            <span aria-hidden="true" className="settings-view-kicker-sep">
              ·
            </span>
            <span>{activeTab.label}</span>
          </h2>
          <div className="settings-view-header-actions">
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
            <button
              aria-label="Fechar definicoes"
              className="settings-close-button"
              onClick={onClose}
              type="button"
            >
              <X size={16} strokeWidth={1.8} aria-hidden="true" />
            </button>
          </div>
        </header>

        <nav className="settings-view-tabs" aria-label="Secoes das definicoes">
          {settingsTabs.map((tab) => {
            const Icon = tab.icon;

            return (
              <button
                aria-current={activeSection === tab.id ? "page" : undefined}
                aria-label={tab.description}
                className={[
                  "settings-nav-item",
                  activeSection === tab.id ? "is-active" : ""
                ]
                  .filter(Boolean)
                  .join(" ")}
                key={tab.id}
                onClick={() => onSectionChange(tab.id)}
                title={tab.label}
                type="button"
              >
                <Icon size={14} strokeWidth={1.6} aria-hidden="true" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="settings-view-body">
        {activeSection === "prompt" ? (
          <section
            className="settings-section settings-section--fill"
            aria-label="Prompt"
          >
            <div className="settings-panel-card settings-prompt-editor">
              <p className="settings-panel-card-hint">
                Instrucoes de sistema enviadas ao modelo no inicio de cada turno.
                Deixa vazio para usar o comportamento por defeito.
              </p>
              <label className="settings-field settings-field--editor">
                <span>Prompt do sistema</span>
                <textarea
                  className="settings-prompt-textarea"
                  onChange={(event) => updatePrompt(event.target.value)}
                  placeholder="Ex.: Mantem o tom sombrio e descreve o ambiente com detalhe sensorial..."
                  rows={16}
                  value={draftSettings.prompt}
                />
              </label>
              <div className="settings-prompt-footer">
                <span>Clica «Atualizar alteracoes» para guardar.</span>
                <span>
                  {draftSettings.prompt.length.toLocaleString("pt-PT")} caracteres
                </span>
              </div>
            </div>
          </section>
        ) : null}

        {activeSection === "initialText" ? (
          <section
            className="settings-section settings-section--fill"
            aria-label="Texto inicial"
          >
            <div className="settings-panel-card settings-prompt-editor">
              <p className="settings-panel-card-hint">
                Texto apresentado no chat quando comecas um novo jogo. Se ficar
                vazio, o jogo inicia em silencio.
              </p>
              <label className="settings-field settings-field--editor">
                <span>Texto inicial</span>
                <textarea
                  className="settings-prompt-textarea"
                  onChange={(event) => updateInitialText(event.target.value)}
                  placeholder="Ex.: A venda aperta-te a pele. Ha madeira humida sob os joelhos..."
                  rows={16}
                  value={draftSettings.initialText}
                />
              </label>
              <div className="settings-prompt-footer">
                <span>Clica «Atualizar alteracoes» para guardar.</span>
                <span>
                  {draftSettings.initialText.length.toLocaleString("pt-PT")} caracteres
                </span>
              </div>
            </div>
          </section>
        ) : null}

        {activeSection === "stats" ? (
          <section
            className="settings-section settings-section--fill"
            aria-label="Stats"
          >
            <p className="settings-section-lead">
              Valores de 0 a 100. Sao enviados ao modelo como estado atual do
              personagem.
            </p>
            <div className="settings-stat-grid">
              {statFields.map(({ key, label, tone }) => {
                const value = draftAttributes[key];

                return (
                  <div
                    className={`settings-stat-card settings-stat-card--${tone}`}
                    key={key}
                  >
                    <div className="settings-stat-card-head">
                      <span className="settings-stat-card-label">{label}</span>
                      <input
                        aria-label={`${label} valor`}
                        className="settings-stat-number"
                        max={100}
                        min={0}
                        onChange={(event) =>
                          updateAttribute(key, Number(event.target.value))
                        }
                        type="number"
                        value={value}
                      />
                    </div>
                    <div className="bar-container settings-stat-bar">
                      <div
                        className="bar-fill"
                        style={{ width: `${value}%` }}
                      />
                    </div>
                    <input
                      aria-label={`${label} controlo deslizante`}
                      className="settings-stat-slider"
                      max={100}
                      min={0}
                      onChange={(event) =>
                        updateAttribute(key, Number(event.target.value))
                      }
                      type="range"
                      value={value}
                    />
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}

        {activeSection === "items" ? (
          <section className="settings-section" aria-label="Items">
            <div className="settings-panel-card settings-inventory-compose">
              <h3 className="settings-panel-card-title">Adicionar item</h3>
              <p className="settings-panel-card-hint">
                Pressiona Enter para adicionar rapidamente a mochila.
              </p>
              <div className="settings-add-row">
                <label className="settings-field">
                  <span>Novo item</span>
                  <input
                    onChange={(event) => setNewInventoryItem(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addInventoryItem();
                      }
                    }}
                    placeholder="Ex.: lanterna, chave enferrujada..."
                    value={newInventoryItem}
                  />
                </label>
                <button
                  aria-label="Adicionar item a mochila"
                  className="settings-icon-button settings-add-icon-button"
                  onClick={addInventoryItem}
                  type="button"
                >
                  <Plus size={17} strokeWidth={1.8} aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="settings-panel-card settings-inventory-list-card">
              <div className="settings-panel-card-head">
                <h3 className="settings-panel-card-title">Mochila</h3>
                <span className="settings-panel-card-meta">
                  {draftStatus.inventory.length}{" "}
                  {draftStatus.inventory.length === 1 ? "item" : "itens"}
                </span>
              </div>
              {draftStatus.inventory.length > 0 ? (
                <ul
                  className="settings-inventory-list"
                  aria-label="Itens na mochila"
                >
                  {draftStatus.inventory.map((item, index) => (
                    <li className="settings-inventory-item" key={`${item}-${index}`}>
                      <span className="settings-inventory-index">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <input
                        aria-label={`Editar item ${index + 1}`}
                        onBlur={commitInventoryDraft}
                        onChange={(event) =>
                          updateInventoryDraft(index, event.target.value)
                        }
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.currentTarget.blur();
                          }
                        }}
                        value={item}
                      />
                      <button
                        aria-label={`Remover item ${item}`}
                        className="settings-icon-button"
                        onClick={() => removeInventoryItem(index)}
                        type="button"
                      >
                        <Trash2 size={16} strokeWidth={1.8} aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="settings-empty-note">Mochila vazia.</p>
              )}
            </div>
          </section>
        ) : null}

        {activeSection === "location" ? (
          <section className="settings-section" aria-label="Localizacao">
            <div className="settings-panel-card settings-location-card">
              <p className="settings-panel-card-hint">
                Local atual visivel no HUD e enviado como contexto ao narrador.
              </p>
              <label className="settings-field">
                <span>Localizacao</span>
                <input
                  onChange={(event) => {
                    setApplyStatus("dirty");
                    setDraftStatus({
                      ...draftStatus,
                      location: event.target.value
                    });
                  }}
                  placeholder="Ex.: corredor do porao, sala de estar..."
                  value={draftStatus.location}
                />
              </label>
            </div>
          </section>
        ) : null}

        {activeSection === "skills" ? (
          <SkillsWorkbench
            draftSkills={draftSkills}
            onDraftChange={updateDraftSkills}
            onSkillsEnabledChange={updateSkillsEnabled}
            skillsEnabled={draftSettings.skillsEnabled}
            theme={draftSettings.appearance.theme}
          />
        ) : null}

        {activeSection === "models" ? (
          <section
            className="settings-section settings-section--fill settings-section--models"
            aria-label="AI Models"
          >
            <div className="settings-panel-card settings-model-config">
              <h3 className="settings-panel-card-title">Parametros de geracao</h3>
              <p className="settings-panel-card-hint">
                Ajusta o comportamento do modelo no proximo turno.
              </p>
              <div className="llm-config-grid settings-llm-grid">
                {(Object.keys(llmParamHints) as Array<keyof AdventureSettings["llm"]>).map(
                  (key) => (
                    <label className="settings-field settings-llm-field" key={key}>
                      <span>
                        {key === "temperature"
                          ? "Temperature"
                          : key === "maxCompletionTokens"
                            ? "Max completion tokens"
                            : "Context window"}
                      </span>
                      <input
                        max={
                          key === "temperature"
                            ? 2
                            : key === "maxCompletionTokens"
                              ? 4096
                              : 1000000
                        }
                        min={
                          key === "temperature"
                            ? 0
                            : key === "maxCompletionTokens"
                              ? 128
                              : 4096
                        }
                        onChange={(event) =>
                          updateLlm(key, Number(event.target.value))
                        }
                        step={
                          key === "temperature"
                            ? 0.05
                            : key === "maxCompletionTokens"
                              ? 128
                              : 1024
                        }
                        type="number"
                        value={draftSettings.llm[key]}
                      />
                      <span className="settings-field-hint">{llmParamHints[key]}</span>
                    </label>
                  )
                )}
              </div>
            </div>

            <div className="settings-model-list-head">
              <h3>Modelo OpenRouter</h3>
              <span>Escolhe o modelo usado no proximo turno.</span>
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
                      {model.provider} ·{" "}
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
          <section
            className="settings-section settings-section--fill settings-section--appearance"
            aria-label="Appearance"
          >
            <div className="settings-appearance-layout settings-appearance-compact">
              <div className="settings-appearance-controls">
                <div className="settings-appearance-choices">
                  <div className="settings-appearance-group">
                    <span className="settings-appearance-group-label">Tema</span>
                    <div
                      className="settings-theme-picker"
                      role="radiogroup"
                      aria-label="Tema da interface"
                    >
                  <label
                    className={[
                      "settings-theme-option",
                      draftSettings.appearance.theme === "dark" ? "is-selected" : ""
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <input
                      checked={draftSettings.appearance.theme === "dark"}
                      name="appearance-theme"
                      onChange={handleThemeChange}
                      type="radio"
                      value="dark"
                    />
                    <span
                      aria-hidden="true"
                      className="settings-theme-swatch settings-theme-swatch--dark"
                    />
                    <span className="settings-theme-option-label">Escuro</span>
                  </label>
                  <label
                    className={[
                      "settings-theme-option",
                      draftSettings.appearance.theme === "light" ? "is-selected" : ""
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <input
                      checked={draftSettings.appearance.theme === "light"}
                      name="appearance-theme"
                      onChange={handleThemeChange}
                      type="radio"
                      value="light"
                    />
                    <span
                      aria-hidden="true"
                      className="settings-theme-swatch settings-theme-swatch--light"
                    />
                    <span className="settings-theme-option-label">Claro</span>
                  </label>
                    </div>
                  </div>

                  <div className="settings-appearance-group">
                    <span className="settings-appearance-group-label">Letra</span>
                    <div
                      className="settings-theme-picker settings-typeface-picker"
                      role="radiogroup"
                      aria-label="Tipo de letra da narracao"
                    >
                  {(
                    [
                      {
                        id: "serif" as const,
                        label: uiText.typefaceSerifLabel,
                        hint: uiText.typefaceSerifHint,
                        className: "settings-typeface-swatch--serif"
                      },
                      {
                        id: "sans" as const,
                        label: uiText.typefaceSansLabel,
                        hint: uiText.typefaceSansHint,
                        className: "settings-typeface-swatch--sans"
                      }
                    ] as const
                  ).map((option) => (
                    <label
                      className={[
                        "settings-theme-option settings-typeface-option",
                        draftSettings.appearance.typeface === option.id
                          ? "is-selected"
                          : ""
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      key={option.id}
                    >
                      <input
                        checked={draftSettings.appearance.typeface === option.id}
                        name="appearance-typeface"
                        onChange={() =>
                          updateAppearance({
                            ...draftSettings.appearance,
                            typeface: option.id
                          })
                        }
                        type="radio"
                        value={option.id}
                      />
                      <span
                        aria-hidden="true"
                        className={[
                          "settings-typeface-swatch",
                          option.className
                        ].join(" ")}
                      >
                        Aa
                      </span>
                      <span className="settings-theme-option-label">
                        {option.label}
                      </span>
                    </label>
                  ))}
                    </div>
                  </div>
                </div>

                <div className="settings-appearance-sliders-grid">
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
                  <SettingsRangeSlider
                    ariaLabel={uiText.lineHeightAriaLabel}
                    id="appearance-line-height"
                    label={uiText.lineHeightLabel}
                    max={220}
                    min={140}
                    maxHint={uiText.lineHeightMaxHint}
                    minHint={uiText.lineHeightMinHint}
                    onChange={(value) => {
                      updateAppearance({
                        ...draftSettings.appearance,
                        lineHeight: value
                      });
                    }}
                    step={5}
                    value={draftSettings.appearance.lineHeight}
                    valueText={`${(draftSettings.appearance.lineHeight / 100).toFixed(2)}`}
                  />
                  <SettingsRangeSlider
                    ariaLabel={uiText.contentWidthAriaLabel}
                    id="appearance-content-width"
                    label={uiText.contentWidthLabel}
                    max={84}
                    min={48}
                    maxHint={uiText.contentWidthMaxHint}
                    minHint={uiText.contentWidthMinHint}
                    onChange={(value) => {
                      updateAppearance({
                        ...draftSettings.appearance,
                        contentWidth: value
                      });
                    }}
                    step={2}
                    value={draftSettings.appearance.contentWidth}
                    valueText={`${draftSettings.appearance.contentWidth} ch`}
                  />
                </div>

                <label className="settings-check settings-check--inline">
                  <input
                    checked={draftSettings.appearance.reducedMotion}
                    onChange={(event) =>
                      updateAppearance({
                        ...draftSettings.appearance,
                        reducedMotion: event.target.checked
                      })
                    }
                    type="checkbox"
                  />
                  <span>{uiText.reducedMotionLabel}</span>
                </label>
              </div>

              <AppearancePreview
                contentWidth={draftSettings.appearance.contentWidth}
              />
            </div>
          </section>
        ) : null}
      </div>
    </section>
  );
}
