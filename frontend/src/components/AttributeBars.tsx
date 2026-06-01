import type { GameAttributes } from "../types";

type AttributeBarProps = {
  label: string;
  value: number;
  max: number;
  color: string;
};

function AttributeBar({ label, value, max, color }: AttributeBarProps) {
  const percentage = (value / max) * 100;

  return (
    <>
      <label className="attribute-bar-label">{label}</label>
      <div className="bar-container">
        <div
          className="bar-fill"
          style={{
            width: `${percentage}%`,
            backgroundColor: color
          }}
        />
      </div>
      <span className="bar-value">{value}</span>
    </>
  );
}

export function AttributeBars({ fear, injuries, hunger, exhaustion }: GameAttributes) {
  return (
    <div className="attribute-bars">
      <AttributeBar label="Medo" value={fear} max={100} color="#dc2626" />
      <AttributeBar label="Ferimentos" value={injuries} max={100} color="#ea580c" />
      <AttributeBar label="Fome" value={hunger} max={100} color="#d4af37" />
      <AttributeBar label="Exaustão" value={exhaustion} max={100} color="#4ade80" />
    </div>
  );
}
