import { useEffect, useState } from "react";

const STORAGE_KEY = "blindfold-eread-tone";

function readStoredTone() {
  const saved = window.localStorage.getItem(STORAGE_KEY);
  const parsed = saved ? Number.parseInt(saved, 10) : 0;

  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return Math.min(100, Math.max(0, parsed));
}

function applyToneToDocument(tone: number) {
  const mix = tone / 100;

  document.documentElement.style.setProperty("--eread-base-mix", `${100 - tone}%`);
  document.documentElement.style.setProperty("--eread-mix", `${tone}%`);
  document.documentElement.style.setProperty("--eread-brightness", String(1 + mix * 0.14));
  document.documentElement.style.setProperty("--eread-sepia", `${mix * 28}%`);
}

export function useEreaderTone() {
  const [tone, setTone] = useState(() => {
    const stored = readStoredTone();
    applyToneToDocument(stored);
    return stored;
  });

  useEffect(() => {
    applyToneToDocument(tone);
    window.localStorage.setItem(STORAGE_KEY, String(tone));
  }, [tone]);

  return { tone, setTone };
}
