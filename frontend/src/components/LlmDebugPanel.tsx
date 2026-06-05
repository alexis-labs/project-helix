import type { ReactNode } from "react";
import type { LlmDebugPayload } from "../../../shared/llmDebug";

type LlmDebugPanelProps = {
  debug: LlmDebugPayload | null;
  isOpen: boolean;
  onToggle: () => void;
};

function formatJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function DebugBlock({
  label,
  children
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <section className="llm-debug-block">
      <h4>{label}</h4>
      {children}
    </section>
  );
}

function MessageList({ messages }: { messages: LlmDebugPayload["initialMessages"] }) {
  return (
    <ol className="llm-debug-message-list">
      {messages.map((message, index) => (
        <li className={`llm-debug-message llm-debug-message--${message.role}`} key={index}>
          <div className="llm-debug-message-head">
            <span className="llm-debug-role">{message.role}</span>
            {message.toolCallId ? (
              <span className="llm-debug-meta">tool_call_id: {message.toolCallId}</span>
            ) : null}
          </div>
          {message.content ? (
            <pre className="llm-debug-content">{message.content}</pre>
          ) : null}
          {message.toolCalls?.length ? (
            <div className="llm-debug-tool-calls">
              {message.toolCalls.map((toolCall) => (
                <div className="llm-debug-tool-call" key={toolCall.id}>
                  <p className="llm-debug-meta">
                    {toolCall.name} ({toolCall.id})
                  </p>
                  <pre className="llm-debug-content">{toolCall.arguments}</pre>
                </div>
              ))}
            </div>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

export function LlmDebugTrigger({
  debug,
  isOpen,
  onToggle
}: LlmDebugPanelProps) {
  if (!debug) {
    return null;
  }

  return (
    <button
      aria-expanded={isOpen}
      aria-label="Ver input enviado ao LLM"
      className={["llm-debug-trigger", isOpen ? "is-open" : ""].filter(Boolean).join(" ")}
      onClick={onToggle}
      type="button"
    >
      Debug
    </button>
  );
}

export function LlmDebugContent({ debug }: { debug: LlmDebugPayload | null }) {
  if (!debug) {
    return null;
  }

  return (
    <div className="llm-debug-drop">
      <div className="llm-debug-body">
        <DebugBlock label="Modelo e parâmetros">
          <pre className="llm-debug-content">
            {formatJson({
              model: debug.model,
              completionParams: debug.completionParams,
              usage: debug.usage
            })}
          </pre>
        </DebugBlock>

        <DebugBlock label="Mensagem do jogador">
          <p className="llm-debug-label">Original</p>
          <pre className="llm-debug-content">{debug.playerMessageRaw}</pre>
          <p className="llm-debug-label">Enviada ao LLM</p>
          <pre className="llm-debug-content">{debug.playerMessageSent}</pre>
        </DebugBlock>

        {debug.consultedSkills.length > 0 ? (
          <DebugBlock label="Skills auto-consultadas">
            <pre className="llm-debug-content">{formatJson(debug.consultedSkills)}</pre>
          </DebugBlock>
        ) : null}

        {debug.tools ? (
          <DebugBlock label="Ferramentas (tools)">
            <pre className="llm-debug-content">{formatJson(debug.tools)}</pre>
          </DebugBlock>
        ) : null}

        <DebugBlock label="Mensagens iniciais enviadas">
          <MessageList messages={debug.initialMessages} />
        </DebugBlock>

        {debug.rounds.map((round) => (
          <DebugBlock key={round.index} label={`Ronda ${round.index + 1}`}>
            <p className="llm-debug-meta">
              prompt: {round.promptTokens} tokens · total: {round.totalTokens} tokens
            </p>
            <p className="llm-debug-label">Messages at start</p>
            <MessageList messages={round.messagesAtStart} />
            {round.response.content ? (
              <>
                <p className="llm-debug-label">Resposta do assistente</p>
                <pre className="llm-debug-content">{round.response.content}</pre>
              </>
            ) : null}
            {round.response.toolCalls.length > 0 ? (
              <>
                <p className="llm-debug-label">Tool calls</p>
                <pre className="llm-debug-content">
                  {formatJson(round.response.toolCalls)}
                </pre>
              </>
            ) : null}
            {round.toolResults.length > 0 ? (
              <>
                <p className="llm-debug-label">Tool results</p>
                <pre className="llm-debug-content">{formatJson(round.toolResults)}</pre>
              </>
            ) : null}
          </DebugBlock>
        ))}

        <DebugBlock label="Payload completo (JSON)">
          <pre className="llm-debug-content llm-debug-content--raw">
            {formatJson(debug)}
          </pre>
        </DebugBlock>
      </div>
    </div>
  );
}

export function LlmDebugPanel({
  debug,
  isOpen,
  onToggle
}: LlmDebugPanelProps) {
  return (
    <>
      <LlmDebugTrigger debug={debug} isOpen={isOpen} onToggle={onToggle} />
      {isOpen ? <LlmDebugContent debug={debug} /> : null}
    </>
  );
}
