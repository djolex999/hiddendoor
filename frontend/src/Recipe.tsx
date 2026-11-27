import type { ReactNode } from "react";

import type { HelpCard } from "./api";
import { useLang } from "./i18n";
import type { Recipe as RecipeData } from "./recipes";
import { TapDoor } from "./TapDoor";

interface Props {
  recipe: RecipeData;
  onUnlocked: (cards: HelpCard[]) => void;
  /** Help panel, rendered right under the ingredients once the door opens. */
  help: ReactNode;
}

export function Recipe({ recipe, onUnlocked, help }: Props) {
  const { t } = useLang();
  return (
    <article className="recipe">
      <header className="recipe-head">
        <p className="crumb">{t.categories[recipe.category]}</p>
        <h1>{recipe.title}</h1>
        <svg
          className="ink-underline"
          viewBox="0 0 300 12"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M2 8 C 60 2, 120 11, 180 6 S 270 3, 298 7" />
        </svg>
        <p className="intro">{recipe.intro}</p>
        <dl className="facts">
          <div>
            <dt>{t.time}</dt>
            <dd>{recipe.time}</dd>
          </div>
          <div>
            <dt>{t.amount}</dt>
            <dd>{recipe.yields}</dd>
          </div>
          <div>
            <dt>{t.difficulty}</dt>
            <dd>{recipe.difficulty}</dd>
          </div>
        </dl>
      </header>

      <section className="block">
        <h2>{t.ingredients}</h2>
        <p className="hint">{t.ingredientsHint}</p>
        {/* key resets the checklist (and pending taps) when the recipe changes */}
        <TapDoor
          key={recipe.id}
          items={recipe.ingredients}
          onUnlocked={onUnlocked}
          audience="adult"
        />
      </section>

      {help}

      <section className="block">
        <h2>{t.steps}</h2>
        <ol className="steps">
          {recipe.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="block">
        <h2>{t.comments}</h2>
        <ol className="comments">
          {recipe.comments.map((c) => (
            <li key={c.name + c.when + c.text} className="comment">
              <p className="comment-head">
                <span className="comment-name">{c.name}</span>
                <span className="comment-when">{c.when}</span>
              </p>
              <p className="comment-text">{c.text}</p>
            </li>
          ))}
        </ol>
      </section>
    </article>
  );
}
