import { useRef, useState } from "react";

import { playUrgentAlert } from "./alertSound";

import { listSessions, type CounselorSession } from "./api";
import { useLang, type Strings } from "./i18n";
import { usePoll } from "./usePoll";

function timeAgo(iso: string, t: Strings): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  return minutes < 1 ? t.justNow : t.minutesAgo(minutes);
}

interface Props {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function SessionList({ selectedId, onSelect }: Props) {
  const { t } = useLang();
  const [sessions, setSessions] = useState<CounselorSession[]>([]);
  const [offline, setOffline] = useState(false);
  // Urgent chats already announced, so each one beeps only once.
  const announced = useRef<Set<string>>(new Set());

  usePoll(
    async () => {
      try {
        const next = await listSessions();
        const newlyUrgent = next.filter(
          (s) => s.urgent_since !== null && !announced.current.has(s.id),
        );
        announced.current = new Set(next.filter((s) => s.urgent_since).map((s) => s.id));
        if (newlyUrgent.length > 0) playUrgentAlert();
        setSessions(next);
        setOffline(false);
      } catch (err) {
        setOffline(true);
        throw err;
      }
    },
    3000,
    null,
  );

  return (
    <aside className="sidebar">
      <h2>{t.sessions}</h2>
      {offline && <p className="error">{t.connectionLost}</p>}
      {sessions.length === 0 && <p className="muted">{t.noOpenSessions}</p>}
      <ul>
        {sessions.map((s) => (
          <li key={s.id}>
            <button
              className={[
                "session",
                s.id === selectedId ? "selected" : "",
                s.urgent_since ? "is-urgent" : "",
              ].join(" ")}
              onClick={() => onSelect(s.id)}
            >
              {s.urgent_since && <span className="urgent-badge">{t.urgent}</span>}
              <span className="session-id">{s.counselor_label || `#${s.id.slice(0, 8)}`}</span>
              <span className={`status status-${s.status}`}>{t.status[s.status]}</span>
              {s.unread > 0 && <span className="badge">{s.unread}</span>}
              <span className="muted small">{timeAgo(s.last_activity, t)}</span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
