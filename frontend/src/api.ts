// Typed client for every woman-side endpoint.
//
// Privacy rules this file enforces:
// - All state (unlock token, session id, secret) lives in this module's memory
//   only. Never in localStorage, sessionStorage, cookies or IndexedDB (ESLint
//   blocks those). Closing or reloading the tab forgets everything.
// - Requests send no cookies (credentials: "omit"), are never cached by the
//   browser (cache: "no-store") and send no Referer header.
// - Call wipe() to forget everything right now (the panic button does).

const BASE_URL: string = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export interface HelpCard {
  slug: string;
  title: string;
  /** Markdown written by the team in the admin. Render as text, or with a
   *  markdown renderer that does NOT allow raw HTML. */
  body: string;
}

export type SessionStatus = "waiting" | "active" | "closed";
export type Sender = "woman" | "counselor";

export interface Message {
  id: number;
  sender: Sender;
  /** Plain text from a person. Always render as text, never as HTML. */
  body: string;
  created_at: string;
}

export interface MessagesResponse {
  status: SessionStatus;
  messages: Message[];
}

export interface StartedChat {
  sessionId: string;
  /** Show this to her once. It is the only way back into the chat later. */
  resumePhrase: string;
}

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

interface MemoryState {
  unlockToken: string | null;
  sessionId: string | null;
  secret: string | null;
}

const state: MemoryState = { unlockToken: null, sessionId: null, secret: null };

/** Forget every credential held in memory. Does not call the server. */
export function wipe(): void {
  state.unlockToken = null;
  state.sessionId = null;
  state.secret = null;
}

export function hasChat(): boolean {
  return state.sessionId !== null && state.secret !== null;
}

function buildRequest(path: string, init: RequestInit = {}): Request {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  return new Request(`${BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: "omit",
    cache: "no-store",
    referrerPolicy: "no-referrer",
  });
}

async function send<T>(request: Request): Promise<T> {
  const response = await fetch(request);
  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    const detail =
      body && typeof body === "object" && "detail" in body ? String(body.detail) : "";
    throw new ApiError(response.status, detail || `Request failed (${response.status})`);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

function chatRequest(suffix: string, init: RequestInit = {}): Request {
  if (!state.sessionId || !state.secret) throw new Error("No chat in progress");
  const headers = new Headers(init.headers);
  headers.set("X-Session-Secret", state.secret);
  return buildRequest(`/api/chat/${state.sessionId}${suffix}`, { ...init, headers });
}

// Door

/**
 * Send the collected tap sequence. Returns the help cards if it opened the
 * door, or null if not (wrong sequence: the server answers 204 with nothing).
 * Throws ApiError 429 when rate limited.
 */
export async function unlock(sequence: number[]): Promise<HelpCard[] | null> {
  const response = await fetch(
    buildRequest("/api/u/", { method: "POST", body: JSON.stringify({ sequence }) }),
  );
  if (response.status === 204) return null;
  if (!response.ok) throw new ApiError(response.status, `Request failed (${response.status})`);
  const data = (await response.json()) as { unlock_token: string; cards: HelpCard[] };
  state.unlockToken = data.unlock_token;
  return data.cards;
}

// Chat

/** Needs a successful unlock() in the last 10 minutes. 403 = unlock expired. */
export async function startChat(): Promise<StartedChat> {
  if (!state.unlockToken) throw new Error("Door is not unlocked");
  const data = await send<{ session_id: string; secret: string; resume_phrase: string }>(
    buildRequest("/api/chat/start", {
      method: "POST",
      body: JSON.stringify({ unlock_token: state.unlockToken }),
    }),
  );
  state.sessionId = data.session_id;
  state.secret = data.secret;
  return { sessionId: data.session_id, resumePhrase: data.resume_phrase };
}

/** Get back into an open chat with the 4-word phrase. 404 = no such open chat. */
export async function resumeChat(resumePhrase: string): Promise<void> {
  const data = await send<{ session_id: string; secret: string }>(
    buildRequest("/api/chat/resume", {
      method: "POST",
      body: JSON.stringify({ resume_phrase: resumePhrase }),
    }),
  );
  state.sessionId = data.session_id;
  state.secret = data.secret;
}

/** Poll for messages newer than `after` (a message id; 0 = all). 403 = chat gone. */
export function getMessages(after: number): Promise<MessagesResponse> {
  return send(chatRequest(`/messages?after=${after}`));
}

/** Max 2000 characters. 409 = the counselor closed the chat. */
export function sendMessage(body: string): Promise<Message> {
  return send(chatRequest("/messages", { method: "POST", body: JSON.stringify({ body }) }));
}

/**
 * Delete the chat and all its messages on the server, then wipe memory.
 *
 * The request is built synchronously and sent with keepalive, so it still
 * reaches the server if the page navigates away right after this call (the
 * panic button does exactly that).
 */
export function endChat(): Promise<void> {
  if (!hasChat()) {
    wipe();
    return Promise.resolve();
  }
  const request = chatRequest("/end", { method: "POST", keepalive: true });
  wipe();
  return send(request);
}
