import { useState, type SubmitEvent } from "react";

import { ApiError, login } from "./api";
import { useLang } from "./i18n";
import { LanguageSelect } from "./LanguageSelect";

export function Login({ onLoggedIn }: { onLoggedIn: () => void }) {
  const { t } = useLang();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(password);
      setPassword("");
      onLoggedIn();
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        setError(t.tooManyAttempts);
      } else if (err instanceof ApiError && err.status === 401) {
        setError(t.wrongPassword);
      } else {
        setError(t.cannotReachServer);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="login" onSubmit={handleSubmit}>
      <LanguageSelect />
      <h1>{t.title}</h1>
      <label>
        {t.password}
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
        />
      </label>
      <button type="submit" disabled={busy || !password}>
        {busy ? t.signingIn : t.signIn}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
