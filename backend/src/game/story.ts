type IntentBeat = {
  keywords: string[];
  reply: string;
};

const intentBeats: IntentBeat[] = [
  {
    keywords: ["escut", "ouco", "som"],
    reply:
      "A madeira estala para lá da porta. Entre as gotas, há uma respiração lenta, baixa demais para ser tua. O som vem do lado esquerdo."
  },
  {
    keywords: ["toco", "parede", "chao"],
    reply:
      "Os teus dedos encontram tinta descascada e sulcos fundos na parede. Alguém arranhou a mesma direção muitas vezes. O ar fica mais frio junto ao rodapé."
  },
  {
    keywords: ["porta", "abro"],
    reply:
      "A maçaneta está húmida. Quando a rodas, algo do outro lado recua um passo. A porta abre só o bastante para deixar passar cheiro a ferrugem."
  },
  {
    keywords: ["chamo", "alguem", "quem"],
    reply:
      "A tua voz morre depressa. Do teto, uma resposta quase sem fôlego sussurra o teu nome, como se o tivesse treinado durante dias."
  }
];

const ambientBeats = [
  "O silêncio muda de peso. Há espaço à tua frente, mas o chão range no limite dos teus pés. Se te ajoelhares, talvez sintas por onde seguir.",
  "O tecido da venda aperta quando respiras. Um cheiro a mofo e vela apagada vem de algum lugar baixo, perto de uma abertura.",
  "Algo toca de leve na tua nuca e desaparece. Não foi mão. Foi frio. À direita, uma corrente de ar passa por uma fresta.",
  "A casa acomoda-se à tua volta, como se tivesse acordado também. Uma gota cai perto do teu sapato esquerdo. Depois, deixa de cair."
];

export function fallbackNarration(message: string, historyLength: number) {
  const normalizedMessage = normalizeForMatching(message);
  const matchedBeat = intentBeats.find((beat) =>
    beat.keywords.some((keyword) => normalizedMessage.includes(keyword))
  );

  if (matchedBeat) {
    return matchedBeat.reply;
  }

  return ambientBeats[historyLength % ambientBeats.length];
}

function normalizeForMatching(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}
