import type { MemorySource, MemoryVariable } from "./types.ts";

export function formatMemoryForPrompt(memory: MemoryVariable[]): string {
  if (memory.length === 0) {
    return "";
  }

  const lines = memory.map(
    (entry) =>
      `- ${entry.key}: ${entry.value} | ${entry.source} | ${entry.description}`
  );

  return `\n\n# MEMÓRIA ATUAL DA AVENTURA\nVariáveis persistentes — respeita, altera quando necessário e devolve a lista completa no bloco MEMORIA:\n${lines.join("\n")}`;
}

export function normalizeMemory(value: unknown): MemoryVariable[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const key = "key" in entry ? entry.key : undefined;
      const variableValue = "value" in entry ? entry.value : undefined;
      const source = "source" in entry ? entry.source : undefined;
      const description = "description" in entry ? entry.description : undefined;

      if (
        typeof key !== "string" ||
        typeof variableValue !== "string" ||
        typeof description !== "string" ||
        !isMemorySource(source)
      ) {
        return null;
      }

      return {
        key: key.trim().slice(0, 64),
        value: variableValue.trim().slice(0, 160),
        source,
        description: description.trim().slice(0, 240)
      };
    })
    .filter((entry): entry is MemoryVariable => entry !== null)
    .slice(0, 40);
}

function isMemorySource(value: unknown): value is MemorySource {
  return value === "jogador" || value === "externo" || value === "descoberta";
}
