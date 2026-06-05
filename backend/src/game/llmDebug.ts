import type OpenAI from "openai";

import type { LlmDebugMessage } from "../../../shared/llmDebug.ts";

function normalizeMessageContent(content: unknown): string | null {
  if (typeof content === "string") {
    return content;
  }

  if (!content) {
    return null;
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (part && typeof part === "object" && "text" in part) {
          const text = (part as { text?: unknown }).text;
          return typeof text === "string" ? text : JSON.stringify(part);
        }

        if (part && typeof part === "object" && "refusal" in part) {
          const refusal = (part as { refusal?: unknown }).refusal;
          return typeof refusal === "string" ? refusal : JSON.stringify(part);
        }

        return JSON.stringify(part);
      })
      .join("\n");
  }

  return JSON.stringify(content);
}

export function serializeMessagesForDebug(
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]
): LlmDebugMessage[] {
  return messages.map((message) => {
    if (message.role === "system") {
      return {
        role: "system",
        content: normalizeMessageContent(message.content)
      };
    }

    if (message.role === "user") {
      return {
        role: "user",
        content: normalizeMessageContent(message.content)
      };
    }

    if (message.role === "assistant") {
      const assistantMessage =
        message as OpenAI.Chat.Completions.ChatCompletionAssistantMessageParam;

      return {
        role: "assistant",
        content: normalizeMessageContent(assistantMessage.content),
        toolCalls: (assistantMessage.tool_calls ?? [])
          .filter((toolCall) => toolCall.type === "function")
          .map((toolCall) => ({
            id: toolCall.id,
            name: toolCall.function.name,
            arguments: toolCall.function.arguments
          }))
      };
    }

    if (message.role === "tool") {
      const toolMessage =
        message as OpenAI.Chat.Completions.ChatCompletionToolMessageParam;

      return {
        role: "tool",
        content:
          typeof toolMessage.content === "string"
            ? toolMessage.content
            : normalizeMessageContent(toolMessage.content),
        toolCallId: toolMessage.tool_call_id
      };
    }

    return {
      role: message.role,
      content: null
    };
  });
}
