const offlineFallbacks = [
  "O silêncio muda de peso. Há espaço à tua frente, mas o chão range no limite dos teus pés. Se te ajoelhares, talvez sintas por onde seguir.",
  "O tecido da venda aperta quando respiras. Um cheiro a mofo e vela apagada vem de algum lugar baixo, perto de uma abertura.",
  "Algo toca de leve na tua nuca e desaparece. Não foi mão. Foi frio. À direita, uma corrente de ar passa por uma fresta.",
  "A casa acomoda-se à tua volta, como se tivesse acordado também. Uma gota cai perto do teu sapato esquerdo. Depois, deixa de cair.",
  "A madeira suspira algures perto. O ar muda de direção por um instante, como se uma porta tivesse ficado entreaberta."
];

export function fallbackNarration(historyLength: number) {
  return offlineFallbacks[historyLength % offlineFallbacks.length];
}
