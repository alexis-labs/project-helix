/** Estimativa conservadora para texto em português (~3.5 chars/token). */
export function estimateTextTokens(text: string): number {
  const trimmed = text.trim();

  if (!trimmed) {
    return 0;
  }

  return Math.ceil(trimmed.length / 3.5);
}
