import { gameContent } from "../../../../shared/gameContent.ts";

export function formatCharacterSection() {
  const { character } = gameContent;

  return `# PERSONAGEM

## Nome

${character.name}

## Idade

${character.age} anos

## Passado

${character.backstory}

---

## Família

### Pai

${character.family.father}

### Mãe

${character.family.mother}`;
}

export function formatInitialStateSection() {
  const { initialAttributes, initialStatus, objectives } = gameContent;

  return `## Estado Inicial

MEDO: ${initialAttributes.fear}/100

FERIMENTOS: ${initialAttributes.injuries}/100

FOME: ${initialAttributes.hunger}/100

EXAUSTÃO: ${initialAttributes.exhaustion}/100

---

# INVENTÁRIO INICIAL

${initialStatus.inventory.map((item) => `- ${item}`).join("\n")}

---

# OBJETIVO PRINCIPAL

${objectives.primary}

---

# OBJETIVOS SECUNDÁRIOS

${objectives.secondary.map((item) => `- ${item}`).join("\n")}`;
}
