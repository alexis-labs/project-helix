import { uiText } from "../content/uiText";

type ContextUsageRingProps = {
  percent: number;
  usedTokens: number;
  limitTokens: number;
};

const RING_RADIUS = 7;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export function ContextUsageRing({
  percent,
  usedTokens,
  limitTokens
}: ContextUsageRingProps) {
  const clampedPercent = Math.min(100, Math.max(0, percent));
  const dashOffset =
    RING_CIRCUMFERENCE - (RING_CIRCUMFERENCE * clampedPercent) / 100;
  const tone =
    clampedPercent >= 92
      ? "is-critical"
      : clampedPercent >= 78
        ? "is-warn"
        : "";

  return (
    <div
      className={["context-usage", tone].filter(Boolean).join(" ")}
      title={uiText.contextUsageHint(usedTokens, limitTokens, clampedPercent)}
    >
      <svg
        aria-hidden="true"
        className="context-usage-ring"
        height={18}
        viewBox="0 0 18 18"
        width={18}
      >
        <circle
          className="context-usage-track"
          cx={9}
          cy={9}
          fill="none"
          r={RING_RADIUS}
          strokeWidth={1.5}
        />
        <circle
          className="context-usage-progress"
          cx={9}
          cy={9}
          fill="none"
          r={RING_RADIUS}
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          strokeWidth={1.5}
          transform="rotate(-90 9 9)"
        />
      </svg>
      <span className="context-usage-label" aria-live="polite">
        {clampedPercent}%
      </span>
      <span className="sr-only">
        {uiText.contextUsageAriaLabel(clampedPercent, usedTokens, limitTokens)}
      </span>
    </div>
  );
}
