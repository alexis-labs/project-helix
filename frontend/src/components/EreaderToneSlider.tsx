import { Sun } from "lucide-react";
import { uiText } from "../content/uiText";

type EreaderToneSliderProps = {
  value: number;
  onChange: (value: number) => void;
};

export function EreaderToneSlider({ value, onChange }: EreaderToneSliderProps) {
  return (
    <div className="eread-tone-control">
      <label className="eread-tone-label" htmlFor="eread-tone">
        <Sun size={14} strokeWidth={1.5} aria-hidden="true" />
        <span>{uiText.ereadToneLabel}</span>
        <span className="eread-tone-value">{value}%</span>
      </label>
      <input
        aria-label={uiText.ereadToneAriaLabel}
        aria-valuetext={uiText.ereadToneValueLabel(value)}
        className="eread-tone-slider"
        id="eread-tone"
        max={100}
        min={0}
        onChange={(event) => onChange(Number(event.target.value))}
        type="range"
        value={value}
      />
      <div className="eread-tone-hints" aria-hidden="true">
        <span>{uiText.ereadToneMinHint}</span>
        <span>{uiText.ereadToneMaxHint}</span>
      </div>
    </div>
  );
}
