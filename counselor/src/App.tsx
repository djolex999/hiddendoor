import { useEffect, useState } from "react";

import { isLoggedIn, logout, setUnauthorizedHandler } from "./api";
import { ChatPane } from "./ChatPane";
import { Login } from "./Login";
import { SessionList } from "./SessionList";

export function App() {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    // Expired or rejected token anywhere: back to the login screen.
    setUnauthorizedHandler(() => {
      setSelectedId(null);
      setLoggedIn(false);
    });
  }, []);

  if (!loggedIn) return <Login onLoggedIn={() => setLoggedIn(true)} />;

  return (
    <div className="layout">
      <SessionList selectedId={selectedId} onSelect={setSelectedId} />
      <main>
        <div className="topbar">
          <button
            onClick={() => {
              logout();
              setSelectedId(null);
              setLoggedIn(false);
            }}
          >
            Log out
          </button>
        </div>
        {selectedId ? (
          <ChatPane key={selectedId} sessionId={selectedId} onClosed={() => setSelectedId(null)} />
        ) : (
          <p className="muted">Select a session.</p>
        )}
      </main>
    </div>
  );
}
