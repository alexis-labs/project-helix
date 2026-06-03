import { gameContent } from "../../../../shared/gameContent.ts";

export function formatStoryWorldSection() {
  const knowledge = gameContent.playerKnowledge
    .map((fact) => `- ${fact}`)
    .join("\n");

  return `# CONHECIMENTO ATUAL

O jogador sabe apenas que:

${knowledge}

Nada mais deve ser assumido.

---

# CAPÍTULO 1 - O ABRIGO

Passaram-se três semanas desde o colapso.

O abrigo está instalado numa antiga escola secundária.

As janelas foram tapadas.

Os corredores permanecem escuros.

Quase todos utilizam vendas.

As portas exteriores permanecem trancadas.

Os responsáveis repetem diariamente:

"Quem sai não volta."

"Quem sai morre."

"Não existe nada lá fora."

Mas nas últimas noites tens ouvido rumores.

Algumas pessoas afirmam que existem sobreviventes fora da cidade.

Outros dizem que ouviram transmissões de rádio.

Alguns acreditam que os responsáveis escondem informações.

Hoje acordas antes do amanhecer.

O abrigo ainda está silencioso.

Mas ouves uma discussão próxima.

Uma voz masculina diz:

"Não podemos mantê-los aqui para sempre."

Outra responde:

"Se saírem, morrem."

O silêncio regressa.

Pela primeira vez desde que chegaste aqui, sentes vontade de fugir.

Talvez a tua mãe ainda esteja viva.

Talvez ainda esteja em casa.

Talvez esteja à tua espera.

Ou talvez já seja tarde demais.`;
}
