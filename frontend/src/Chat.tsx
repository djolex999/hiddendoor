import { useEffect, useRef, useState, type SubmitEvent } from "react";

import { ApiError, getMessages, sendMessage, type Message, type SessionStatus } from "./api";

const POLL_MS = 2000;

interface Props {
  /** Shown once right after starting a chat; null after a resume. */
  resumePhrase: string | null;
}

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
      setError(err instanceof ApiError && err.status === 409 ? "Razgovor je završen." : "Greška.");
    }
  }

  if (gone) return <p>Ovaj razgovor više ne postoji.</p>;

  const closed = status === "closed";

  return (
    <section>
      {resumePhrase && (
        <p>
          Tvoja šifra za povratak: <strong>{resumePhrase}</strong>
        </p>
      )}
      <p>{status === "waiting" ? "Čekamo savetnicu..." : closed ? "Razgovor je završen." : ""}</p>

      <ol>
        {messages.map((m) => (
          <li key={m.id}>
            <strong>{m.sender === "woman" ? "Ti" : "Savetnica"}:</strong>{" "}
            {/* Plain text: React escapes it. Never render as HTML. */}
            <span style={{ whiteSpace: "pre-wrap" }}>{m.body}</span>
          </li>
        ))}
      </ol>

      <form onSubmit={handleSend}>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={2000}
          rows={3}
          disabled={closed}
        />
        <button type="submit" disabled={closed || !draft.trim()}>
          Pošalji
        </button>
      </form>
      {error && <p>{error}</p>}
    </section>
  );
}
