import { useEffect, useRef, useState, type SubmitEvent } from "react";

import { ApiError, getMessages, sendMessage, type Message, type SessionStatus } from "./api";

const POLL_MS = 2000;
// How the counselor appears in the thread. Ordinary on purpose.
const COUNSELOR_NAME = "Vesna";

interface Props {
  /** Shown once right after starting a chat; null after a resume. */
  resumePhrase: string | null;
}

function timeOf(iso: string): string {
  return new Date(iso).toLocaleTimeString("sr-Latn-RS", { hour: "2-digit", minute: "2-digit" });
}

/** The counselor chat, dressed as the comment thread under a recipe. */
export function Chat({ resumePhrase }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<SessionStatus>("waiting");
  const [gone, setGone] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const lastId = useRef(0);

  function append(incoming: Message[]) {
    const fresh = incoming.filter((m) => m.id > lastId.current);
    const newest = fresh.at(-1);
    if (!newest) return;
    lastId.current = newest.id;
    setMessages((prev) => [...prev, ...fresh]);
  }

  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function poll() {
      try {
        const data = await getMessages(lastId.current);
        setStatus(data.status);
        append(data.messages);
      } catch (err) {
        if (err instanceof ApiError && err.status === 403) {
          setGone(true); // expired or deleted: stop polling
          return;
        }
      }
      if (!stopped) timer = setTimeout(poll, POLL_MS);
    }
    void poll();

    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, []);

  async function handleSend(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setError("");
    try {
      append([await sendMessage(body)]);
      setDraft("");
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 409
          ? "Komentari su zatvoreni."
          : "Komentar nije poslat. Pokušaj ponovo.",
      );
    }
  }

  if (gone) {
    return <p className="thread-status">Ovaj razgovor više ne postoji.</p>;
  }

  const closed = status === "closed";

  return (
    <div className="thread">
      {resumePhrase && (
        <div className="shopping-list">
          <p className="shopping-title">Lista za kupovinu</p>
          <ul>
            {resumePhrase.split("-").map((word) => (
              <li key={word}>{word}</li>
            ))}
          </ul>
          <p className="shopping-hint">
            Ove četiri reči upisane u pretragu vraćaju te na ovaj razgovor.
          </p>
        </div>
      )}

      <ol className="comments" aria-live="polite">
        {messages.map((m) => (
          <li key={m.id} className={`comment ${m.sender === "woman" ? "is-mine" : ""}`}>
            <p className="comment-head">
              <span className="comment-name">{m.sender === "woman" ? "Ti" : COUNSELOR_NAME}</span>
              <time className="comment-when">{timeOf(m.created_at)}</time>
            </p>
            {/* Plain text: React escapes it. Never render as HTML. */}
            <p className="comment-text">{m.body}</p>
          </li>
        ))}
      </ol>

      <p className="thread-status">
        {closed
          ? "Komentari su zatvoreni."
          : status === "waiting"
            ? "Komentar je primljen. Odgovor stiže uskoro."
            : ""}
      </p>

      <form className="composer" onSubmit={handleSend}>
        <label className="composer-label" htmlFor="comment-box">
          Ostavi komentar
        </label>
        <textarea
          id="comment-box"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={2000}
          rows={3}
          disabled={closed}
          autoComplete="off"
          spellCheck={false}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
        />
        <button type="submit" className="ink-button" disabled={closed || !draft.trim()}>
          Objavi komentar
        </button>
        {error && <p className="form-error">{error}</p>}
      </form>
    </div>
  );
}
