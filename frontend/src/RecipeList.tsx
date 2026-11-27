import { CATEGORIES, useLang } from "./i18n";
import type { Recipe } from "./recipes";

interface Props {
  recipes: Recipe[];
  /** Search results instead of the full home page, when set. */
  results: Recipe[] | null;
  onOpen: (id: string) => void;
}

function RecipeLinks({ recipes, onOpen }: { recipes: Recipe[]; onOpen: (id: string) => void }) {
  return (
    <ul className="recipe-links">
      {recipes.map((r) => (
        <li key={r.id}>
          <button type="button" className="recipe-link" onClick={() => onOpen(r.id)}>
            {r.title}
          </button>
          <span className="recipe-meta">{r.time}</span>
        </li>
      ))}
    </ul>
  );
}

/** Home page (all recipes by category) or a list of search results. */
export function RecipeList({ recipes, results, onOpen }: Props) {
  const { t } = useLang();

  if (results) {
    return (
      <section className="block">
        <h1 className="list-title">{t.resultsTitle}</h1>
        <RecipeLinks recipes={results} onOpen={onOpen} />
      </section>
    );
  }

  return (
    <>
      <header className="recipe-head">
        <h1>{t.homeTitle}</h1>
        <svg
          className="ink-underline"
          viewBox="0 0 300 12"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M2 8 C 60 2, 120 11, 180 6 S 270 3, 298 7" />
        </svg>
        <p className="intro">{t.homeIntro}</p>
      </header>
      {CATEGORIES.map((category) => {
        const inCategory = recipes.filter((r) => r.category === category);
        if (inCategory.length === 0) return null;
        return (
          <section key={category} className="block">
            <h2>{t.categories[category]}</h2>
            <RecipeLinks recipes={inCategory} onOpen={onOpen} />
          </section>
        );
      })}
    </>
  );
}
