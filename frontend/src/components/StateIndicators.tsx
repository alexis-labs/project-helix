import { Backpack, HeartPulse, Map, MapPin, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { uiText } from "../content/uiText";
import type { GameAttributes } from "../types";
import { AttributeBars } from "./AttributeBars";

type StateIndicatorsProps = {
  attributes: GameAttributes;
  inventory: string[];
  location: string;
};

type StateIndicatorProps = {
  children?: ReactNode;
  icon: LucideIcon;
  label: string;
  value: string;
  variant: "location" | "inventory" | "vitals";
};

function StateIndicator({ children, icon: Icon, label, value, variant }: StateIndicatorProps) {
  return (
    <article className={`state-indicator state-indicator-${variant}`}>
      <span className="state-indicator-icon" aria-hidden="true">
        <Icon size={16} strokeWidth={1.6} />
      </span>
      <span className="state-indicator-label">{label}</span>
      <strong className="state-indicator-value">{value}</strong>
      {children}
    </article>
  );
}

function formatInventoryItem(item: string) {
  const words = item.trim().split(/\s+/).filter(Boolean);

  if (words.length <= 2) {
    return item;
  }

  return `${words.slice(0, 2).join(" ")}…`;
}

function InventoryItems({ inventory }: Pick<StateIndicatorsProps, "inventory">) {
  const visibleItems = inventory.slice(0, 4);
  const hiddenCount = inventory.length - visibleItems.length;
  const slots = Array.from({ length: 4 }, (_, index) => visibleItems[index] ?? null);

  return (
    <ul className="inventory-slot-list" aria-label={uiText.inventoryItemsAriaLabel}>
      {slots.map((item, index) => {
        const shortLabel = item ? formatInventoryItem(item) : uiText.inventoryEmptySlotLabel;

        return (
          <li
            aria-label={item ?? uiText.inventoryEmptySlotLabel}
            className={item ? "inventory-slot" : "inventory-slot inventory-slot-empty"}
            key={item ? `${item}-${index}` : `empty-${index}`}
            title={item ?? uiText.inventoryEmptySlotLabel}
          >
            {shortLabel}
          </li>
        );
      })}
      {hiddenCount > 0 ? (
        <li className="inventory-slot inventory-slot-more">
          {uiText.inventoryHiddenItemsLabel(hiddenCount)}
        </li>
      ) : null}
    </ul>
  );
}

function vitalsSummary({ fear, injuries, hunger, exhaustion }: GameAttributes) {
  const peak = Math.max(fear, injuries, hunger, exhaustion);

  if (peak >= 75) {
    return uiText.vitalsCriticalLabel;
  }

  if (peak >= 45) {
    return uiText.vitalsStrainedLabel;
  }

  return uiText.vitalsStableLabel;
}

export function StateIndicators({ attributes, inventory, location }: StateIndicatorsProps) {
  const inventoryCount =
    inventory.length === 1
      ? uiText.inventorySingleItemLabel
      : uiText.inventoryItemsLabel(inventory.length);

  return (
    <section className="state-indicators" aria-label={uiText.stateIndicatorsAriaLabel}>
      <StateIndicator
        icon={Map}
        label={uiText.mapIndicatorLabel}
        value={location}
        variant="location"
      >
        <span className="state-indicator-detail">
          <MapPin size={12} strokeWidth={1.8} aria-hidden="true" />
          {uiText.mapCurrentLocationLabel}
        </span>
        <span className="map-grid-marker" aria-hidden="true" />
      </StateIndicator>
      <StateIndicator
        icon={Backpack}
        label={uiText.inventoryIndicatorLabel}
        value={inventoryCount}
        variant="inventory"
      >
        <InventoryItems inventory={inventory} />
      </StateIndicator>
      <StateIndicator
        icon={HeartPulse}
        label={uiText.vitalsIndicatorLabel}
        value={vitalsSummary(attributes)}
        variant="vitals"
      >
        <AttributeBars className="attribute-bars--card" {...attributes} />
      </StateIndicator>
    </section>
  );
}
