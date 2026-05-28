import type { FormEvent } from "react";
import { SendHorizontal } from "lucide-react";
import { uiText } from "../content/uiText";

type CommandInputProps = {
  isLoading: boolean;
  message: string;
  onMessageChange: (message: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function CommandInput({
  isLoading,
  message,
  onMessageChange,
  onSubmit
}: CommandInputProps) {
  return (
    <form className="command-line" onSubmit={onSubmit}>
      <input
        aria-label={uiText.inputAriaLabel}
        autoComplete="off"
        disabled={isLoading}
        onChange={(event) => onMessageChange(event.target.value)}
        placeholder={uiText.inputPlaceholder}
        value={message}
      />
      <button disabled={isLoading || message.trim().length === 0} type="submit">
        <SendHorizontal size={16} strokeWidth={1.8} />
        <span>{uiText.submitLabel}</span>
      </button>
    </form>
  );
}
