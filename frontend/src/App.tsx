import { useEffect, useState, type SubmitEvent } from "react";

import { ApiError, resumeChat, type HelpCard } from "./api";
import { HelpView, type ChatState } from "./HelpView";
import { panic } from "./panic";
import { Recipe } from "./Recipe";
import { HOME_RECIPE, RECIPES, type Recipe as RecipeData } from "./recipes";

// A resume phrase is exactly four food words.
const PHRASE_SHAPE = /^\s*[a-zA-Z]+(?:[\s-]+[a-zA-Z]+){3}\s*$/;

function findRecipe(query: string): RecipeData | undefined {
  const q = query.trim().toLocaleLowerCase("sr-Latn");
  if (!q) return undefined;
  return RECIPES.find((r) => r.title.toLocaleLowerCase("sr-Latn").includes(q));
}

/**
 * One page. Opening help never changes the URL or the title, so browser
 * history only ever shows the recipe site.
 */
export function App() {
  const [recipe, setRecipe] = useState<RecipeData>(HOME_RECIPE);
  const [cards, setCards] = useState<HelpCard[] | null>(null);
  const [chat, setChat] = useState<ChatState>({ kind: "none" });
  const [query, setQuery] = useState("");
  const [searchNote, setSearchNote] = useState("");

  const helpOpen = cards !== null;

  // Escape leaves help instantly on a keyboard.
  useEffect(() => {
    if (!helpOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") panic();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [helpOpen]);

  function showRecipe(next: RecipeData) {
    setRecipe(next);
    window.scrollTo({ top: 0 });
  }

  async function handleSearch(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearchNote("");
    // Clear the box on every submit: a typed phrase must not stay on screen.
    const typed = query.trim();
    setQuery("");
    const match = findRecipe(typed);
    if (match) {
      showRecipe(match);
      return;
    }
    // The search box is also the way back into a chat.
    const looksLikePhrase = PHRASE_SHAPE.test(typed);
    if (looksLikePhrase) {
      try {
        await resumeChat(typed);
        setCards((prev) => prev ?? []);
        setChat({ kind: "open", resumePhrase: null });
        return;
      } catch (err) {
        if (!(err instanceof ApiError)) {
          setSearchNote("Pretraga trenutno ne radi. Pokušaj ponovo.");
          return;
        }
      }
    }
    // Never echo a phrase-shaped query back onto the page.
    setSearchNote(looksLikePhrase || !typed ? "Nema takvog recepta." : `Nema recepta za „${typed}“.`);
  }

  return (
    <div className="page">
      <header className="site-head">
        {/* While help is open, the wordmark doubles as the exit. */}
        <button
          type="button"
          className="wordmark"
          onClick={() => (helpOpen ? panic() : showRecipe(HOME_RECIPE))}
        >
          Sveska sa receptima
        </button>
        <form className="search" role="search" onSubmit={handleSearch}>
          <input
            type="text"
            aria-label="Pretraži recepte"
            placeholder="Pretraži recepte"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />
        </form>
      </header>
      {searchNote && <p className="search-note">{searchNote}</p>}

      <main>
        <Recipe
          recipe={recipe}
          onUnlocked={setCards}
          help={
            helpOpen ? <HelpView cards={cards} chat={chat} onChatOpened={setChat} /> : null
          }
        />
      </main>

      <footer className="site-foot">
        <h2>Još recepata</h2>
        <ul>
          {RECIPES.filter((r) => r.id !== recipe.id).map((r) => (
            <li key={r.id}>
              <button type="button" className="recipe-link" onClick={() => showRecipe(r)}>
                {r.title}
              </button>
            </li>
          ))}
        </ul>
        <p className="colophon">Recepti iz porodične sveske, prepisani za sve koji vole domaću kuhinju.</p>
      </footer>
    </div>
  );
}
