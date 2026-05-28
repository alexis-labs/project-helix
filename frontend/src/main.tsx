import { StrictMode } from "react";
import { useState, type FormEvent } from "react";
import { createRoot } from "react-dom/client";
import { SendHorizontal, Volume2 } from "lucide-react";
import "./styles.css";

type Turn = {
  role: "player" | "narrator";
  content: string;
};

const opening =
  "Acordas no escuro. O tecido cobre-te os olhos, húmido e áspero. O chão está frio debaixo dos dedos. Algures à tua frente, uma gota cai devagar. Depois outra. Há uma porta perto. Consegues ouvir a madeira respirar.";

function App() {
  const [currentReply, setCurrentReply] = useState<string>(opening);
  const [history, setHistory] = useState<Turn[]>([
    { role: "narrator", content: opening }
  ]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function submitAction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = message.trim();

    if (!trimmed || isLoading) {
      return;
    }

    const playerTurn: Turn = { role: "player", content: trimmed };
    const nextHistory = [...history, playerTurn];

    setHistory(nextHistory);
    setMessage("");
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/play", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: nextHistory.slice(-12)
        })
      });

      if (!response.ok) {
        throw new Error("O narrador ficou em silêncio.");
      }

      const data = (await response.json()) as { reply?: string };
      const reply =
        data.reply?.trim() ||
        "O silêncio cresce. Há uma vibração no chão, quase como passos.";
      const narratorTurn: Turn = { role: "narrator", content: reply };

      setCurrentReply(reply);
      setHistory((previous) => [...previous, narratorTurn]);
    } catch (caughtError) {
      const fallback =
        caughtError instanceof Error
          ? caughtError.message
          : "A ligação falhou. Só ouves a tua própria respiração.";
      setError(fallback);
      setCurrentReply(
        "O ar torna-se pesado. Algo range no corredor, mas a resposta perde-se antes de chegar a ti."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="game-shell">
      <section className="play-area" aria-label="Blindfold">
        <header className="title-block">
          <div>
            <h1>BLINDFOLD</h1>
            <p>Escute. Pergunte. Sobreviva.</p>
          </div>
          <div className="audio-mark" aria-hidden="true">
            <Volume2 size={20} strokeWidth={1.4} />
          </div>
        </header>

        <article className="narration-panel" aria-live="polite">
          <span className="speaker">Narrador</span>
          <p>{isLoading ? "Prendes a respiração. A casa escuta contigo..." : currentReply}</p>
        </article>

        <form className="command-line" onSubmit={submitAction}>
          <input
            aria-label="Ação do jogador"
            autoComplete="off"
            disabled={isLoading}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Faça uma pergunta ou descreva uma ação..."
            value={message}
          />
          <button disabled={isLoading || message.trim().length === 0} type="submit">
            <SendHorizontal size={18} strokeWidth={1.7} />
            <span>Enviar</span>
          </button>
        </form>

        {error ? <p className="error-text">{error}</p> : null}
      </section>

      <aside className="history-panel" aria-label="Histórico">
        <h2>Histórico</h2>
        <div className="history-list">
          {history.map((turn, index) => (
            <div className="history-turn" key={`${turn.role}-${index}`}>
              <span>{turn.role === "player" ? "Você" : "Narrador"}</span>
              <p>{turn.content}</p>
            </div>
          ))}
        </div>
      </aside>
    </main>
  );
}

export default App;
