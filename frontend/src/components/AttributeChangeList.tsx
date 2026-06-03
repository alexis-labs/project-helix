import { uiText } from "../content/uiText";
import {
  ATTRIBUTE_KEYS,
  hasAttributeDeltas,
  type AttributeKey
} from "../game/attributeChanges";

type AttributeChangeListProps = {
  changes: Partial<Record<AttributeKey, number>> | null | undefined;
  className?: string;
};

export function AttributeChangeList({ changes, className }: AttributeChangeListProps) {
  if (!hasAttributeDeltas(changes)) {
    return null;
  }

  return (
    <ul
      aria-label={uiText.attributeChangesAriaLabel}
      className={["attribute-change-list", className].filter(Boolean).join(" ")}
    >
      {ATTRIBUTE_KEYS.filter((key) => changes[key] !== undefined).map((key) => {
        const delta = changes[key]!;

        return (
          <li
            className={[
              "attribute-change",
              `attribute-change--${key}`,
              delta > 0 ? "is-increase" : "is-decrease"
            ].join(" ")}
            key={key}
          >
            {uiText.attributeChangeLabel(delta, uiText.attributeNames[key])}
          </li>
        );
      })}
    </ul>
  );
}
