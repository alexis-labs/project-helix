import { Brain } from "lucide-react";
import { uiText } from "../content/uiText";
import { listMemoryVariables } from "../game/adventureMemory";
import type { AdventureMemory, MemorySource } from "../types";

type MemoryPanelProps = {
  memory: AdventureMemory;
  centered?: boolean;
};

const sourceLabels: Record<MemorySource, string> = {
  jogador: uiText.memorySourcePlayer,
  externo: uiText.memorySourceExternal,
  descoberta: uiText.memorySourceDiscovery
};

export function MemoryPanel({ memory, centered = false }: MemoryPanelProps) {
  const variables = listMemoryVariables(memory);

  return (
    <section
      aria-label={uiText.memoryAriaLabel}
      className={[
        "memory-panel",
        centered ? "memory-panel-centered narration-panel" : ""
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="memory-panel-header">
        <Brain aria-hidden="true" className="memory-panel-icon" size={14} strokeWidth={1.6} />
        <h3>{uiText.memoryTitle}</h3>
      </div>
      {variables.length === 0 ? (
        <p className="memory-empty">{uiText.memoryEmpty}</p>
      ) : (
        <ul className="memory-list">
          {variables.map((entry) => (
            <li className="memory-entry" key={entry.key}>
              <div className="memory-entry-top">
                <span className="memory-key">{entry.key.replace(/_/g, " ")}</span>
                <span className={`memory-source memory-source-${entry.source}`}>
                  {sourceLabels[entry.source]}
                </span>
              </div>
              <p className="memory-value">{entry.value.replace(/_/g, " ")}</p>
              <p className="memory-description">{entry.description}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
