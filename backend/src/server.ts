import cors from "cors";
import express from "express";
import OpenAI from "openai";

import { llmConfig, systemPrompt } from "./game/llmConfig.ts";
import type { ClientTurn } from "./game/types.ts";

const app = express();
const port = Number(process.env.PORT || 3001);
const openai = llmConfig.apiKey
  ? new OpenAI({
      apiKey: llmConfig.apiKey,
      baseURL: llmConfig.baseUrl
    })
  : null;

const FALLBACK_REPLY = "O silêncio envolve-te. A escuridão continua.";

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_request, response) => {
  response.json({
    ok: true,
    llm: {
      enabled: Boolean(openai),
      model: llmConfig.model,
      provider: llmConfig.provider
    }
  });
});

app.post("/api/play", async (request, response) => {
  const message = normalizeText(request.body?.message);
  const history = normalizeHistory(request.body?.history);

  if (!message) {
    response.status(400).json({ error: "Mensagem vazia." });
    return;
  }

  try {
    const reply = openai
      ? await narrateWithOpenAI(message, history)
      : FALLBACK_REPLY;

    response.json({ reply });
  } catch (error) {
    console.error("Narration error:", error);
    response.json({ reply: FALLBACK_REPLY });
  }
});

async function narrateWithOpenAI(message: string, history: ClientTurn[]) {
  if (!openai) {
    return FALLBACK_REPLY;
  }

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...history.slice(-10).map((turn) => ({
      role: turn.role === "player" ? ("user" as const) : ("assistant" as const),
      content: turn.content
    })),
    { role: "user", content: message }
  ];

  const completion = await openai.chat.completions.create({
    model: llmConfig.model,
    messages,
    temperature: llmConfig.temperature,
    max_completion_tokens: llmConfig.maxCompletionTokens
  });

  return (
    completion.choices[0]?.message?.content?.trim() ||
    FALLBACK_REPLY
  );
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim().slice(0, 1000) : "";
}

function normalizeHistory(value: unknown): ClientTurn[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((turn) => {
      if (!turn || typeof turn !== "object") {
        return null;
      }

      const role = "role" in turn ? turn.role : undefined;
      const content = "content" in turn ? turn.content : undefined;

      if (
        (role !== "player" && role !== "narrator") ||
        typeof content !== "string" ||
        !content.trim()
      ) {
        return null;
      }

      return { role, content: content.trim().slice(0, 1200) };
    })
    .filter((turn): turn is ClientTurn => turn !== null)
    .slice(-12);
}

app.listen(port, () => {
  console.log(`Blindfold backend listening on http://localhost:${port}`);
  console.log(
    openai
      ? `LLM enabled: ${llmConfig.provider} (${llmConfig.model})`
      : "LLM disabled: using local fallback"
  );
});
