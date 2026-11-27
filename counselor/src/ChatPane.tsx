import { useRef, useState, type SubmitEvent } from "react";

import {
  ApiError,
  closeSession,
  getMessages,
  saveNotes,
  sendMessage,
  type Message,
  type SessionStatus,
} from "./api";
import { useLang } from "./i18n";
import { usePoll } from "./usePoll";

interface Props {
  sessionId: string;
  onClosed: () => void;
}

/** Parent renders this with key={sessionId}, so state resets per session. */
export function ChatPane({ sessionId, onClosed }: Props) {
  const { t } = useLang();
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<SessionStatus | null>(null);
  const [urgent, setUrgent] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [gone, setGone] = useState(false);
  const lastId = useRef(0);
  // Notes are loaded from the first poll only, so later polls never overwrite typing.
  const notesLoaded = useRef(false);
  const [label, setLabel] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notesError, setNotesError] = useState("");
  const savedTimer = useRef<number | undefined>(undefined);

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
        setUrgent(data.urgent === true);
        append(data.messages);
        if (!notesLoaded.current && data.notes) {
          notesLoaded.current = true;
          setLabel(data.notes.counselor_label);
          setNotes(data.notes.counselor_notes);
        }
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
      setError(err instanceof ApiError ? err.message : t.couldNotSend);
    }
  }

  async function handleSaveNotes() {
    setSaving(true);
    setSaved(false);
    setNotesError("");
    window.clearTimeout(savedTimer.current);
    try {
      await saveNotes(sessionId, { counselor_label: label, counselor_notes: notes });
      setSaved(true);
      savedTimer.current = window.setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) setGone(true);
      else setNotesError(t.notesSaveFailed);
    } finally {
      setSaving(false);
    }
  }

  async function handleClose() {
    if (!window.confirm(t.confirmClose)) return;
    try {
      await closeSession(sessionId);
      onClosed();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.couldNotClose);
    }
  }

  if (gone) {
    return (
      <section className="chat">
        <p className="muted">{t.chatGone}</p>
      </section>
    );
  }

  const closed = status === "closed";

  return (
    <section className="chat">
      <header className="chat-header">
        <span>
          #{sessionId.slice(0, 8)} <span className={`status status-${status}`}>
            {status ? t.status[status] : ""}
          </span>
        </span>
        <button onClick={handleClose} disabled={closed}>
          {t.closeChat}
        </button>
      </header>

      {urgent && (
        <p className="urgent-banner" role="alert">
          {t.urgentBanner}
        </p>
      )}
      <div className="chat-body">
      <div className="chat-main">
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
          placeholder={closed ? t.chatClosed : t.reply}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
        />
        <button type="submit" disabled={closed || !draft.trim()}>
          {t.send}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      </div>

      <aside className="notes-panel">
        <h3>{t.notesTitle}</h3>
        <label>
          {t.nicknameLabel}
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            maxLength={60}
            autoComplete="off"
          />
        </label>
        <p className="muted small">{t.nicknameHint}</p>
        <label>
          {t.notesLabel}
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={4000}
            rows={6}
          />
        </label>
        <p className="muted small">{t.notesHint}</p>
        <button onClick={handleSaveNotes} disabled={saving}>
          {saved ? t.notesSaved : t.saveNotes}
        </button>
        {notesError && <p className="error">{notesError}</p>}
      </aside>
      </div>
    </section>
  );
}
