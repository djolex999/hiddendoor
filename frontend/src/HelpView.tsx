import { useState, type SubmitEvent } from "react";

import { ApiError, resumeChat, startChat, type HelpCard } from "./api";
import { Chat } from "./Chat";

type ChatState = { kind: "none" } | { kind: "open"; resumePhrase: string | null };

export function HelpView({ cards }: { cards: HelpCard[] }) {
  const [chat, setChat] = useState<ChatState>({ kind: "none" });
  const [phrase, setPhrase] = useState("");
  const [error, setError] = useState("");

  async function handleStart() {
    setError("");
    try {
      const started = await startChat();
      setChat({ kind: "open", resumePhrase: started.resumePhrase });
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 403
          ? "Isteklo je vreme. Otvori ponovo."
          : "Pokušaj ponovo.",
      );
    }
  }

  async function handleResume(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      await resumeChat(phrase);
      setPhrase("");
      setChat({ kind: "open", resumePhrase: null });
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 429 ? "Sačekaj minut." : "Nije pronađeno.",
      );
    }
  }

  return (
    <section>
      {cards.map((card) => (
        <article key={card.slug}>
          <h2>{card.title}</h2>
          {/* Markdown shown as plain text for now. Milica: if you add a
              markdown renderer, it must not allow raw HTML. */}
          <p style={{ whiteSpace: "pre-wrap" }}>{card.body}</p>
        </article>
      ))}

      {chat.kind === "open" ? (
        <Chat resumePhrase={chat.resumePhrase} />
      ) : (
        <>
          <button onClick={handleStart}>Razgovaraj sa savetnicom</button>
          <form onSubmit={handleResume}>
            <input
              value={phrase}
              onChange={(e) => setPhrase(e.target.value)}
              placeholder="cimet-pita-limun-med"
              autoComplete="off"
              spellCheck={false}
            />
            <button type="submit" disabled={!phrase.trim()}>
              Nastavi razgovor
            </button>
          </form>
        </>
      )}
      {error && <p>{error}</p>}
    </section>
  );
}
