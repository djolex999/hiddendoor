// Counselor API client. The Bearer token lives only in this module's memory:
// a page reload logs the counselor out, and nothing is written to the device.

const BASE_URL: string = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export type SessionStatus = "waiting" | "active" | "closed";
export type Sender = "woman" | "counselor";

export interface CounselorSession {
  id: string;
  status: SessionStatus;
  created_at: string;
  last_activity: string;
  expires_at: string;
  unread: number;
  /** Set when one of her messages signals immediate danger; null otherwise. */
  urgent_since: string | null;
  /** The path she picked after the door; "" when she skipped it. */
  topic: "" | "control" | "danger" | "grooming";
  /** Private nickname set by counselors; empty when unset. */
  counselor_label: string;
}

export interface Message {
  id: number;
  sender: Sender;
  body: string;
  created_at: string;
}

export interface MessagesResponse {
  status: SessionStatus;
  messages: Message[];
  /** Counselor view only: the chat is flagged urgent until a counselor replies. */
  urgent?: boolean;
  /** The path she picked after the door ("" when skipped). */
  topic?: "" | "control" | "danger" | "grooming";
  /** Private counselor nickname and notes for this chat. */
  notes?: CounselorNotes;
}

export interface CounselorNotes {
  counselor_label: string;
  counselor_notes: string;
}

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

let token: string | null = null;
let onUnauthorized: () => void = () => {};

export function setUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler;
}

export function isLoggedIn(): boolean {
  return token !== null;
}

export function logout(): void {
  token = null;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: "omit",
    cache: "no-store",
    referrerPolicy: "no-referrer",
  });

  if (response.status === 401 && token) {
    token = null;
    onUnauthorized();
  }
  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    const detail =
      body && typeof body === "object" && "detail" in body ? String(body.detail) : "";
    throw new ApiError(response.status, detail || `Request failed (${response.status})`);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export async function login(password: string): Promise<void> {
  const data = await request<{ token: string; expires_in: number }>("/api/c/login", {
    method: "POST",
    body: JSON.stringify({ password }),
  });
  token = data.token;
}

export function listSessions(): Promise<CounselorSession[]> {
  return request("/api/c/sessions");
}

export function getMessages(sessionId: string, after: number): Promise<MessagesResponse> {
  return request(`/api/c/sessions/${sessionId}/messages?after=${after}`);
}

export function sendMessage(sessionId: string, body: string): Promise<Message> {
  return request(`/api/c/sessions/${sessionId}/messages`, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
}

export function closeSession(sessionId: string): Promise<void> {
  return request(`/api/c/sessions/${sessionId}/close`, { method: "POST" });
}

export function saveNotes(
  sessionId: string,
  notes: Partial<CounselorNotes>,
): Promise<CounselorNotes> {
  return request(`/api/c/sessions/${sessionId}/notes`, {
    method: "PATCH",
    body: JSON.stringify(notes),
  });
}
