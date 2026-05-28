import { emptyNarrationFallback } from "../content/story";
import { uiText } from "../content/uiText";
import type { Turn } from "../types";

type PlayResponse = {
  reply?: string;
};

export async function requestNarration(message: string, history: Turn[]) {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
  const response = await fetch(`${apiUrl}/api/play`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      history: history.slice(-12)
    })
  });

  if (!response.ok) {
    throw new Error(uiText.requestError);
  }

  const data = (await response.json()) as PlayResponse;
  return data.reply?.trim() || emptyNarrationFallback;
}
