import type { CSSProperties } from "react";
import { uiText } from "../content/uiText";

type AppearancePreviewProps = {
  contentWidth: number;
};

export function AppearancePreview({ contentWidth }: AppearancePreviewProps) {
  const previewStyle = {
    "--content-width": String(contentWidth)
  } as CSSProperties;

  return (
    <div
      aria-label={uiText.appearancePreviewAriaLabel}
      className="settings-appearance-preview"
    >
      <h3 className="settings-appearance-preview-title">
        {uiText.appearancePreviewTitle}
      </h3>
      <div
        className="settings-appearance-preview-stage narration-panel"
        style={previewStyle}
      >
        <p>{uiText.appearancePreviewNarration}</p>
        <div className="current-action">
          <span>{uiText.appearancePreviewActionLabel}</span>
          <p>{uiText.appearancePreviewAction}</p>
        </div>
      </div>
    </div>
  );
}
