import { useMemo } from "react";
import { Brain } from "lucide-react";
import { uiText } from "../content/uiText";
import { formatMemoryToken, listMemoryVariables } from "../game/adventureMemory";
import type { AdventureMemory, MemorySource } from "../types";

type MemoryPanelProps = {
  memory: AdventureMemory;
};

const sourceLabels: Record<MemorySource, string> = {
  jogador: uiText.memorySourcePlayer,
  externo: uiText.memorySourceExternal,
  descoberta: uiText.memorySourceDiscovery
};

export function MemoryPanel({ memory }: MemoryPanelProps) {
  const variables = useMemo(
    () =>
      listMemoryVariables(memory).sort((left, right) =>
        left.description.localeCompare(right.description, "pt")
      ),
    [memory]
  );

  return (
    <section aria-label={uiText.memoryAriaLabel} className="memory-view">
      <header className="memory-view-header">
        <div className="memory-view-heading">
          <span aria-hidden="true" className="memory-view-icon">
            <Brain size={18} strokeWidth={1.6} />
          </span>
          <div>
            <h2 className="memory-view-title">{uiText.memoryTitle}</h2>
            <p className="memory-view-lead">{uiText.memoryLead}</p>
          </div>
        </div>
        {variables.length > 0 ? (
          <span className="memory-view-count">
            {uiText.memoryCountLabel(variables.length)}
          </span>
        ) : null}
      </header>

      {variables.length === 0 ? (
        <p className="memory-view-empty">{uiText.memoryEmpty}</p>
      ) : (
        <ul className="memory-view-list">
          {variables.map((entry) => (
            <li className="memory-card" key={entry.key}>
              <div className="memory-card-head">
                <h3 className="memory-card-fact">{entry.description}</h3>
                <span className={`memory-source memory-source-${entry.source}`}>
                  {sourceLabels[entry.source]}
                </span>
              </div>
              <p className="memory-card-detail">
                <span className="memory-card-label">{formatMemoryToken(entry.key)}</span>
                <span aria-hidden="true" className="memory-card-separator">
                  ·
                </span>
                <span className="memory-card-state">{formatMemoryToken(entry.value)}</span>
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
