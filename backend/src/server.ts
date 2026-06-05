import cors from "cors";
import express from "express";
import OpenAI from "openai";

import {
  OPENROUTER_MODELS,
  resolveOpenRouterModel
} from "../../shared/adventureSettings.ts";
import { buildCompletionParams, llmConfig } from "./game/llmConfig.ts";
import { normalizeAttributes, normalizeStatus } from "./game/gameState.ts";
import { normalizeMemory } from "./game/memory.ts";
import {
  buildBaseSystemPrompt,
  buildSummaryPrompt,
  buildSystemPrompt,
  normalizeAdventureSettings
} from "./game/systemPrompt.ts";
import { estimateTextTokens } from "./game/tokens.ts";
import type {
  AdventureSettings,
  ClientTurn,
  GameAttributes,
  GameStatus,
  MemoryVariable
} from "./game/types.ts";

const app = express();
const port = Number(process.env.PORT || 3011);
const openai = llmConfig.apiKey
  ? new OpenAI({
      apiKey: llmConfig.apiKey,
      baseURL: llmConfig.baseUrl
    })
  : null;

const FALLBACK_REPLY = "";

app.use(cors());
app.use(express.json({ limit: "1mb" }));

const estimatedSystemPromptTokens = estimateTextTokens(buildBaseSystemPrompt());

app.get("/api/health", (_request, response) => {
  response.json({
    ok: true,
    llm: {
      enabled: Boolean(openai),
      model: resolveOpenRouterModel(llmConfig.model),
      provider: llmConfig.provider,
      contextWindowTokens: llmConfig.contextWindowTokens,
      estimatedSystemPromptTokens,
      availableModels: OPENROUTER_MODELS
    }
  });
});

app.post("/api/play", async (request, response) => {
  const message = normalizeText(request.body?.message);
  const history = normalizeHistory(request.body?.history);
  const memory = normalizeMemory(request.body?.memory);
  const attributes = normalizeAttributes(request.body?.attributes);
  const status = normalizeStatus(request.body?.status);
  const adventureSettings = normalizeAdventureSettings(
    request.body?.adventureSettings
  );
  const model = resolveOpenRouterModel(
    normalizeText(request.body?.model) || llmConfig.model
  );

  if (!message) {
    response.status(400).json({ error: "Mensagem vazia." });
    return;
  }

  if (!openai) {
    response.json({ reply: FALLBACK_REPLY });
    return;
  }

  try {
    const { reply, usage } = await narrateWithOpenAI(
      message,
      history,
      memory,
      attributes,
      status,
      adventureSettings,
      model
    );
    response.json({ reply, usage });
  } catch (error) {
    const details = formatNarrationError(error);
    console.error("Narration error:", details);
    response.status(503).json({ error: details });
  }
});

app.post("/api/summary", async (request, response) => {
  const history = normalizeHistory(request.body?.history);
  const cause = normalizeCause(request.body?.cause);
  const adventureSettings = normalizeAdventureSettings(
    request.body?.adventureSettings
  );
  const model = resolveOpenRouterModel(
    normalizeText(request.body?.model) || llmConfig.model
  );

  if (!cause) {
    response.status(400).json({ error: "Causa de fim de jogo invalida." });
    return;
  }

  if (!openai) {
    response.json({ summary: buildFallbackSummary(cause) });
    return;
  }

  try {
    const summary = await summarizeStoryWithOpenAI(
      history,
      cause,
      adventureSettings,
      model
    );
    response.json({ summary });
  } catch (error) {
    const details = formatNarrationError(error);
    console.error("Summary error:", details);
    response.status(503).json({ error: details });
  }
});

async function narrateWithOpenAI(
  message: string,
  history: ClientTurn[],
  _memory: MemoryVariable[],
  attributes?: GameAttributes,
  status?: GameStatus,
  adventureSettings?: AdventureSettings,
  model = resolveOpenRouterModel(llmConfig.model)
) {
  if (!openai) {
    return {
      reply: FALLBACK_REPLY,
      usage: {
        promptTokens: 0,
        totalTokens: 0,
        contextLimit: llmConfig.contextWindowTokens
      }
    };
  }

  const systemContent = buildSystemPrompt({
    attributes,
    status,
    adventureSettings
  });
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    ...(systemContent.trim()
      ? [{ role: "system" as const, content: systemContent }]
      : []),
    ...history.slice(-10).map((turn) => ({
      role: turn.role === "player" ? ("user" as const) : ("assistant" as const),
      content:
        turn.role === "narrator"
          ? stripUiStateBlock(turn.content)
          : turn.content
    })),
    { role: "user", content: message }
  ];

  const completion = await createCompletionWithRetry(
    messages,
    model,
    adventureSettings
  );
  const modelContextLimit =
    adventureSettings?.llm.contextWindowTokens || getModelContextWindow(model);

  return {
    reply: completion.choices[0]?.message?.content?.trim() || FALLBACK_REPLY,
    usage: {
      promptTokens: completion.usage?.prompt_tokens ?? 0,
      totalTokens: completion.usage?.total_tokens ?? 0,
      contextLimit: modelContextLimit
    }
  };
}

async function createCompletionWithRetry(
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  model: string,
  adventureSettings?: AdventureSettings
) {
  const maxAttempts = 4;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await openai!.chat.completions.create({
        model,
        messages,
        ...buildCompletionParams(adventureSettings?.llm)
      });
    } catch (error) {
      lastError = error;

      if (!isRetryableError(error) || attempt === maxAttempts) {
        throw error;
      }

      const delayMs = 1000 * 2 ** (attempt - 1);
      console.warn(
        `LLM transient error (${model}, attempt ${attempt}/${maxAttempts}). Retrying in ${delayMs}ms...`
      );
      await sleep(delayMs);
    }
  }

  throw lastError;
}

async function summarizeStoryWithOpenAI(
  history: ClientTurn[],
  cause: GameOverCause,
  adventureSettings: AdventureSettings,
  model: string
) {
  if (!openai) {
    return buildFallbackSummary(cause);
  }

  const transcript = history
    .slice(-12)
    .map((turn) =>
      turn.role === "player"
        ? `Jogador: ${turn.content}`
        : `Narrador: ${stripUiStateBlock(turn.content)}`
    )
    .join("\n\n");

  const systemContent = buildSummaryPrompt(cause, adventureSettings);
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    ...(systemContent.trim()
      ? [{ role: "system" as const, content: systemContent }]
      : []),
    {
      role: "user",
      content: transcript || "A sessao terminou sem acoes significativas."
    }
  ];

  const completion = await createCompletionWithRetry(
    messages,
    model,
    adventureSettings
  );

  return completion.choices[0]?.message?.content?.trim() || buildFallbackSummary(cause);
}

function isRetryableError(error: unknown) {
  if (typeof error !== "object" || error === null || !("status" in error)) {
    return false;
  }

  const status = (error as { status?: number }).status;
  return status === 429 || status === 502 || status === 503;
}

function stripUiStateBlock(text: string) {
  const lines = text.split("\n");
  const stateBlockStart = lines.findIndex((line) =>
    /^(ESTADO_UI:|MEMORIA:|MEDO:)/i.test(line.trim())
  );

  if (stateBlockStart === -1) {
    return text.trim();
  }

  return lines.slice(0, stateBlockStart).join("\n").trim();
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getModelContextWindow(model: string) {
  return (
    OPENROUTER_MODELS.find((option) => option.id === model)?.contextWindowTokens ||
    llmConfig.contextWindowTokens
  );
}

function formatNarrationError(error: unknown) {
  if (!error || typeof error !== "object") {
    return "Falha ao contactar o narrador.";
  }

  const apiError = error as {
    status?: number;
    message?: string;
    error?: { message?: string };
  };

  if (apiError.status === 429) {
    return "Limite de pedidos atingido. Espera alguns segundos e tenta outra vez.";
  }

  if (apiError.status === 502 || apiError.status === 503) {
    return "O narrador esta temporariamente indisponivel. Tenta outra vez.";
  }

  const status = apiError.status ? `[${apiError.status}] ` : "";
  const message =
    apiError.error?.message ||
    apiError.message ||
    "Falha ao contactar o narrador.";

  return `${status}${message}`.trim();
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

type GameOverCause = "fear" | "injuries" | "hunger" | "exhaustion";

const VALID_CAUSES = new Set<GameOverCause>([
  "fear",
  "injuries",
  "hunger",
  "exhaustion"
]);

function normalizeCause(value: unknown): GameOverCause | null {
  return typeof value === "string" && VALID_CAUSES.has(value as GameOverCause)
    ? (value as GameOverCause)
    : null;
}

function buildFallbackSummary(cause: GameOverCause) {
  const endings: Record<GameOverCause, string> = {
    fear: "Medo no maximo.",
    injuries: "Ferimentos no maximo.",
    hunger: "Fome no maximo.",
    exhaustion: "Exaustao no maximo."
  };

  return `A sessao termina aqui.\n\n${endings[cause]}`;
}

app.listen(port, () => {
  console.log(`Blindfold backend listening on http://localhost:${port}`);
  console.log(
    openai
      ? `LLM enabled: ${llmConfig.provider} (${llmConfig.model})`
      : "LLM disabled: using local fallback"
  );
});
