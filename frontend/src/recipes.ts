// Recipe content, one JSON file per language in src/content/recipes/.
// Each language is its own chunk, loaded only when that language is chosen.
// Ids and the order of ingredients are the same in every language (the
// ingredient checklist is the secret door, so positions must not move).

import { useEffect, useState } from "react";

import type { Category, Lang } from "./i18n";

export interface RecipeComment {
  name: string;
  when: string;
  text: string;
}

export interface Recipe {
  id: string;
  category: Category;
  title: string;
  intro: string;
  time: string;
  yields: string;
  difficulty: string;
  ingredients: string[];
  steps: string[];
  comments: RecipeComment[];
}

const LOADERS = import.meta.glob<Recipe[]>("./content/recipes/*.json", { import: "default" });

/** Recipes in a language; Serbian while a translation is not there yet. */
export function loadRecipes(lang: Lang): Promise<Recipe[]> {
  const load = LOADERS[`./content/recipes/${lang}.json`] ?? LOADERS["./content/recipes/sr.json"];
  if (!load) return Promise.reject(new Error("No recipe content found"));
  return load();
}

export function useRecipes(lang: Lang): Recipe[] | null {
  const [state, setState] = useState<{ lang: Lang; recipes: Recipe[] } | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadRecipes(lang).then(
      (recipes) => {
        if (!cancelled) setState({ lang, recipes });
      },
      () => {
        // Content failed to load (offline): keep whatever is on screen.
      },
    );
    return () => {
      cancelled = true;
    };
  }, [lang]);

  // Keep showing the previous language until the new one arrives.
  return state?.recipes ?? null;
}
