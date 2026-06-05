import type { ReactNode } from "react";

type SettingsRangeSliderProps = {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  minHint: string;
  maxHint: string;
  ariaLabel: string;
  valueText: string;
  icon?: ReactNode;
  onChange: (value: number) => void;
};

export function SettingsRangeSlider({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  minHint,
  maxHint,
  ariaLabel,
  valueText,
  icon,
  onChange
}: SettingsRangeSliderProps) {
  return (
    <div className="settings-range-control">
      <label className="settings-range-label" htmlFor={id}>
        {icon}
        <span>{label}</span>
        <span className="settings-range-value">{valueText}</span>
      </label>
      <input
        aria-label={ariaLabel}
        aria-valuetext={valueText}
        className="settings-range-slider"
        id={id}
        max={max}
        min={min}
        onChange={(event) => onChange(Number(event.target.value))}
        step={step}
        type="range"
        value={value}
      />
      <div className="settings-range-hints" aria-hidden="true">
        <span>{minHint}</span>
        <span>{maxHint}</span>
      </div>
    </div>
  );
}
