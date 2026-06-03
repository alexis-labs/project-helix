import { emptyNarrationFallback } from "../content/story";
import { uiText } from "../content/uiText";
import type { Turn } from "../types";

type PlayResponse = {
  reply?: string;
  error?: string;
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

  return "http://localhost:3001";
}

export async function requestNarration(message: string, history: Turn[]) {
  const apiBase = resolveApiBase();
  let response: Response;

  try {
    response = await fetch(`${apiBase}/api/play`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
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

  return data.reply?.trim() || emptyNarrationFallback;
}
