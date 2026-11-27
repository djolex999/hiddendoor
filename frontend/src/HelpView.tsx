import { useEffect, useRef, useState } from "react";

import { ApiError, startChat, type ChatTopic, type HelpCard } from "./api";
import { Chat } from "./Chat";
import { ChildHelplineCard } from "./ChildHelplineCard";
import { EmergencyCard } from "./EmergencyCard";
import { helpLayout, type Audience } from "./helpLogic";
import { HELP_STRINGS } from "./helpStrings";
import { useLang } from "./i18n";
import { panic } from "./panic";

export type ChatState = { kind: "none" } | { kind: "open"; resumePhrase: string | null };

/** What she picked after the door opened; "all" shows every card. */
type Path = ChatTopic | "all";

interface Props {
  cards: HelpCard[];
  chat: ChatState;
  onChatOpened: (chat: ChatState) => void;
  /** Set by the cover (required). Teen covers show a children's helpline,
   *  never the chat. */
  audience: Audience;
}

// Admin-written markdown, shown as plain text: drop the bold markers only.
function plain(markdown: string): string {
  return markdown.replaceAll("**", "");
}

/**
 * Help, dressed as the "tips" notes and comment thread of the recipe page.
 * One question first ("What is happening?") routes to one of three paths.
 * Everything inside carries .help-only so it disappears when the tab hides.
 * Loaded lazily: none of this is in the recipe page's main bundle.
 */
export function HelpView({ cards, chat, onChatOpened, audience }: Props) {
  const { lang } = useLang();
  const h = HELP_STRINGS[lang];
  const [path, setPath] = useState<Path | null>(null);
  const [error, setError] = useState("");
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // Back via the search box (resume): she already chose before, go straight in.
  const resumed = chat.kind === "open" && cards.length === 0;
  const layout = helpLayout(path ?? "all", audience);
  const visibleCards =
    path === null || path === "all"
      ? cards
      : cards.filter((c) => c.topic === "general" || c.topic === path);

  async function handleStart() {
    setError("");
    try {
      const started = await startChat(path === null || path === "all" ? undefined : path);
      onChatOpened({ kind: "open", resumePhrase: started.resumePhrase });
    } catch (err) {
      setError(err instanceof ApiError && err.status === 403 ? h.startExpired : h.startFailed);
    }
  }

  const paths: { value: Path; label: string }[] = [
    { value: "control", label: h.topicControl },
    { value: "danger", label: h.topicDanger },
    { value: "grooming", label: h.topicGrooming },
    { value: "all", label: h.topicAll },
  ];

  return (
    <section ref={ref} className="help help-only" aria-label={h.helpTitle}>
      <div className="help-head">
        <h2>{h.helpTitle}</h2>
        <button type="button" className="quiet-link" onClick={panic}>
          {h.hideTips}
        </button>
      </div>

      {path === null && !resumed && cards.length > 0 ? (
        <div className="paths">
          <p className="paths-question">{h.topicQuestion}</p>
          {paths.map((p) => (
            <button
              key={p.value}
              type="button"
              className={p.value === "all" ? "path-button quiet" : "path-button"}
              onClick={() => setPath(p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>
      ) : (
        <>
          {/* She said she is in danger: the emergency number comes first. */}
          {layout.emergencyFirst && <EmergencyCard />}
          {layout.childHelpline && <ChildHelplineCard />}

          {visibleCards.length > 0 && (
            <div className="notes">
              {visibleCards.map((card) => (
                <article key={card.slug} className="note">
                  <h3>{card.title}</h3>
                  <p>{plain(card.body)}</p>
                </article>
              ))}
            </div>
          )}

          {!layout.chat ? null : chat.kind === "open" ? (
            <Chat resumePhrase={chat.resumePhrase} />
          ) : (
            <div className="start">
              <p>{h.askPrompt}</p>
              <button type="button" className="ink-button" onClick={handleStart}>
                {h.writeToUs}
              </button>
              {error && <p className="form-error">{error}</p>}
            </div>
          )}
        </>
      )}
    </section>
  );
}
