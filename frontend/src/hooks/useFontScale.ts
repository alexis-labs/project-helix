import { useEffect, useState } from "react";

export const FONT_SCALE_MIN = 85;
export const FONT_SCALE_MAX = 130;
export const FONT_SCALE_DEFAULT = 92;

const STORAGE_KEY = "blindfold-font-scale";

function readStoredFontScale() {
  const saved = window.localStorage.getItem(STORAGE_KEY);
  const parsed = saved ? Number.parseInt(saved, 10) : FONT_SCALE_DEFAULT;

  if (!Number.isFinite(parsed)) {
    return FONT_SCALE_DEFAULT;
  }

  return Math.min(FONT_SCALE_MAX, Math.max(FONT_SCALE_MIN, parsed));
}

function applyFontScaleToDocument(scalePercent: number) {
  document.documentElement.style.setProperty(
    "--font-scale",
    String(scalePercent / 100)
  );
}

export function useFontScale() {
  const [fontScale, setFontScale] = useState(() => {
    const stored = readStoredFontScale();
    applyFontScaleToDocument(stored);
    return stored;
  });

  useEffect(() => {
    applyFontScaleToDocument(fontScale);
    window.localStorage.setItem(STORAGE_KEY, String(fontScale));
  }, [fontScale]);

  return { fontScale, setFontScale };
}
