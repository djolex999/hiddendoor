import { useEffect, useRef } from "react";

import { unlock, type HelpCard } from "./api";

// After the last tap, wait this long, then send what was collected.
const IDLE_MS = 1500;
// Fewer taps than this is just someone reading the recipe; do not send.
const MIN_TAPS = 3;

interface Props {
  items: string[];
  onUnlocked: (cards: HelpCard[]) => void;
}

/**
 * Each item is a tap target numbered from 1. Taps are collected and sent to
 * the server after a pause. The right sequence is known ONLY to the server,
 * never to this bundle. A wrong sequence does nothing visible.
 */
export function TapDoor({ items, onUnlocked }: Props) {
  const taps = useRef<number[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  function flush() {
    const sequence = taps.current;
    taps.current = [];
    if (sequence.length < MIN_TAPS) return;
    unlock(sequence)
      .then((cards) => {
        if (cards) onUnlocked(cards);
      })
      .catch(() => {
        // Rate limited or offline: stay silent, the page is just a recipe.
      });
  }

  function handleTap(index: number) {
    taps.current.push(index);
    clearTimeout(timer.current);
    timer.current = setTimeout(flush, IDLE_MS);
  }

  return (
    <ul>
      {items.map((item, i) => (
        // A plain list item that reacts to taps; deliberately not a button,
        // so it looks like ordinary recipe text.
        <li key={item} onClick={() => handleTap(i + 1)}>
          {item}
        </li>
      ))}
    </ul>
  );
}
