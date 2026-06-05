import { uiText } from "../content/uiText";
import { formatFoldersForApi, formatSkillsForApi } from "../game/adventureSkills";
import type { CriticalAttribute } from "../game/attributes";
import type { AdventureSettings, AdventureSkills, Turn } from "../types";

type SummaryResponse = {
  summary?: string;
  error?: string;
};

function resolveApiBase() {
  const configured = import.meta.env.VITE_API_URL?.trim();

  if (configured) {
    return configured.replace(/\/$/, "");
  }

  if (import.meta.env.DEV) {
    return "";
  }

  return "http://localhost:3011";
}

export function buildLocalSummary(cause: CriticalAttribute) {
  return uiText.gameOverFallbackSummary(cause);
}

export async function requestStorySummary(
  history: Turn[],
  skills: AdventureSkills,
  cause: CriticalAttribute,
  adventureSettings: AdventureSettings
) {
  const apiBase = resolveApiBase();
  let response: Response;

  try {
    response = await fetch(`${apiBase}/api/summary`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cause,
        model: adventureSettings.selectedModel,
        adventureSettings,
        skills: formatSkillsForApi(skills),
        folders: formatFoldersForApi(skills),
        history: history.slice(-12).map((turn) => ({
          role: turn.role,
          content: turn.contextContent || turn.content
        }))
      })
    });
  } catch {
    return buildLocalSummary(cause);
  }

  const text = await response.text();

  if (!text.trim()) {
    return buildLocalSummary(cause);
  }

  let data: SummaryResponse;

  try {
    data = JSON.parse(text) as SummaryResponse;
  } catch {
    return buildLocalSummary(cause);
  }

  if (!response.ok) {
    return buildLocalSummary(cause);
  }

  return data.summary?.trim() || buildLocalSummary(cause);
}
