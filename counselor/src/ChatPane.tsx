import { useRef, useState, type SubmitEvent } from "react";

import {
  ApiError,
  closeSession,
  getMessages,
  sendMessage,
  type Message,
  type SessionStatus,
} from "./api";
import { usePoll } from "./usePoll";

interface Props {
  sessionId: string;
  onClosed: () => void;
}

/** Parent renders this with key={sessionId}, so state resets per session. */
export function ChatPane({ sessionId, onClosed }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<SessionStatus | null>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [gone, setGone] = useState(false);
  const lastId = useRef(0);

  function append(incoming: Message[]) {
    const fresh = incoming.filter((m) => m.id > lastId.current);
    const newest = fresh.at(-1);
    if (!newest) return;
    lastId.current = newest.id;
    setMessages((prev) => [...prev, ...fresh]);
  }

  usePoll(
    async () => {
      if (gone) return;
      try {
        const data = await getMessages(sessionId, lastId.current);
        setStatus(data.status);
        append(data.messages);
      } catch (err) {
        // 404: she pressed the exit button (data deleted) or it expired.
        if (err instanceof ApiError && err.status === 404) setGone(true);
        throw err;
      }
    },
    2000,
    sessionId,
  );

  async function handleSend(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setError("");
    try {
      append([await sendMessage(sessionId, body)]);
      setDraft("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not send.");
    }
  }

  async function handleClose() {
    if (!window.confirm("Close this chat? She will see it as ended.")) return;
    try {
      await closeSession(sessionId);
      onClosed();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not close.");
    }
  }

  if (gone) {
    return (
      <section className="chat">
        <p className="muted">This chat no longer exists. She ended it or it expired.</p>
      </section>
    );
  }

  const closed = status === "closed";

  return (
    <section className="chat">
      <header className="chat-header">
        <span>
          #{sessionId.slice(0, 8)} <span className={`status status-${status}`}>{status}</span>
        </span>
        <button onClick={handleClose} disabled={closed}>
          Close chat
        </button>
      </header>

      <ol className="messages">
        {messages.map((m) => (
          <li key={m.id} className={`message from-${m.sender}`}>
            {/* Plain text only: React escapes it, never render as HTML. */}
            <p>{m.body}</p>
            <time className="muted small">{new Date(m.created_at).toLocaleTimeString()}</time>
          </li>
        ))}
      </ol>

      <form className="composer" onSubmit={handleSend}>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={2000}
          rows={3}
          disabled={closed}
          placeholder={closed ? "Chat closed" : "Reply..."}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
        />
        <button type="submit" disabled={closed || !draft.trim()}>
          Send
        </button>
      </form>
      {error && <p className="error">{error}</p>}
    </section>
  );
}
