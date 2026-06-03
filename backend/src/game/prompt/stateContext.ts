import type { GameAttributes, GameStatus } from "../../../../shared/types.ts";

const attributeLabels: Record<keyof GameAttributes, string> = {
  fear: "MEDO",
  injuries: "FERIMENTOS",
  hunger: "FOME",
  exhaustion: "EXAUSTÃO"
};

export function formatRuntimeStateForPrompt(
  attributes?: GameAttributes,
  status?: GameStatus
) {
  if (!attributes && !status) {
    return "";
  }

  const sections: string[] = [
    "# ESTADO ACTUAL DO JOGO",
    "Fonte de verdade da interface — mantém coerência e actualiza no bloco ESTADO_UI."
  ];

  if (attributes) {
    sections.push(
      "",
      `MEDO: ${attributes.fear}/100`,
      `FERIMENTOS: ${attributes.injuries}/100`,
      `FOME: ${attributes.hunger}/100`,
      `EXAUSTÃO: ${attributes.exhaustion}/100`
    );
  }

  if (status) {
    sections.push(
      "",
      "INVENTÁRIO:",
      ...(status.inventory.length > 0
        ? status.inventory.map((item) => `- ${item}`)
        : ["- (vazio)"]),
      "",
      "LOCALIZAÇÃO:",
      status.location
    );
  }

  return `\n\n${sections.join("\n")}`;
}

export { attributeLabels };
