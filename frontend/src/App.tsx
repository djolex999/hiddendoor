import { useEffect, useState, type SubmitEvent } from "react";

import { ApiError, resumeChat, type HelpCard } from "./api";
import { FOOD_FORMS } from "./foodWords";
import { HelpView, type ChatState } from "./HelpView";
import { panic } from "./panic";
import { Recipe } from "./Recipe";
import { HOME_RECIPE, RECIPES, type Recipe as RecipeData } from "./recipes";

function wordsOf(query: string): string[] {
  return query.toLocaleLowerCase("sr-Latn").split(/[^a-zčćđšž]+/).filter(Boolean);
}

/**
 * A real resume phrase: exactly four words, each a list word or one of its
 * case forms ("jaja" for "jaje"). Returns the list words, or null.
 */
function resumeWords(words: string[]): string[] | null {
  if (words.length !== 4) return null;
  const canonical = words
    .map((w) => FOOD_FORMS.get(w))
    .filter((w): w is string => w !== undefined);
  return canonical.length === 4 ? canonical : null;
}

/**
 * Could this be a phrase, even a mistyped or partial one? Then it must never
 * be written back onto the page.
 */
function mightBePhrase(words: string[]): boolean {
  return words.length >= 3 || words.some((w) => FOOD_FORMS.has(w));
}

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

  // A search note leaves the screen when the tab is hidden (app switcher).
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) setSearchNote("");
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

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
    // The search box is also the way back into a chat. Only a real phrase is
    // sent, so ordinary four-word searches never use up the server's limit.
    const words = wordsOf(typed);
    const phrase = resumeWords(words);
    if (phrase) {
      try {
        await resumeChat(phrase.join("-"));
        setCards((prev) => prev ?? []);
        setChat({ kind: "open", resumePhrase: null });
        return;
      } catch (err) {
        if (err instanceof ApiError && err.status === 429) {
          // Busy, not wrong: she should not think she forgot her words.
          setSearchNote("Pretraga je trenutno zauzeta. Pokušaj ponovo za minut.");
          return;
        }
        if (!(err instanceof ApiError)) {
          setSearchNote("Pretraga trenutno ne radi. Pokušaj ponovo.");
          return;
        }
      }
    }
    // Never echo anything that could be a phrase, even a mistyped one.
    setSearchNote(
      !typed || mightBePhrase(words) ? "Nema takvog recepta." : `Nema recepta za „${typed}“.`,
    );
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
