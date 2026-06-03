import { AttributeChangeList } from "./AttributeChangeList";
import type { AttributeKey } from "../game/attributeChanges";
import type { GameAttributes } from "../types";

type AttributeTone = AttributeKey;

const BAR_GREEN = [34, 197, 94] as const;
const BAR_ORANGE = [249, 115, 22] as const;
const BAR_RED = [239, 68, 68] as const;

function mixChannel(a: number, b: number, t: number) {
  return Math.round(a + (b - a) * t);
}

function barFillColor(ratio: number): string {
  const t = Math.min(1, Math.max(0, ratio));
  let rgb: readonly [number, number, number];

  if (t <= 0.5) {
    const blend = t / 0.5;
    rgb = [
      mixChannel(BAR_GREEN[0], BAR_ORANGE[0], blend),
      mixChannel(BAR_GREEN[1], BAR_ORANGE[1], blend),
      mixChannel(BAR_GREEN[2], BAR_ORANGE[2], blend)
    ];
  } else {
    const blend = (t - 0.5) / 0.5;
    rgb = [
      mixChannel(BAR_ORANGE[0], BAR_RED[0], blend),
      mixChannel(BAR_ORANGE[1], BAR_RED[1], blend),
      mixChannel(BAR_ORANGE[2], BAR_RED[2], blend)
    ];
  }

  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

type AttributeBarProps = {
  change?: number;
  label: string;
  value: number;
  max: number;
  tone: AttributeTone;
};

function AttributeBar({ change, label, value, max, tone }: AttributeBarProps) {
  const ratio = value / max;
  const percentage = ratio * 100;
  const hasChange = change !== undefined && change !== 0;

  return (
    <div className="attribute-bar">
      <div className="attribute-bar-head">
        <label className="attribute-bar-label">{label}</label>
        <div className="attribute-bar-meta">
          <span className="bar-value">{value}</span>
          {hasChange ? (
            <AttributeChangeList
              changes={{ [tone]: change }}
              className="attribute-change-list--bar"
            />
          ) : null}
        </div>
      </div>
      <div className="bar-container">
        <div
          className="bar-fill"
          style={{
            width: `${percentage}%`,
            backgroundColor: barFillColor(ratio)
          }}
        />
      </div>
    </div>
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
