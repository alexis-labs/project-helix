import { ArrowLeft, BookMarked, PanelRightClose, PanelRightOpen } from "lucide-react";
import { settingsNavItems, type SettingsSection } from "./AdventureSettingsPanel";
import { uiText } from "../content/uiText";
import { StateIndicators } from "./StateIndicators";
import type { AttributeKey } from "../game/attributeChanges";
import type {
  GameAttributes,
  GameStatus,
  SidebarAction
} from "../types";

type HistoryPanelProps = {
  actions: SidebarAction[];
  activeSettingsSection: SettingsSection | null;
  attributeChanges?: Partial<Record<AttributeKey, number>> | null;
  attributes: GameAttributes;
  isOpen: boolean;
  onBackToChat: () => void;
  onOpenSettings: (section: SettingsSection) => void;
  onToggle: () => void;
  status: GameStatus;
};

export function HistoryPanel({
  actions,
  activeSettingsSection,
  attributeChanges,
  attributes,
  isOpen,
  onBackToChat,
  onOpenSettings,
  onToggle,
  status
}: HistoryPanelProps) {
  const ToggleIcon = isOpen ? PanelRightClose : PanelRightOpen;

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
        <div className="sidebar-settings-nav">
          <div className="settings-heading settings-heading--compact">
            <BookMarked size={17} strokeWidth={1.7} aria-hidden="true" />
            <div>
              <p className="settings-kicker">Definicoes</p>
              <h2>Sandbox</h2>
            </div>
          </div>

          {activeSettingsSection ? (
            <button
              className="settings-back-to-chat"
              onClick={onBackToChat}
              type="button"
            >
              <ArrowLeft size={15} strokeWidth={1.7} aria-hidden="true" />
              <span>{uiText.sandboxBackToChatLabel}</span>
            </button>
          ) : null}

          <nav className="settings-nav" aria-label="Abrir definicoes no centro">
            {settingsNavItems.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  aria-current={
                    activeSettingsSection === item.id ? "page" : undefined
                  }
                  className={[
                    "settings-nav-item",
                    activeSettingsSection === item.id ? "is-active" : ""
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  key={item.id}
                  onClick={() => onOpenSettings(item.id)}
                  title={`${item.group}: ${item.label}`}
                  type="button"
                >
                  <Icon size={15} strokeWidth={1.6} aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
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
