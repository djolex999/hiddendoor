import { useEffect, useRef, useState, type SubmitEvent } from "react";

import {
  ApiError,
  getMessages,
  sendMessage,
  type Message,
  type SessionStatus,
} from "./api";
import { EmergencyCard } from "./EmergencyCard";
import { displayPhrase } from "./foodWords";
import { HELP_STRINGS } from "./helpStrings";
import { LANGUAGE_OPTIONS, useLang } from "./i18n";

const POLL_MS = 2000;

interface Props {
  /** Shown once right after starting a chat; null after a resume. */
  resumePhrase: string | null;
}

/** The counselor chat, dressed as the comment thread under a recipe. */
export function Chat({ resumePhrase }: Props) {
  const { lang } = useLang();
  const h = HELP_STRINGS[lang];
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<SessionStatus>("waiting");
  const [gone, setGone] = useState(false);
  const [alert, setAlert] = useState(false);
  // She asked about the police: show her the number to call herself, now.
  // Counselors cannot send anyone; they do not know where she is.
  const [askedPolice, setAskedPolice] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const lastId = useRef(0);

  const locale =
    LANGUAGE_OPTIONS.find((o) => o.code === lang)?.html ?? "sr-Latn";
  const timeOf = (iso: string) =>
    new Date(iso).toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
    });

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
        setAlert(data.alert === true);
        append(data.messages);
      } catch (err) {
        if (err instanceof ApiError && err.status === 403) {
          // Ended, expired, or resumed somewhere else (the secret rotated).
          setGone(true);
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

  async function send(body: string) {
    const text = body.trim();
    if (!text || sending) return;
    setError("");
    setSending(true);
    try {
      append([await sendMessage(text)]);
      setDraft("");
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 409 ? h.closed : h.sendFailed,
      );
    } finally {
      setSending(false);
    }
  }

  function handleSend(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    void send(draft);
  }

  if (gone) {
    return <p className="thread-status">{h.gone}</p>;
  }

  const closed = status === "closed";
  // One tap sends a whole sentence: for when typing is too slow or too risky.
  const quickReplies = [h.qrCantTalk, h.qrHeIsNear, h.qrCallPolice, h.qrLater];

  return (
    <div className="thread">
      {resumePhrase && (
        <div className="shopping-list">
          <p className="shopping-title">{h.shoppingTitle}</p>
          <ul>
            {/* The server's Serbian words, shown in her language. */}
            {displayPhrase(resumePhrase, lang).map((word) => (
              <li key={word}>{word}</li>
            ))}
          </ul>
          <p className="shopping-hint">{h.shoppingHint}</p>
        </div>
      )}

      <ol className="comments" aria-live="polite">
        {messages.map((m) => (
          <li
            key={m.id}
            className={`comment ${m.sender === "woman" ? "is-mine" : ""}`}
          >
            <p className="comment-head">
              <span className="comment-name">
                {m.sender === "woman" ? h.you : h.counselorName}
              </span>
              <time className="comment-when">{timeOf(m.created_at)}</time>
            </p>
            {/* Plain text: React escapes it. Never render as HTML. */}
            <p className="comment-text">{m.body}</p>
          </li>
        ))}
      </ol>

      <p className="thread-status">
        {closed ? h.closed : status === "waiting" ? h.waiting : ""}
      </p>

      {(alert || askedPolice) && <EmergencyCard />}

      {!closed && (
        <div
          className="quick-replies"
          role="group"
          aria-label={h.quickRepliesLabel}
        >
          {quickReplies.map((text) => (
            <button
              key={text}
              type="button"
              className="quick-reply"
              disabled={sending}
              onClick={() => {
                if (text === h.qrCallPolice) setAskedPolice(true);
                void send(text);
              }}
            >
              {text}
            </button>
          ))}
        </div>
      )}

      <form className="composer" onSubmit={handleSend}>
        <label className="composer-label" htmlFor="comment-box">
          {h.leaveComment}
        </label>
        <textarea
          id="comment-box"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={2000}
          rows={3}
          disabled={closed}
          // Keep the phone keyboard from learning and later suggesting what she wrote.
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
        />
        <button
          type="submit"
          className="ink-button"
          disabled={closed || sending || !draft.trim()}
        >
          {h.publish}
        </button>
        {error && <p className="form-error">{error}</p>}
      </form>
    </div>
  );
}
