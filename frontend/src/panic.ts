import { endChat } from "./api";

/**
 * Leave help right now: fire the delete (keepalive survives navigation),
 * wipe memory, and reload the cover page WITHOUT adding a history entry.
 */
export function panic(): void {
  endChat().catch(() => {});
  window.location.replace(window.location.pathname);
}

/**
 * Device-trace guards, installed once at startup.
 *
 * - Task switcher: when the tab is hidden, a class on <html> hides every
 *   help element synchronously (no React render), so the phone's app
 *   switcher snapshot shows only a recipe.
 * - Back/forward cache: if the browser restores this page from memory,
 *   reload it so a restored help view never reappears.
 */
export function installTraceGuards(): void {
  const root = document.documentElement;
  const sync = () => root.classList.toggle("concealed", document.hidden);
  document.addEventListener("visibilitychange", sync);
  sync();

  window.addEventListener("pageshow", (event) => {
    if (event.persisted) window.location.replace(window.location.pathname);
  });
}
