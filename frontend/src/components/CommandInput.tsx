import type { FormEvent } from "react";
import { SendHorizontal } from "lucide-react";
import { uiText } from "../content/uiText";
import { ContextUsageRing } from "./ContextUsageRing";

type CommandInputProps = {
  contextPercent: number;
  contextUsedTokens: number;
  contextLimitTokens: number;
  disabled?: boolean;
  isLoading: boolean;
  message: string;
  onMessageChange: (message: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function CommandInput({
  contextPercent,
  contextUsedTokens,
  contextLimitTokens,
  disabled = false,
  isLoading,
  message,
  onMessageChange,
  onSubmit
}: CommandInputProps) {
  const isDisabled = disabled || isLoading;

  return (
    <div className="command-input-stack">
      <form className="command-line" onSubmit={onSubmit}>
        <input
          aria-label={uiText.inputAriaLabel}
          autoComplete="off"
          disabled={isDisabled}
          onChange={(event) => onMessageChange(event.target.value)}
          placeholder={uiText.inputPlaceholder}
          value={message}
        />
        <button disabled={isDisabled || message.trim().length === 0} type="submit">
          <SendHorizontal size={16} strokeWidth={1.8} />
          <span>{uiText.submitLabel}</span>
        </button>
      </form>
      <ContextUsageRing
        limitTokens={contextLimitTokens}
        percent={contextPercent}
        usedTokens={contextUsedTokens}
      />
    </div>
  );
}
