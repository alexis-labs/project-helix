import {
  ArrowDown,
  ArrowUp,
  Bandage,
  Ghost,
  Moon,
  Utensils,
  type LucideIcon
} from "lucide-react";
import { uiText } from "../content/uiText";
import {
  ATTRIBUTE_KEYS,
  hasAttributeDeltas,
  type AttributeKey
} from "../game/attributeChanges";

type AttributeChangeOverlayProps = {
  changes: Partial<Record<AttributeKey, number>> | null | undefined;
  pulseKey: number;
};

const ATTRIBUTE_ICONS: Record<AttributeKey, LucideIcon> = {
  fear: Ghost,
  injuries: Bandage,
  hunger: Utensils,
  exhaustion: Moon
};

export function AttributeChangeOverlay({
  changes,
  pulseKey
}: AttributeChangeOverlayProps) {
  if (!hasAttributeDeltas(changes)) {
    return null;
  }

  return (
    <div
      aria-label={uiText.attributeChangesAriaLabel}
      aria-live="polite"
      className="attribute-change-overlay"
      key={pulseKey}
    >
      <div className="attribute-change-overlay__stack">
        {ATTRIBUTE_KEYS.filter((key) => changes[key] !== undefined).map((key) => {
          const delta = changes[key]!;
          const isIncrease = delta > 0;
          const Icon = ATTRIBUTE_ICONS[key];
          const DirectionIcon = isIncrease ? ArrowUp : ArrowDown;

          return (
            <div
              className={[
                "attribute-change-burst",
                `attribute-change-burst--${key}`,
                isIncrease ? "is-increase" : "is-decrease"
              ].join(" ")}
              key={key}
            >
              <span className="attribute-change-burst__accent" aria-hidden="true" />
              <div className="attribute-change-burst__head">
                <span className="attribute-change-burst__icon" aria-hidden="true">
                  <Icon size={14} strokeWidth={1.8} />
                </span>
                <span className="attribute-change-burst__direction" aria-hidden="true">
                  <DirectionIcon size={13} strokeWidth={2.2} />
                </span>
              </div>
              <span className="attribute-change-burst__value">
                {isIncrease ? "+" : ""}
                {delta}
              </span>
              <span className="attribute-change-burst__label">
                {uiText.attributeNames[key]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
