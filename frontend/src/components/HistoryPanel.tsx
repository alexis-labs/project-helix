import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { uiText } from "../content/uiText";
import { EreaderToneSlider } from "./EreaderToneSlider";
import { StateIndicators } from "./StateIndicators";
import type { AttributeKey } from "../game/attributeChanges";
import type { GameAttributes, GameStatus, SidebarAction } from "../types";

type HistoryPanelProps = {
  actions: SidebarAction[];
  attributeChanges?: Partial<Record<AttributeKey, number>> | null;
  attributes: GameAttributes;
  ereaderTone: number;
  isEreaderToneOpen: boolean;
  isOpen: boolean;
  onEreaderToneChange: (value: number) => void;
  onToggle: () => void;
  status: GameStatus;
};

export function HistoryPanel({
  actions,
  attributeChanges,
  attributes,
  ereaderTone,
  isEreaderToneOpen,
  isOpen,
  onEreaderToneChange,
  onToggle,
  status
}: HistoryPanelProps) {
  const ToggleIcon = isOpen ? PanelRightClose : PanelRightOpen;
  const isToneControlVisible = isOpen && isEreaderToneOpen;

  return (
    <aside
      className={[
        "history-panel",
        isOpen ? "is-open" : "",
        isToneControlVisible ? "is-tone-open" : ""
      ]
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

      {isToneControlVisible ? (
        <EreaderToneSlider
          onChange={onEreaderToneChange}
          value={ereaderTone}
        />
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
