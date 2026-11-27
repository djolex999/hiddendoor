import { useState } from "react";

import { listSessions, type CounselorSession } from "./api";
import { usePoll } from "./usePoll";

function minutesAgo(iso: string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  return minutes < 1 ? "just now" : `${minutes} min ago`;
}

interface Props {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function SessionList({ selectedId, onSelect }: Props) {
  const [sessions, setSessions] = useState<CounselorSession[]>([]);
  const [offline, setOffline] = useState(false);

  usePoll(
    async () => {
      try {
        setSessions(await listSessions());
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
      <h2>Sessions</h2>
      {offline && <p className="error">Connection lost, retrying...</p>}
      {sessions.length === 0 && <p className="muted">No open sessions.</p>}
      <ul>
        {sessions.map((s) => (
          <li key={s.id}>
            <button
              className={s.id === selectedId ? "session selected" : "session"}
              onClick={() => onSelect(s.id)}
            >
              <span className="session-id">#{s.id.slice(0, 8)}</span>
              <span className={`status status-${s.status}`}>{s.status}</span>
              {s.unread > 0 && <span className="badge">{s.unread}</span>}
              <span className="muted small">{minutesAgo(s.last_activity)}</span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
