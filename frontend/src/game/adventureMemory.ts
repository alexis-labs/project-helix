import { gameContent } from "../../../shared/gameContent";
import type { AdventureMemory, MemorySource, MemoryVariable } from "../types";

export const INITIAL_MEMORY_VARIABLES: MemoryVariable[] = [
  ...gameContent.initialMemoryVariables
];

export function createInitialMemory(): AdventureMemory {
  return {
    variables: indexMemoryVariables(INITIAL_MEMORY_VARIABLES)
  };
}

export function indexMemoryVariables(
  variables: MemoryVariable[]
): Record<string, MemoryVariable> {
  return Object.fromEntries(variables.map((entry) => [entry.key, entry]));
}

export function listMemoryVariables(memory: AdventureMemory): MemoryVariable[] {
  return Object.values(memory.variables);
}

export function formatMemoryToken(token: string): string {
  return token
    .trim()
    .split("_")
    .filter(Boolean)
    .map(
      (word) =>
        word.charAt(0).toLocaleUpperCase("pt-PT") +
        word.slice(1).toLocaleLowerCase("pt-PT")
    )
    .join(" ");
}

export function upsertMemoryVariable(
  memory: AdventureMemory,
  variable: MemoryVariable
): AdventureMemory {
  return {
    variables: {
      ...memory.variables,
      [variable.key]: variable
    }
  };
}

export function recordPlayerActionMemory(
  memory: AdventureMemory,
  action: string
): AdventureMemory {
  const trimmed = action.trim();

  if (!trimmed) {
    return memory;
  }

  return upsertMemoryVariable(memory, {
    key: "ultima_acao",
    value: trimmed.slice(0, 120),
    source: "jogador",
    description: "Última ação escrita pelo jogador"
  });
}

const MEMORY_LINE_PATTERN =
  /^-\s*([a-z0-9_]+)\s*:\s*(.+?)\s*\|\s*(jogador|externo|descoberta)\s*\|\s*(.+)$/i;

function normalizeMemorySource(value: string): MemorySource | null {
  const normalized = value.trim().toLowerCase();

  if (
    normalized === "jogador" ||
    normalized === "externo" ||
    normalized === "descoberta"
  ) {
    return normalized;
  }

  return null;
}

export function parseMemoryBlock(narratorResponse: string): MemoryVariable[] | null {
  const lines = narratorResponse.split("\n");
  const memoryStart = lines.findIndex((line) => /^MEMORIA:/i.test(line.trim()));

  if (memoryStart === -1) {
    return null;
  }

  const variables: MemoryVariable[] = [];

  for (const rawLine of lines.slice(memoryStart + 1)) {
    const line = rawLine.trim();

    if (!line) {
      continue;
    }

    if (/^(ESTADO_UI:|MEDO:)/i.test(line)) {
      break;
    }

    const match = line.match(MEMORY_LINE_PATTERN);

    if (!match) {
      continue;
    }

    const source = normalizeMemorySource(match[3]);

    if (!source) {
      continue;
    }

    variables.push({
      key: match[1].trim().toLowerCase(),
      value: match[2].trim(),
      source,
      description: match[4].trim()
    });
  }

  return variables.length > 0 ? variables : null;
}

export function mergeMemoryFromResponse(
  current: AdventureMemory,
  narratorResponse: string
): AdventureMemory {
  const parsed = parseMemoryBlock(narratorResponse);

  if (!parsed) {
    return current;
  }

  return {
    variables: indexMemoryVariables(parsed)
  };
}

export function formatMemoryForApi(memory: AdventureMemory): MemoryVariable[] {
  return listMemoryVariables(memory);
}
