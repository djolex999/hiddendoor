import { useEffect, useRef, useState } from "react";

import { unlock, type HelpCard } from "./api";
import { useLang } from "./i18n";

// After the last tap, wait this long, then send what was collected.
const IDLE_MS = 1500;
// Fewer taps than this is just someone cooking; do not send.
const MIN_TAPS = 3;

interface Props {
  items: string[];
  onUnlocked: (cards: HelpCard[]) => void;
}

/**
 * The ingredient checklist IS the door. Ticking ingredients off while cooking
 * is ordinary recipe-site behaviour, so the secret taps look like nothing.
 * Taps are numbered from 1 and sent after a pause; the right sequence is
 * known only to the server. A wrong sequence does nothing visible.
 */
export function TapDoor({ items, onUnlocked }: Props) {
  const { lang } = useLang();
  const [checked, setChecked] = useState<ReadonlySet<number>>(new Set());
  const taps = useRef<number[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  function flush() {
    const sequence = taps.current;
    taps.current = [];
    if (sequence.length < MIN_TAPS) return;
    unlock(sequence, lang)
      .then((cards) => {
        if (cards) onUnlocked(cards);
      })
      .catch(() => {
        // Rate limited or offline: stay silent, the page is just a recipe.
      });
  }

  function handleTap(index: number) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
    taps.current.push(index);
    clearTimeout(timer.current);
    timer.current = setTimeout(flush, IDLE_MS);
  }

  return (
    <ul className="ingredients">
      {items.map((item, i) => {
        const n = i + 1;
        const isChecked = checked.has(n);
        return (
          <li key={item}>
            <button
              type="button"
              role="checkbox"
              aria-checked={isChecked}
              className="ingredient"
              onClick={() => handleTap(n)}
            >
              <span className="tick" aria-hidden="true" />
              <span className="ingredient-text">{item}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
