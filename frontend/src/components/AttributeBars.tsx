import { AttributeChangeList } from "./AttributeChangeList";
import type { AttributeKey } from "../game/attributeChanges";
import type { GameAttributes } from "../types";

type AttributeTone = AttributeKey;

type AttributeBarProps = {
  change?: number;
  label: string;
  value: number;
  max: number;
  tone: AttributeTone;
};

function AttributeBar({ change, label, value, max, tone }: AttributeBarProps) {
  const percentage = (value / max) * 100;
  const hasChange = change !== undefined && change !== 0;

  return (
    <>
      <label className="attribute-bar-label">{label}</label>
      <div className="bar-container">
        <div
          className={`bar-fill bar-fill-${tone}`}
          style={{
            width: `${percentage}%`
          }}
        />
      </div>
      <div className="attribute-bar-meta">
        <span className="bar-value">{value}</span>
        {hasChange ? (
          <AttributeChangeList
            changes={{ [tone]: change }}
            className="attribute-change-list--bar"
          />
        ) : null}
      </div>
    </>
  );
}

type AttributeBarsProps = GameAttributes & {
  changes?: Partial<Record<AttributeKey, number>> | null;
  className?: string;
};

export function AttributeBars({
  changes,
  className,
  fear,
  injuries,
  hunger,
  exhaustion
}: AttributeBarsProps) {
  return (
    <div className={["attribute-bars", className].filter(Boolean).join(" ")}>
      <AttributeBar
        change={changes?.fear}
        label="Medo"
        value={fear}
        max={100}
        tone="fear"
      />
      <AttributeBar
        change={changes?.injuries}
        label="Ferimentos"
        value={injuries}
        max={100}
        tone="injuries"
      />
      <AttributeBar
        change={changes?.hunger}
        label="Fome"
        value={hunger}
        max={100}
        tone="hunger"
      />
      <AttributeBar
        change={changes?.exhaustion}
        label="Exaustão"
        value={exhaustion}
        max={100}
        tone="exhaustion"
      />
    </div>
  );
}
