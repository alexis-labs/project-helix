import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import OpenAI from "openai";

dotenv.config({ path: process.env.DOTENV_CONFIG_PATH || "../.env" });

const app = express();
const port = Number(process.env.PORT || 3001);
const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

const systemPrompt = `És o narrador de um jogo de terror psicológico chamado Blindfold.

O jogador acordou vendado numa casa abandonada.

O jogo é uma história interativa simples.
O jogador escreve uma pergunta ou ação.
Tu respondes com uma continuação curta, tensa e atmosférica.

Regras:
- O jogador não consegue ver.
- Nunca descrevas imagens diretamente.
- Usa som, cheiro, toque, temperatura, respiração e sensação espacial.
- Mantém respostas curtas.
- Não expliques regras.
- Não digas que és uma IA.
- Não deixes o jogador escapar demasiado cedo.
- Mantém a história coerente.
- Cria tensão aos poucos.
- Dá sempre uma pequena pista para a próxima ação.

Responde apenas com texto narrativo.`;

type ClientTurn = {
  role: "player" | "narrator";
  content: string;
};

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_request, response) => {
  response.json({ ok: true });
});

app.post("/api/play", async (request, response) => {
  const message = normalizeText(request.body?.message);
  const history = normalizeHistory(request.body?.history);

  if (!message) {
    response.status(400).json({ error: "Mensagem vazia." });
    return;
  }

  try {
    const reply = openai
      ? await narrateWithOpenAI(message, history)
      : fallbackNarration(message, history.length);

    response.json({ reply });
  } catch (error) {
    console.error("Narration error:", error);
    response.json({ reply: fallbackNarration(message, history.length) });
  }
});

async function narrateWithOpenAI(message: string, history: ClientTurn[]) {
  if (!openai) {
    return fallbackNarration(message, history.length);
  }

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...history.slice(-10).map((turn) => ({
      role: turn.role === "player" ? ("user" as const) : ("assistant" as const),
      content: turn.content
    })),
    { role: "user", content: message }
  ];

  const completion = await openai.chat.completions.create({
    model,
    messages,
    temperature: 0.85,
    max_tokens: 120
  });

  return (
    completion.choices[0]?.message?.content?.trim() ||
    fallbackNarration(message, history.length)
  );
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim().slice(0, 1000) : "";
}

function normalizeHistory(value: unknown): ClientTurn[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((turn) => {
      if (!turn || typeof turn !== "object") {
        return null;
      }

      const role = "role" in turn ? turn.role : undefined;
      const content = "content" in turn ? turn.content : undefined;

      if (
        (role !== "player" && role !== "narrator") ||
        typeof content !== "string" ||
        !content.trim()
      ) {
        return null;
      }

      return { role, content: content.trim().slice(0, 1200) };
    })
    .filter((turn): turn is ClientTurn => turn !== null)
    .slice(-12);
}

function fallbackNarration(message: string, historyLength: number) {
  const lower = message.toLowerCase();
  const beat = historyLength % 4;

  if (lower.includes("escut") || lower.includes("ouço") || lower.includes("som")) {
    return "A madeira estala para lá da porta. Entre as gotas, há uma respiração lenta, baixa demais para ser tua. O som vem do lado esquerdo.";
  }

  if (lower.includes("toco") || lower.includes("parede") || lower.includes("chão")) {
    return "Os teus dedos encontram tinta descascada e sulcos fundos na parede. Alguém arranhou a mesma direção muitas vezes. O ar fica mais frio junto ao rodapé.";
  }

  if (lower.includes("porta") || lower.includes("abro")) {
    return "A maçaneta está húmida. Quando a rodas, algo do outro lado recua um passo. A porta abre só o bastante para deixar passar cheiro a ferrugem.";
  }

  if (lower.includes("chamo") || lower.includes("alguém") || lower.includes("quem")) {
    return "A tua voz morre depressa. Do teto, uma resposta quase sem fôlego sussurra o teu nome, como se o tivesse treinado durante dias.";
  }

  const beats = [
    "O silêncio muda de peso. Há espaço à tua frente, mas o chão range no limite dos teus pés. Se te ajoelhares, talvez sintas por onde seguir.",
    "O tecido da venda aperta quando respiras. Um cheiro a mofo e vela apagada vem de algum lugar baixo, perto de uma abertura.",
    "Algo toca de leve na tua nuca e desaparece. Não foi mão. Foi frio. À direita, uma corrente de ar passa por uma fresta.",
    "A casa acomoda-se à tua volta, como se tivesse acordado também. Uma gota cai perto do teu sapato esquerdo. Depois, deixa de cair."
  ];

  return beats[beat];
}

app.listen(port, () => {
  console.log(`Blindfold backend listening on http://localhost:${port}`);
});
