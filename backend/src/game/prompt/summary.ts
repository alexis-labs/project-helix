export const attributeLabels: Record<string, string> = {
  fear: "MEDO",
  injuries: "FERIMENTOS",
  hunger: "FOME",
  exhaustion: "EXAUSTÃO"
};

export const attributeEndings: Record<string, string> = {
  fear: "colapso psicológico irreversível",
  injuries: "morte por ferimentos graves",
  hunger: "inanição",
  exhaustion: "exaustão total e incapacitação"
};

export function buildSummaryPrompt(cause: string) {
  const label = attributeLabels[cause] ?? cause.toUpperCase();
  const ending = attributeEndings[cause] ?? "fim da jornada";

  return `# RESUMO DE FIM DE JOGO

O jogador atingiu o máximo de ${label} (100/100).
A aventura termina por ${ending}.

Escreve um resumo final da história vivida até aqui:
- 3 a 5 parágrafos curtos, em português europeu.
- Segunda pessoa ("tu").
- Tom sombrio, emocional e conclusivo.
- Resume os momentos-chave, escolhas e descobertas da aventura.
- Explica como a jornada chegou ao fim por causa de ${label.toLowerCase()}.
- Não incluas blocos técnicos, listas de atributos nem instruções para continuar a jogar.
- Este é o fim definitivo da história.`;
}
