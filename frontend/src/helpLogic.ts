// Pure decisions behind the help screens, kept free of React and imports so
// they can be tested with Node's built-in test runner (tests/helpLogic.test.mjs).

export type Audience = "adult" | "teen";
export type PathChoice = "control" | "danger" | "grooming" | "all";
export type ChatStatus = "waiting" | "active" | "closed";

export interface HelpLayout {
  /** Her country's emergency number before anything else. */
  emergencyFirst: boolean;
  /** The children's helpline card (teen covers only). */
  childHelpline: boolean;
  /** The "write to us" counselor chat (adult covers only). */
  chat: boolean;
}

export function helpLayout(path: PathChoice, audience: Audience): HelpLayout {
  return {
    emergencyFirst: path === "danger",
    childHelpline: audience === "teen",
    // Teens never get the adult counselor chat. The server refuses it too.
    chat: audience === "adult",
  };
}

export type WaitingNotice = "none" | "replySoon" | "noCounselor";

/**
 * What the chat says about when a counselor will answer. Only while she waits
 * for a first reply: once a counselor is talking to her, presence flickers
 * are not worth alarming her. Before the server answers, say nothing.
 */
export function waitingNotice(
  status: ChatStatus,
  counselorOnline: boolean | undefined,
): WaitingNotice {
  if (status !== "waiting" || counselorOnline === undefined) return "none";
  return counselorOnline ? "replySoon" : "noCounselor";
}

/** "09:00-21:00" -> ["09:00", "21:00"]; anything else -> null. */
export function parseHours(raw: string | undefined): [string, string] | null {
  const match = /^\s*(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})\s*$/.exec(raw ?? "");
  const from = match?.[1];
  const to = match?.[2];
  return from && to ? [from, to] : null;
}
