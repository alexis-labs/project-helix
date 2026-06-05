import cors from "cors";
import express from "express";
import OpenAI from "openai";

import {
  isSkillsEnabled,
  OPENROUTER_MODELS,
  resolveOpenRouterModel
} from "../../shared/adventureSettings.ts";
import type { LlmDebugPayload, LlmDebugRound } from "../../shared/llmDebug.ts";
import { sanitizeNarratorReply, stripUiStateBlock } from "../../shared/narratorReply.ts";
import { buildCompletionParams, llmConfig } from "./game/llmConfig.ts";
import { serializeMessagesForDebug } from "./game/llmDebug.ts";
import { normalizeAttributes, normalizeStatus } from "./game/gameState.ts";
import {
  autoConsultSkillsForTurn,
  buildPlayerMessageWithSkillContext,
  executeConsultSkill,
  executeSaveSkill,
  mergeDefaultSkillTemplates,
  normalizeFolders,
  normalizeSkills,
  SKILL_TOOLS,
  type SaveSkillInput
} from "./game/skills.ts";
import {
  buildBaseSystemPrompt,
  buildSummaryPrompt,
  buildSystemPrompt,
  normalizeAdventureSettings
} from "./game/systemPrompt.ts";
import { estimateTextTokens } from "./game/tokens.ts";
import type {
  AdventureSettings,
  AdventureSkill,
  ClientTurn,
  GameAttributes,
  GameStatus,
  SkillFolder
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
const MAX_TOOL_ITERATIONS = 6;

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
  const adventureSettings = normalizeAdventureSettings(
    request.body?.adventureSettings
  );
  const normalizedSkills = isSkillsEnabled(adventureSettings)
    ? mergeDefaultSkillTemplates(
        normalizeSkills(request.body?.skills),
        normalizeFolders(request.body?.folders)
      )
    : { skills: [] as AdventureSkill[], folders: [] as SkillFolder[] };
  const skills = normalizedSkills.skills;
  const folders = normalizedSkills.folders;
  const attributes = normalizeAttributes(request.body?.attributes);
  const status = normalizeStatus(request.body?.status);
  const model = resolveOpenRouterModel(
    normalizeText(request.body?.model) || llmConfig.model
  );

  if (!message) {
    response.status(400).json({ error: "Mensagem vazia." });
    return;
  }

  if (!openai) {
    response.json({ reply: FALLBACK_REPLY, skillUpdates: [] });
    return;
  }

  try {
    const { reply, skillUpdates, usage, debug } = await narrateWithOpenAI(
      message,
      history,
      skills,
      folders,
      attributes,
      status,
      adventureSettings,
      model
    );
    response.json({ reply, skillUpdates, usage, debug });
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
  const skills = isSkillsEnabled(adventureSettings)
    ? normalizeSkills(request.body?.skills)
    : [];
  const folders = isSkillsEnabled(adventureSettings)
    ? normalizeFolders(request.body?.folders)
    : [];
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
      skills,
      folders,
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
  skills: AdventureSkill[],
  folders: SkillFolder[],
  attributes?: GameAttributes,
  status?: GameStatus,
  adventureSettings?: AdventureSettings,
  model = resolveOpenRouterModel(llmConfig.model)
) {
  if (!openai) {
    return {
      reply: FALLBACK_REPLY,
      skillUpdates: [] as AdventureSkill[],
      usage: {
        promptTokens: 0,
        totalTokens: 0,
        contextLimit: llmConfig.contextWindowTokens
      }
    };
  }

  const recentContext = history
    .slice(-4)
    .map((turn) => turn.content)
    .join(" ");
  const consultedSkills = isSkillsEnabled(adventureSettings)
    ? autoConsultSkillsForTurn(skills, folders, message, recentContext)
    : [];
  const systemContent = buildSystemPrompt({
    attributes,
    status,
    skills,
    folders,
    consultedSkills,
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
    {
      role: "user",
      content: isSkillsEnabled(adventureSettings)
        ? buildPlayerMessageWithSkillContext(message, consultedSkills)
        : message
    }
  ];

  const modelContextLimit =
    adventureSettings?.llm.contextWindowTokens || getModelContextWindow(model);
  const completionParams = buildCompletionParams(adventureSettings?.llm);
  const tools = isSkillsEnabled(adventureSettings) ? SKILL_TOOLS : null;
  const playerMessageSent = isSkillsEnabled(adventureSettings)
    ? buildPlayerMessageWithSkillContext(message, consultedSkills)
    : message;
  const debugBase: Omit<LlmDebugPayload, "rounds" | "usage"> = {
    model,
    completionParams,
    tools,
    consultedSkills: consultedSkills.map((skill) => ({
      id: skill.id,
      title: skill.title,
      description: skill.description
    })),
    playerMessageRaw: message,
    playerMessageSent,
    initialMessages: serializeMessagesForDebug(messages)
  };

  try {
    const agentResult = await runSkillAgentLoop(
      messages,
      skills,
      folders,
      model,
      adventureSettings
    );

    return {
      reply: sanitizeNarratorReply(agentResult.reply),
      skillUpdates: agentResult.skillUpdates,
      usage: {
        promptTokens: agentResult.promptTokens,
        totalTokens: agentResult.totalTokens,
        contextLimit: modelContextLimit
      },
      debug: {
        ...debugBase,
        rounds: agentResult.rounds,
        usage: {
          promptTokens: agentResult.promptTokens,
          totalTokens: agentResult.totalTokens,
          contextLimit: modelContextLimit
        }
      }
    };
  } catch (error) {
    if (!isToolUnsupportedError(error)) {
      throw error;
    }

    console.warn(
      `Model ${model} may not support tool calling. Falling back to plain completion.`
    );

    const completion = await createCompletionWithRetry(
      messages,
      model,
      adventureSettings
    );
    const assistantMessage = completion.choices[0]?.message;
    const promptTokens = completion.usage?.prompt_tokens ?? 0;
    const totalTokens = completion.usage?.total_tokens ?? 0;

    return {
      reply: sanitizeNarratorReply(
        assistantMessage?.content?.trim() || FALLBACK_REPLY
      ),
      skillUpdates: [] as AdventureSkill[],
      usage: {
        promptTokens,
        totalTokens,
        contextLimit: modelContextLimit
      },
      debug: {
        ...debugBase,
        rounds: [
          {
            index: 0,
            messagesAtStart: serializeMessagesForDebug(messages),
            promptTokens,
            totalTokens,
            response: {
              content: assistantMessage?.content ?? null,
              toolCalls: []
            },
            toolResults: []
          }
        ],
        usage: {
          promptTokens,
          totalTokens,
          contextLimit: modelContextLimit
        }
      }
    };
  }
}

async function runSkillAgentLoop(
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  initialSkills: AdventureSkill[],
  folders: SkillFolder[],
  model: string,
  adventureSettings?: AdventureSettings
) {
  const tools = isSkillsEnabled(adventureSettings) ? SKILL_TOOLS : undefined;
  let workingSkills = [...initialSkills];
  const skillUpdates: AdventureSkill[] = [];
  const rounds: LlmDebugRound[] = [];
  let promptTokens = 0;
  let totalTokens = 0;

  for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration += 1) {
    const messagesAtStart = serializeMessagesForDebug(messages);
    const completion = await createCompletionWithRetry(
      messages,
      model,
      adventureSettings,
      tools
    );
    const roundPromptTokens = completion.usage?.prompt_tokens ?? 0;
    const roundTotalTokens = completion.usage?.total_tokens ?? 0;

    promptTokens += roundPromptTokens;
    totalTokens += roundTotalTokens;

    const assistantMessage = completion.choices[0]?.message;

    if (!assistantMessage) {
      rounds.push({
        index: iteration,
        messagesAtStart,
        promptTokens: roundPromptTokens,
        totalTokens: roundTotalTokens,
        response: { content: null, toolCalls: [] },
        toolResults: []
      });

      return {
        reply: FALLBACK_REPLY,
        skillUpdates,
        promptTokens,
        totalTokens,
        rounds
      };
    }

    const toolCalls = assistantMessage.tool_calls ?? [];
    const serializedToolCalls = toolCalls
      .filter((toolCall) => toolCall.type === "function")
      .map((toolCall) => ({
        id: toolCall.id,
        name: toolCall.function.name,
        arguments: toolCall.function.arguments
      }));

    if (toolCalls.length === 0) {
      rounds.push({
        index: iteration,
        messagesAtStart,
        promptTokens: roundPromptTokens,
        totalTokens: roundTotalTokens,
        response: {
          content: assistantMessage.content ?? null,
          toolCalls: []
        },
        toolResults: []
      });

      return {
        reply: assistantMessage.content?.trim() || FALLBACK_REPLY,
        skillUpdates,
        promptTokens,
        totalTokens,
        rounds
      };
    }

    const toolResults: LlmDebugRound["toolResults"] = [];

    messages.push({
      role: "assistant",
      content: assistantMessage.content,
      tool_calls: toolCalls
    });

    for (const toolCall of toolCalls) {
      if (toolCall.type !== "function") {
        continue;
      }

      const toolName = toolCall.function.name;
      const args = parseToolArguments(toolCall.function.arguments);
      let toolContent = "";

      try {
        if (toolName === "consultar_skill") {
          toolContent = executeConsultSkill(workingSkills, args, folders);
        } else if (toolName === "guardar_skill") {
          const result = executeSaveSkill(workingSkills, folders, args);
          workingSkills = result.skills;
          skillUpdates.push(result.skill);
          toolContent = `Skill guardada: ${result.skill.id} (${result.skill.title}).`;
        } else {
          toolContent = `Ferramenta desconhecida: ${toolName}.`;
        }
      } catch (toolError) {
        toolContent =
          toolError instanceof Error
            ? toolError.message
            : "Falha ao executar a ferramenta.";
      }

      toolResults.push({
        toolCallId: toolCall.id,
        content: toolContent
      });

      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: toolContent
      });
    }

    rounds.push({
      index: iteration,
      messagesAtStart,
      promptTokens: roundPromptTokens,
      totalTokens: roundTotalTokens,
      response: {
        content: assistantMessage.content ?? null,
        toolCalls: serializedToolCalls
      },
      toolResults
    });
  }

  const messagesAtStart = serializeMessagesForDebug(messages);
  const finalCompletion = await createCompletionWithRetry(
    messages,
    model,
    adventureSettings
  );
  const roundPromptTokens = finalCompletion.usage?.prompt_tokens ?? 0;
  const roundTotalTokens = finalCompletion.usage?.total_tokens ?? 0;

  promptTokens += roundPromptTokens;
  totalTokens += roundTotalTokens;

  const finalAssistantMessage = finalCompletion.choices[0]?.message;

  rounds.push({
    index: rounds.length,
    messagesAtStart,
    promptTokens: roundPromptTokens,
    totalTokens: roundTotalTokens,
    response: {
      content: finalAssistantMessage?.content ?? null,
      toolCalls: []
    },
    toolResults: []
  });

  return {
    reply:
      finalAssistantMessage?.content?.trim() || FALLBACK_REPLY,
    skillUpdates,
    promptTokens,
    totalTokens,
    rounds
  };
}

async function createCompletionWithRetry(
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  model: string,
  adventureSettings?: AdventureSettings,
  tools?: OpenAI.Chat.Completions.ChatCompletionTool[]
) {
  const maxAttempts = 4;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await openai!.chat.completions.create({
        model,
        messages,
        ...(tools ? { tools, tool_choice: "auto" as const } : {}),
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
  skills: AdventureSkill[],
  folders: SkillFolder[],
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

  const systemContent = buildSummaryPrompt(cause, adventureSettings, skills, folders);
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

function parseToolArguments(raw: string): SaveSkillInput | { query?: string } {
  if (!raw.trim()) {
    return {};
  }

  try {
    return JSON.parse(raw) as SaveSkillInput | { query?: string };
  } catch {
    return {};
  }
}

function isToolUnsupportedError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const apiError = error as {
    status?: number;
    message?: string;
    error?: { message?: string };
  };

  if (apiError.status !== 400) {
    return false;
  }

  const message = `${apiError.error?.message || apiError.message || ""}`.toLowerCase();

  return (
    message.includes("tool") ||
    message.includes("function") ||
    message.includes("unsupported")
  );
}

function isRetryableError(error: unknown) {
  if (typeof error !== "object" || error === null || !("status" in error)) {
    return false;
  }

  const status = (error as { status?: number }).status;
  return status === 429 || status === 502 || status === 503;
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
