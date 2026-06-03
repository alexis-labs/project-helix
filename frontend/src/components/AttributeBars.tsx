import type { GameAttributes } from "../types";

type AttributeBarProps = {
  label: string;
  value: number;
  max: number;
  tone: "fear" | "injuries" | "hunger" | "exhaustion";
};

function AttributeBar({ label, value, max, tone }: AttributeBarProps) {
  const percentage = (value / max) * 100;

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
      <span className="bar-value">{value}</span>
    </>
  );
}

type AttributeBarsProps = GameAttributes & {
  className?: string;
};

export function AttributeBars({
  className,
  fear,
  injuries,
  hunger,
  exhaustion
}: AttributeBarsProps) {
  return (
    <div className={["attribute-bars", className].filter(Boolean).join(" ")}>
      <AttributeBar label="Medo" value={fear} max={100} tone="fear" />
      <AttributeBar label="Ferimentos" value={injuries} max={100} tone="injuries" />
      <AttributeBar label="Fome" value={hunger} max={100} tone="hunger" />
      <AttributeBar label="Exaustão" value={exhaustion} max={100} tone="exhaustion" />
    </div>
  );
}
