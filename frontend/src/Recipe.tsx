import type { ReactNode } from "react";

import type { HelpCard } from "./api";
import type { Recipe as RecipeData } from "./recipes";
import { TapDoor } from "./TapDoor";

interface Props {
  recipe: RecipeData;
  onUnlocked: (cards: HelpCard[]) => void;
  /** Help panel, rendered right under the ingredients once the door opens. */
  help: ReactNode;
}

export function Recipe({ recipe, onUnlocked, help }: Props) {
  return (
    <article className="recipe">
      <header className="recipe-head">
        <h1>{recipe.title}</h1>
        <svg className="ink-underline" viewBox="0 0 300 12" preserveAspectRatio="none" aria-hidden="true">
          <path d="M2 8 C 60 2, 120 11, 180 6 S 270 3, 298 7" />
        </svg>
        <p className="intro">{recipe.intro}</p>
        <dl className="facts">
          <div>
            <dt>Vreme</dt>
            <dd>{recipe.time}</dd>
          </div>
          <div>
            <dt>Količina</dt>
            <dd>{recipe.yields}</dd>
          </div>
          <div>
            <dt>Težina</dt>
            <dd>{recipe.difficulty}</dd>
          </div>
        </dl>
      </header>

      <section className="block">
        <h2>Sastojci</h2>
        <p className="hint">Štikliraj sastojke dok kuvaš.</p>
        {/* key resets the checklist (and pending taps) when the recipe changes */}
        <TapDoor key={recipe.id} items={recipe.ingredients} onUnlocked={onUnlocked} />
      </section>

      {help}

      <section className="block">
        <h2>Priprema</h2>
        <ol className="steps">
          {recipe.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="block">
        <h2>Komentari</h2>
        <ol className="comments">
          {recipe.comments.map((c) => (
            <li key={c.name + c.when} className="comment">
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
