const LEAK_SECTION_HEADERS = [
  /^#\s*SKILLS CONSULTADAS/i,
  /^#\s*FACTOS RELEVANTES/i,
  /^Estas skills foram consultadas/i,
  /^Usa estes factos ao narrar/i,
  /^Se precisares de mais informacao/i,
  /^INSTRUCAO:/i,
  /^Factos consultados/i,
  /^Acao do jogador:/i
];

const SKILL_METADATA_LINE = /^(ID:|Titulo:|Descricao:|Conteudo:|---)\s*/i;

function isLeakSectionStart(line: string) {
  const trimmed = line.trim();
  return LEAK_SECTION_HEADERS.some((pattern) => pattern.test(trimmed));
}

function isSkillMetadataLine(line: string) {
  return SKILL_METADATA_LINE.test(line.trim());
}

export function stripUiStateBlock(text: string) {
  const lines = text.split("\n");
  const stateBlockStart = lines.findIndex((line) =>
    /^(ESTADO_UI:|MEDO:)/i.test(line.trim())
  );

  if (stateBlockStart === -1) {
    return text.trim();
  }

  return lines.slice(0, stateBlockStart).join("\n").trim();
}

export function stripNarratorLeakage(text: string) {
  let cleaned = text.trim();

  const narratorIndex = cleaned.toLowerCase().lastIndexOf("narrador:");
  if (narratorIndex !== -1) {
    cleaned = cleaned.slice(narratorIndex + "narrador:".length).trim();
  }

  const lines = cleaned.split("\n");
  const kept: string[] = [];
  let skippingLeakBlock = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (isLeakSectionStart(trimmed)) {
      skippingLeakBlock = true;
      continue;
    }

    if (skippingLeakBlock) {
      if (trimmed === "") {
        skippingLeakBlock = false;
      }
      continue;
    }

    if (isSkillMetadataLine(trimmed)) {
      continue;
    }

    kept.push(line);
  }

  return kept.join("\n").trim();
}

export function sanitizeNarratorReply(text: string) {
  return stripNarratorLeakage(stripUiStateBlock(text));
}
