export type LlmDebugMessage = {
  role: string;
  content?: string | null;
  toolCalls?: Array<{
    id: string;
    name: string;
    arguments: string;
  }>;
  toolCallId?: string;
};

export type LlmDebugToolResult = {
  toolCallId: string;
  content: string;
};

export type LlmDebugRound = {
  index: number;
  messagesAtStart: LlmDebugMessage[];
  promptTokens: number;
  totalTokens: number;
  response: {
    content: string | null;
    toolCalls: Array<{
      id: string;
      name: string;
      arguments: string;
    }>;
  };
  toolResults: LlmDebugToolResult[];
};

export type LlmDebugPayload = {
  model: string;
  completionParams: {
    temperature: number;
    max_completion_tokens: number;
  };
  tools: unknown[] | null;
  consultedSkills: Array<{ id: string; title: string; description: string }>;
  playerMessageRaw: string;
  playerMessageSent: string;
  initialMessages: LlmDebugMessage[];
  rounds: LlmDebugRound[];
  usage: {
    promptTokens: number;
    totalTokens: number;
    contextLimit: number;
  };
};
