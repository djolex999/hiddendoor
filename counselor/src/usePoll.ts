import { useEffect, useRef } from "react";

/**
 * Run `task` now and then every `intervalMs` until unmount or until `key`
 * changes. Uses setTimeout after each run finishes, so a slow request never
 * overlaps the next one.
 */
export function usePoll(task: () => Promise<void>, intervalMs: number, key: unknown): void {
  const taskRef = useRef(task);
  useEffect(() => {
    taskRef.current = task;
  });

  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const tick = async () => {
      try {
        await taskRef.current();
      } catch {
        // Network blips are expected while polling; the next tick retries.
      }
      if (!stopped) timer = setTimeout(tick, intervalMs);
    };
    void tick();

    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [intervalMs, key]);
}
