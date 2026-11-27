import { useState } from "react";

import { endChat, type HelpCard } from "./api";
import { HelpView } from "./HelpView";
import { Recipe } from "./Recipe";

/**
 * One page, two views. Opening help never changes the URL or the title, so
 * browser history only ever shows the recipe.
 */
export function App() {
  const [cards, setCards] = useState<HelpCard[] | null>(null);

  if (!cards) return <Recipe onUnlocked={setCards} />;

  return (
    <>
      <PanicButton />
      <HelpView cards={cards} />
    </>
  );
}

function panic() {
  // Fire the delete (keepalive survives the navigation), wipe memory, then
  // reload the recipe WITHOUT adding a history entry. All React state and
  // every in-memory credential is gone after the reload.
  endChat().catch(() => {});
  window.location.replace(window.location.pathname);
}

function PanicButton() {
  return (
    <button onClick={panic} aria-label="Izlaz">
      Izlaz
    </button>
  );
}
