import { useEffect, useRef, useState } from "react";

import { ApiError, startChat, type HelpCard } from "./api";
import { Chat } from "./Chat";
import { useLang } from "./i18n";
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
  const { t } = useLang();
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
      setError(err instanceof ApiError && err.status === 403 ? t.startExpired : t.startFailed);
    }
  }

  return (
    <section ref={ref} className="help help-only" aria-label={t.helpTitle}>
      <div className="help-head">
        <h2>{t.helpTitle}</h2>
        <button type="button" className="quiet-link" onClick={panic}>
          {t.hideTips}
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
          <p>{t.askPrompt}</p>
          <button type="button" className="ink-button" onClick={handleStart}>
            {t.writeToUs}
          </button>
          {error && <p className="form-error">{error}</p>}
        </div>
      )}
    </section>
  );
}
