import {
  Component,
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { HelpCard } from "../../api";
import { detectLanguage, LangContext, STRINGS, type Lang } from "../../i18n";
import {
  IDLE_EXIT_MS,
  markActivity,
  panic,
  setHelpOpen,
  softExit,
} from "../../panic";
import { TapDoor } from "../../TapDoor";
import { COVERS } from "../index";
import "./homework.css";

const HelpView = lazy(() =>
  import("../../HelpView").then((m) => ({ default: m.HelpView })),
);

// STUB, not a finished cover: it only proves the door mounts on a different
// site and leads teens to a children's helpline instead of the adult chat.
// English placeholder text on purpose; real content and the 8 translations
// come with the real cover (see COVERS.md). Never linked from the public site.
const TASKS = [
  "Read chapter 4",
  "Maths worksheet, page 32",
  "Learn ten new words",
  "Finish the history summary",
  "Practise the presentation",
  "Pack the PE kit",
];

/** A failed help chunk closes help quietly instead of a white page. */
class HelpBoundary extends Component<
  { onFail: () => void; children: ReactNode },
  { failed: boolean }
> {
  override state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  override componentDidCatch() {
    this.props.onFail();
  }

  override render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function HomeworkCover() {
  const [lang] = useState<Lang>(detectLanguage);
  const [cards, setCards] = useState<HelpCard[] | null>(null);
  const langState = useMemo(() => ({ lang, t: STRINGS[lang] }), [lang]);
  const audience = COVERS.homework.audience;
  const helpOpen = cards !== null;

  // The same trace guards as the recipe cover (App.tsx): close help after a
  // minute away or ten idle minutes, and Escape leaves at once.
  useEffect(() => {
    setHelpOpen(helpOpen);
    if (!helpOpen) return;
    let timer = setTimeout(softExit, IDLE_EXIT_MS);
    const reset = () => {
      markActivity();
      clearTimeout(timer);
      timer = setTimeout(softExit, IDLE_EXIT_MS);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") panic();
    };
    const events = ["pointerdown", "keydown", "scroll", "touchstart"] as const;
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, reset));
      window.removeEventListener("keydown", onKey);
    };
  }, [helpOpen]);

  return (
    <LangContext.Provider value={langState}>
      <main className="homework">
        <button type="button" className="wordmark" onClick={panic}>
          Homework helper
        </button>
        <h1>Today's tasks</h1>
        <p className="stub-note">Tick a task when it is done.</p>
        <TapDoor items={TASKS} onUnlocked={setCards} audience={audience} />
        {cards && (
          <HelpBoundary onFail={() => setCards(null)}>
            <Suspense fallback={null}>
              <HelpView
                cards={cards}
                chat={{ kind: "none" }}
                onChatOpened={() => undefined}
                audience={audience}
              />
            </Suspense>
          </HelpBoundary>
        )}
      </main>
    </LangContext.Provider>
  );
}
