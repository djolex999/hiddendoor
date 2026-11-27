import { useEffect, useRef, useState } from "react";

import { ApiError, startChat, type HelpCard } from "./api";
import { Chat } from "./Chat";
import { panic } from "./panic";

export type ChatState = { kind: "none" } | { kind: "open"; resumePhrase: string | null };

interface Props {
  cards: HelpCard[];
  chat: ChatState;
  onChatOpened: (chat: ChatState) => void;
}

// Admin-written markdown, shown as plain text: drop the bold markers only.
function plain(markdown: string): string {
  return markdown.replaceAll("**", "");
}

/**
 * Help, dressed as the "tips" notes and comment thread of the recipe page.
 * Everything inside carries .help-only so it disappears when the tab hides.
 */
export function HelpView({ cards, chat, onChatOpened }: Props) {
  const [error, setError] = useState("");
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  async function handleStart() {
    setError("");
    try {
      const started = await startChat();
      onChatOpened({ kind: "open", resumePhrase: started.resumePhrase });
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 403
          ? "Prošlo je previše vremena. Otvori savete ponovo."
          : "Nije uspelo. Pokušaj ponovo.",
      );
    }
  }

  return (
    <section ref={ref} className="help help-only" aria-label="Saveti">
      <div className="help-head">
        <h2>Saveti iz sveske</h2>
        <button type="button" className="quiet-link" onClick={panic}>
          Sakrij savete
        </button>
      </div>

      {cards.length > 0 && (
        <div className="notes">
          {cards.map((card) => (
            <article key={card.slug} className="note">
              <h3>{card.title}</h3>
              <p>{plain(card.body)}</p>
            </article>
          ))}
        </div>
      )}

      {chat.kind === "open" ? (
        <Chat resumePhrase={chat.resumePhrase} />
      ) : (
        <div className="start">
          <p>Imaš pitanje? Piši nam ovde, odgovara prava osoba.</p>
          <button type="button" className="ink-button" onClick={handleStart}>
            Napiši nam
          </button>
          {error && <p className="form-error">{error}</p>}
        </div>
      )}
    </section>
  );
}
