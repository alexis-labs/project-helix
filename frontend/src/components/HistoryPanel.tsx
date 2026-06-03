import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { useEffect, useRef } from "react";
import { uiText } from "../content/uiText";
import { EreaderToneSlider } from "./EreaderToneSlider";
import { StateIndicators } from "./StateIndicators";
import type { GameAttributes, GameStatus, SidebarAction, Turn } from "../types";

type HistoryPanelProps = {
  actions: SidebarAction[];
  attributes: GameAttributes;
  ereaderTone: number;
  history: Turn[];
  isEreaderToneOpen: boolean;
  isOpen: boolean;
  onEreaderToneChange: (value: number) => void;
  onToggle: () => void;
  status: GameStatus;
};

export function HistoryPanel({
  actions,
  attributes,
  ereaderTone,
  history,
  isEreaderToneOpen,
  isOpen,
  onEreaderToneChange,
  onToggle,
  status
}: HistoryPanelProps) {
  const listRef = useRef<HTMLOListElement>(null);
  const ToggleIcon = isOpen ? PanelRightClose : PanelRightOpen;
  const isToneControlVisible = isOpen && isEreaderToneOpen;

  useEffect(() => {
    const list = listRef.current;

    if (!list || !isOpen) {
      return;
    }

    list.scrollTop = list.scrollHeight;
  }, [history, isOpen]);

  return (
    <aside
      className={[
        "history-panel",
        isOpen ? "is-open" : "",
        isToneControlVisible ? "is-tone-open" : ""
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={uiText.historyAriaLabel}
    >
      <div className="sidebar-top">
        <h2>{uiText.historyTitle}</h2>
        <div className="sidebar-actions" aria-label={uiText.sidebarActionsLabel}>
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
            aria-label={isOpen ? uiText.historyCollapseLabel : uiText.historyExpandLabel}
            className="history-toggle"
            onClick={onToggle}
            type="button"
          >
            <ToggleIcon size={17} strokeWidth={1.8} aria-hidden="true" />
          </button>
        </div>
      </div>
      {isToneControlVisible ? (
        <EreaderToneSlider
          onChange={onEreaderToneChange}
          value={ereaderTone}
        />
      ) : null}
      <ol className="history-list" aria-hidden={!isOpen} ref={listRef}>
        {history.map((turn, index) => (
          <li className="history-turn" key={`${turn.role}-${index}`}>
            <div className="history-meta">
              <span className="history-index">{String(index + 1).padStart(2, "0")}</span>
              <span className="history-role">
                {turn.role === "player" ? uiText.playerLabel : uiText.narratorLabel}
              </span>
            </div>
            <p>{turn.content}</p>
          </li>
        ))}
      </ol>
      <div className="sidebar-footer">
        <StateIndicators
          attributes={attributes}
          inventory={status.inventory}
          location={status.location}
        />
      </div>
    </aside>
  );
}
