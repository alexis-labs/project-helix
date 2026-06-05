import { isSkillsEnabled } from "../../../shared/adventureSettings";
import type { LlmDebugPayload } from "../../../shared/llmDebug";
import { emptyNarrationFallback } from "../content/story";
import { uiText } from "../content/uiText";
import {
  ensureDefaultSkillLibrary,
  formatFoldersForApi,
  formatSkillsForApi
} from "../game/adventureSkills";
import type {
  AdventureSettings,
  AdventureSkill,
  AdventureSkills,
  GameAttributes,
  GameStatus,
  Turn
} from "../types";

export type PlayUsage = {
  promptTokens: number;
  totalTokens: number;
  contextLimit: number;
};

type PlayResponse = {
  reply?: string;
  skillUpdates?: AdventureSkill[];
  usage?: PlayUsage;
  debug?: LlmDebugPayload;
  error?: string;
};

export type NarrationResult = {
  reply: string;
  skillUpdates: AdventureSkill[];
  usage: PlayUsage | null;
  debug: LlmDebugPayload | null;
};

async function readPlayResponse(response: Response): Promise<PlayResponse> {
  const text = await response.text();

  if (!text.trim()) {
    return {
      error: response.ok ? undefined : uiText.backendUnreachable
    };
  }

  try {
    return JSON.parse(text) as PlayResponse;
  } catch {
    return { error: response.ok ? uiText.requestError : text };
  }
}

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

export async function requestNarration(
  message: string,
  history: Turn[],
  skills: AdventureSkills,
  attributes: GameAttributes,
  status: GameStatus,
  adventureSettings: AdventureSettings
): Promise<NarrationResult> {
  const apiBase = resolveApiBase();
  const useSkills = isSkillsEnabled(adventureSettings);
  const skillsForRequest = useSkills ? ensureDefaultSkillLibrary(skills) : skills;
  let response: Response;

  try {
    response = await fetch(`${apiBase}/api/play`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        model: adventureSettings.selectedModel,
        adventureSettings,
        skills: useSkills ? formatSkillsForApi(skillsForRequest) : [],
        folders: useSkills ? formatFoldersForApi(skillsForRequest) : [],
        attributes,
        status,
        history: history.slice(-12).map((turn) => ({
          role: turn.role,
          content: turn.contextContent || turn.content
        }))
      })
    });
  } catch {
    throw new Error(uiText.backendUnreachable);
  }

  const data = await readPlayResponse(response);

  if (!response.ok) {
    throw new Error(data.error?.trim() || uiText.requestError);
  }

  const reply = data.reply?.trim() || emptyNarrationFallback;
  const usage = data.usage;
  const skillUpdates = Array.isArray(data.skillUpdates) ? data.skillUpdates : [];

  return {
    reply,
    skillUpdates,
    usage:
      usage &&
      typeof usage.promptTokens === "number" &&
      typeof usage.contextLimit === "number"
        ? {
            promptTokens: usage.promptTokens,
            totalTokens: usage.totalTokens ?? usage.promptTokens,
            contextLimit: usage.contextLimit
          }
        : null,
    debug: isLlmDebugPayload(data.debug) ? data.debug : null
  };
}

function isLlmDebugPayload(value: unknown): value is LlmDebugPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Partial<LlmDebugPayload>;

  return (
    typeof payload.model === "string" &&
    Array.isArray(payload.initialMessages) &&
    Array.isArray(payload.rounds)
  );
}
