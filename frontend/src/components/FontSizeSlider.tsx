import { Type } from "lucide-react";
import { uiText } from "../content/uiText";
import { FONT_SCALE_MAX, FONT_SCALE_MIN } from "../hooks/useFontScale";

type FontSizeSliderProps = {
  value: number;
  onChange: (value: number) => void;
};

export function FontSizeSlider({ value, onChange }: FontSizeSliderProps) {
  return (
    <div className="font-scale-control">
      <label className="font-scale-label" htmlFor="font-scale">
        <Type size={14} strokeWidth={1.5} aria-hidden="true" />
        <span>{uiText.fontScaleLabel}</span>
        <span className="font-scale-value">{value}%</span>
      </label>
      <input
        aria-label={uiText.fontScaleAriaLabel}
        aria-valuetext={uiText.fontScaleValueLabel(value)}
        className="font-scale-slider"
        id="font-scale"
        max={FONT_SCALE_MAX}
        min={FONT_SCALE_MIN}
        onChange={(event) => onChange(Number(event.target.value))}
        step={5}
        type="range"
        value={value}
      />
      <div className="font-scale-hints" aria-hidden="true">
        <span>{uiText.fontScaleMinHint}</span>
        <span>{uiText.fontScaleMaxHint}</span>
      </div>
    </div>
  );
}
