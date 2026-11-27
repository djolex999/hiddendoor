import {
  Component,
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
  type SubmitEvent,
} from "react";

import { ApiError, resumeChat, type HelpCard } from "./api";
import { fold, mightBePhrase, phraseFromInput } from "./foodWords";
import type { ChatState } from "./HelpView";
import {
  detectLanguage,
  LANGUAGE_OPTIONS,
  LangContext,
  STRINGS,
  type Lang,
} from "./i18n";
import {
  IDLE_EXIT_MS,
  markActivity,
  panic,
  setHelpOpen,
  softExit,
} from "./panic";
import { Recipe } from "./Recipe";
import { RecipeList } from "./RecipeList";
import { useRecipes, type Recipe as RecipeData } from "./recipes";

// Help (cards, chat, all help text) is its own chunk, fetched only after the
// door opens: the recipe page's main bundle contains nothing about help.
const HelpView = lazy(() =>
  import("./HelpView").then((m) => ({ default: m.HelpView })),
);

/**
 * If the help chunk cannot load (weak signal, or a new deploy changed its
 * name), close help quietly so she sees the recipe, never a white page.
 */
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

/** The recipe in the address bar (?r=pita-sa-jabukama), or null for home. */
function recipeIdFromUrl(): string | null {
  return new URLSearchParams(window.location.search).get("r");
}

function searchRecipes(recipes: RecipeData[], query: string): RecipeData[] {
  const q = fold(query.trim());
  if (!q) return [];
  return recipes.filter((r) => fold(r.title).includes(q));
}

/**
 * Each recipe has its own address, so browser history lists real recipes.
 * Opening help never changes the address or the title.
 */
export function App() {
  const [lang, setLang] = useState<Lang>(detectLanguage);
  const t = STRINGS[lang];
  const recipes = useRecipes(lang);

  const [recipeId, setRecipeId] = useState<string | null>(recipeIdFromUrl);
  const [results, setResults] = useState<RecipeData[] | null>(null);
  const [cards, setCards] = useState<HelpCard[] | null>(null);
  const [chat, setChat] = useState<ChatState>({ kind: "none" });
  const [query, setQuery] = useState("");
  const [searchNote, setSearchNote] = useState("");

  const helpOpen = cards !== null;
  const recipe = recipes?.find((r) => r.id === recipeId) ?? null;

  // Back and Forward move between recipes like on any website.
  useEffect(() => {
    const onPop = () => {
      setRecipeId(recipeIdFromUrl());
      setResults(null);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Title follows the recipe, never the help view.
  useEffect(() => {
    document.title = recipe ? `${recipe.title} | ${t.siteName}` : t.siteName;
    document.documentElement.lang =
      LANGUAGE_OPTIONS.find((o) => o.code === lang)?.html ?? "sr";
  }, [recipe, t.siteName, lang]);

  // Walked away with help open: quietly return to the recipe. Not panic():
  // the chat is kept, so she can come back with her four words.
  useEffect(() => {
    setHelpOpen(helpOpen);
    if (!helpOpen) return;
    let timer = setTimeout(softExit, IDLE_EXIT_MS);
    const reset = () => {
      markActivity();
      clearTimeout(timer);
      timer = setTimeout(softExit, IDLE_EXIT_MS);
    };
    const events = ["pointerdown", "keydown", "scroll", "touchstart"] as const;
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [helpOpen]);

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

  function openRecipe(id: string) {
    window.history.pushState(null, "", `?r=${encodeURIComponent(id)}`);
    setRecipeId(id);
    setResults(null);
    setSearchNote("");
    window.scrollTo({ top: 0 });
  }

  function goHome() {
    if (helpOpen) {
      panic(); // while help is open, the wordmark doubles as the exit
      return;
    }
    window.history.pushState(null, "", window.location.pathname);
    setRecipeId(null);
    setResults(null);
    setSearchNote("");
    window.scrollTo({ top: 0 });
  }

  async function handleSearch(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearchNote("");
    // Clear the box on every submit: a typed phrase must not stay on screen.
    const typed = query.trim();
    setQuery("");
    if (!typed) return;

    // The search box is also the way back into a chat. Only a real phrase is
    // sent, so ordinary searches never use up the server's limit.
    const phrase = phraseFromInput(typed, lang);
    if (phrase) {
      try {
        await resumeChat(phrase.join("-"));
        setCards((prev) => prev ?? []);
        setChat({ kind: "open", resumePhrase: null });
        if (!recipeId && recipes?.[0]) openRecipe(recipes[0].id);
        return;
      } catch (err) {
        if (err instanceof ApiError && err.status === 429) {
          // Busy, not wrong: she should not think she forgot her words.
          setSearchNote(t.searchBusy);
          return;
        }
        if (!(err instanceof ApiError)) {
          setSearchNote(t.searchDown);
          return;
        }
      }
    }

    const found = recipes ? searchRecipes(recipes, typed) : [];
    if (found.length === 1 && found[0]) {
      openRecipe(found[0].id);
      return;
    }
    if (found.length > 1) {
      setResults(found);
      window.scrollTo({ top: 0 });
      return;
    }
    // Never echo anything that could be a phrase, even a mistyped one.
    setSearchNote(mightBePhrase(typed) ? t.noResult : t.noResultFor(typed));
  }

  const langState = useMemo(() => ({ lang, t }), [lang, t]);
  const help = helpOpen ? (
    <HelpBoundary onFail={() => setCards(null)}>
      <Suspense fallback={null}>
        <HelpView cards={cards} chat={chat} onChatOpened={setChat} />
      </Suspense>
    </HelpBoundary>
  ) : null;

  return (
    <LangContext.Provider value={langState}>
      <div className="page">
        <header className="site-head">
          <button type="button" className="wordmark" onClick={goHome}>
            {t.siteName}
          </button>
          <div className="head-tools">
            <form className="search" role="search" onSubmit={handleSearch}>
              <input
                type="text"
                aria-label={t.searchLabel}
                placeholder={t.searchLabel}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
              />
            </form>
            <select
              className="lang-select"
              aria-label={t.languageLabel}
              value={lang}
              onChange={(e) => setLang(e.target.value as Lang)}
            >
              {LANGUAGE_OPTIONS.map((o) => (
                <option key={o.code} value={o.code}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </header>
        {searchNote && <p className="search-note">{searchNote}</p>}

        <main>
          {recipe ? (
            <Recipe recipe={recipe} onUnlocked={setCards} help={help} />
          ) : recipes ? (
            <>
              {help}
              <RecipeList
                recipes={recipes}
                results={results}
                onOpen={openRecipe}
              />
            </>
          ) : null}
        </main>

        <footer className="site-foot">
          {recipe && recipes && (
            <>
              <h2>{t.moreRecipes}</h2>
              <ul>
                {recipes
                  .filter(
                    (r) => r.category === recipe.category && r.id !== recipe.id,
                  )
                  .slice(0, 6)
                  .map((r) => (
                    <li key={r.id}>
                      <button
                        type="button"
                        className="recipe-link"
                        onClick={() => openRecipe(r.id)}
                      >
                        {r.title}
                      </button>
                    </li>
                  ))}
              </ul>
            </>
          )}
          <p className="colophon">{t.colophon}</p>
        </footer>
      </div>
    </LangContext.Provider>
  );
}
