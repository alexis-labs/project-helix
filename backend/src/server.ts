import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import OpenAI from "openai";
import { fallbackNarration, llmConfig, systemPrompt } from "./game/llmConfig.ts";
import type { ClientTurn } from "./game/types.ts";

dotenv.config({ path: process.env.DOTENV_CONFIG_PATH || "../.env" });

const app = express();
const port = Number(process.env.PORT || 3001);
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_request, response) => {
  response.json({ ok: true });
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
      : fallbackNarration(history.length);

    response.json({ reply });
  } catch (error) {
    console.error("Narration error:", error);
    response.json({ reply: fallbackNarration(history.length) });
  }
});

async function narrateWithOpenAI(message: string, history: ClientTurn[]) {
  if (!openai) {
    return fallbackNarration(history.length);
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
    fallbackNarration(history.length)
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
});
