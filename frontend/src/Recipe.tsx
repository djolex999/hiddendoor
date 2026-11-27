import { TapDoor } from "./TapDoor";
import type { HelpCard } from "./api";

// A placeholder recipe. Milica owns the real recipes and the design.
const INGREDIENTS = [
  "500 g brašna",
  "4 jabuke",
  "100 g šećera",
  "1 kašičica cimeta",
  "50 ml ulja",
];

export function Recipe({ onUnlocked }: { onUnlocked: (cards: HelpCard[]) => void }) {
  return (
    <article>
      <h1>Pita sa jabukama</h1>
      <p>Brza pita za nedeljno popodne.</p>

      <h2>Sastojci</h2>
      {/* The ingredient lines double as the secret tap targets. */}
      <TapDoor items={INGREDIENTS} onUnlocked={onUnlocked} />

      <h2>Priprema</h2>
      <ol>
        <li>Izrendaj jabuke i pomešaj ih sa šećerom i cimetom.</li>
        <li>Razvij koru, nafiluj i uvij.</li>
        <li>Peci 35 minuta na 200 °C.</li>
      </ol>
    </article>
  );
}
