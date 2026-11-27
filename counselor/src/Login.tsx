import { useState, type SubmitEvent } from "react";

import { ApiError, login } from "./api";

export function Login({ onLoggedIn }: { onLoggedIn: () => void }) {
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
        setError("Too many attempts. Wait a minute.");
      } else if (err instanceof ApiError && err.status === 401) {
        setError("Wrong password.");
      } else {
        setError("Cannot reach the server.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="login" onSubmit={handleSubmit}>
      <h1>Skrivena vrata: counselor</h1>
      <label>
        Password
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
        />
      </label>
      <button type="submit" disabled={busy || !password}>
        {busy ? "Signing in..." : "Sign in"}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
