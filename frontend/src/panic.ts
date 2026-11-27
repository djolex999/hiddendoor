import { endChat, wipe } from "./api";

/**
 * Leave help right now: fire the delete (keepalive survives navigation),
 * wipe memory, and reload the cover page WITHOUT adding a history entry.
 */
export function panic(): void {
  endChat().catch(() => {});
  window.location.replace(window.location.pathname);
}

// With help open and no activity for this long, go back to the plain recipe.
// The chat stays on the server; her four words bring it back.
export const IDLE_EXIT_MS = 10 * 60 * 1000;
// Help open, phone locked or another app opened for longer than this: on
// return, show the recipe instead of help. Phones pause timers while asleep,
// so this compares timestamps instead of trusting a timer.
const AWAY_EXIT_MS = 60 * 1000;

let helpOpen = false;
let hiddenAt = 0;
let lastActivity = Date.now();

export function setHelpOpen(open: boolean): void {
  helpOpen = open;
  lastActivity = Date.now();
}

export function markActivity(): void {
  lastActivity = Date.now();
}

/** Back to the recipe without ending the chat (her four words resume it). */
export function softExit(): void {
  wipe();
  window.location.replace(window.location.pathname);
}

/**
 * Device-trace guards, installed once at startup.
 *
 * - Task switcher: when the tab is hidden, a class on <html> hides every
 *   help element synchronously (no React render), so the phone's app
 *   switcher snapshot shows only a recipe.
 * - Coming back: if help was open and she was away over a minute (or idle
 *   past the limit), the recipe reloads instead of help reappearing.
 * - Back/forward cache: if the browser restores this page from memory,
 *   reload it so a restored help view never reappears.
 */
export function installTraceGuards(): void {
  const root = document.documentElement;
  const sync = () => {
    if (document.hidden) {
      hiddenAt = Date.now();
      root.classList.add("concealed");
      return;
    }
    const now = Date.now();
    const away = hiddenAt > 0 && now - hiddenAt > AWAY_EXIT_MS;
    if (helpOpen && (away || now - lastActivity > IDLE_EXIT_MS)) {
      softExit(); // stays concealed until the recipe reloads
      return;
    }
    root.classList.remove("concealed");
  };
  document.addEventListener("visibilitychange", sync);
  sync();

  window.addEventListener("pageshow", (event) => {
    if (event.persisted) window.location.replace(window.location.pathname);
  });
}
