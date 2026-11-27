import { useEffect, useRef, useState, type SubmitEvent } from "react";

import { ApiError, getMessages, sendMessage, type Message, type SessionStatus } from "./api";
import { EMERGENCY_NUMBER } from "./emergency";
import { displayPhrase } from "./foodWords";
import { LANGUAGE_OPTIONS, useLang } from "./i18n";

const POLL_MS = 2000;

interface Props {
  /** Shown once right after starting a chat; null after a resume. */
  resumePhrase: string | null;
}

/** The counselor chat, dressed as the comment thread under a recipe. */
export function Chat({ resumePhrase }: Props) {
  const { lang, t } = useLang();
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<SessionStatus>("waiting");
  const [gone, setGone] = useState(false);
  const [alert, setAlert] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const lastId = useRef(0);

  const locale = LANGUAGE_OPTIONS.find((o) => o.code === lang)?.html ?? "sr-Latn";
  const timeOf = (iso: string) =>
    new Date(iso).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });

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
      setError(err instanceof ApiError && err.status === 409 ? t.closed : t.sendFailed);
    }
  }

  if (gone) {
    return <p className="thread-status">{t.gone}</p>;
  }

  const closed = status === "closed";

  return (
    <div className="thread">
      {resumePhrase && (
        <div className="shopping-list">
          <p className="shopping-title">{t.shoppingTitle}</p>
          <ul>
            {/* The server's Serbian words, shown in her language. */}
            {displayPhrase(resumePhrase, lang).map((word) => (
              <li key={word}>{word}</li>
            ))}
          </ul>
          <p className="shopping-hint">{t.shoppingHint}</p>
        </div>
      )}

      <ol className="comments" aria-live="polite">
        {messages.map((m) => (
          <li key={m.id} className={`comment ${m.sender === "woman" ? "is-mine" : ""}`}>
            <p className="comment-head">
              <span className="comment-name">
                {m.sender === "woman" ? t.you : t.counselorName}
              </span>
              <time className="comment-when">{timeOf(m.created_at)}</time>
            </p>
            {/* Plain text: React escapes it. Never render as HTML. */}
            <p className="comment-text">{m.body}</p>
          </li>
        ))}
      </ol>

      <p className="thread-status">{closed ? t.closed : status === "waiting" ? t.waiting : ""}</p>

      {alert && (
        // She decides whether to call. Nothing ever calls anyone for her.
        <div className="emergency" role="alert">
          <p className="emergency-title">{t.emergencyTitle}</p>
          <p>{t.emergencyText}</p>
          {EMERGENCY_NUMBER[lang] && (
            <a className="emergency-call" href={`tel:${EMERGENCY_NUMBER[lang]}`}>
              {t.emergencyCall(EMERGENCY_NUMBER[lang] ?? "")}
            </a>
          )}
        </div>
      )}

      <form className="composer" onSubmit={handleSend}>
        <label className="composer-label" htmlFor="comment-box">
          {t.leaveComment}
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
          {t.publish}
        </button>
        {error && <p className="form-error">{error}</p>}
      </form>
    </div>
  );
}
