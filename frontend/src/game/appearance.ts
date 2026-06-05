import type { AdventureAppearance } from "../../../shared/adventureSettings";

export function applyAppearanceToDocument(appearance: AdventureAppearance) {
  const tone = appearance.ereaderTone;
  const mix = tone / 100;

  document.documentElement.dataset.theme = appearance.theme;
  document.documentElement.style.setProperty("--eread-base-mix", `${100 - tone}%`);
  document.documentElement.style.setProperty("--eread-mix", `${tone}%`);
  document.documentElement.style.setProperty("--eread-brightness", String(1 + mix * 0.14));
  document.documentElement.style.setProperty("--eread-sepia", `${mix * 28}%`);
  document.documentElement.style.setProperty(
    "--font-scale",
    String(appearance.fontScale / 100)
  );
  document.documentElement.style.setProperty(
    "--content-width",
    String(appearance.contentWidth)
  );
  document.documentElement.style.setProperty(
    "--read-max-ch",
    `${appearance.contentWidth}ch`
  );
  document.documentElement.style.setProperty(
    "--read-line-height",
    String(appearance.lineHeight / 100)
  );
  document.documentElement.style.setProperty(
    "--read-font-family",
    appearance.typeface === "sans"
      ? 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif'
      : '"Georgia", "Times New Roman", serif'
  );

  if (appearance.reducedMotion) {
    document.documentElement.dataset.reducedMotion = "true";
  } else {
    delete document.documentElement.dataset.reducedMotion;
  }

  window.localStorage.setItem("blindfold-theme", appearance.theme);
  window.localStorage.setItem("blindfold-eread-tone", String(tone));
  window.localStorage.setItem("blindfold-font-scale", String(appearance.fontScale));
}
