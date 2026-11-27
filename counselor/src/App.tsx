import { useEffect, useMemo, useState } from "react";

import { isLoggedIn, logout, setUnauthorizedHandler } from "./api";
import { ChatPane } from "./ChatPane";
import { detectLanguage, LangContext, STRINGS, type Lang } from "./i18n";
import { LanguageSelect } from "./LanguageSelect";
import { Login } from "./Login";
import { SessionList } from "./SessionList";

export function App() {
  const [lang, setLang] = useState<Lang>(detectLanguage);
  const langState = useMemo(() => ({ lang, setLang, t: STRINGS[lang] }), [lang]);
  const t = langState.t;
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    // Expired or rejected token anywhere: back to the login screen.
    setUnauthorizedHandler(() => {
      setSelectedId(null);
      setLoggedIn(false);
    });
  }, []);

  if (!loggedIn) {
    return (
      <LangContext.Provider value={langState}>
        <Login onLoggedIn={() => setLoggedIn(true)} />
      </LangContext.Provider>
    );
  }

  return (
    <LangContext.Provider value={langState}>
    <div className="layout">
      <SessionList selectedId={selectedId} onSelect={setSelectedId} />
      <main>
        <div className="topbar">
          <LanguageSelect />
          <button
            onClick={() => {
              logout();
              setSelectedId(null);
              setLoggedIn(false);
            }}
          >
            {t.logOut}
          </button>
        </div>
        {selectedId ? (
          <ChatPane key={selectedId} sessionId={selectedId} onClosed={() => setSelectedId(null)} />
        ) : (
          <p className="muted">{t.selectSession}</p>
        )}
      </main>
    </div>
    </LangContext.Provider>
  );
}
