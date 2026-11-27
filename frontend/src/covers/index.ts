// Covers: the ordinary website the door hides behind. The door (unlock,
// help, chat, trace guards) is the product; a cover is a swappable skin.
// See COVERS.md for how a partner adds one.
//
// Exactly one cover is built into a site, chosen at build time with
// VITE_COVER. Recipes is the default and the only finished cover.

import type { Audience } from "../helpLogic";

export type CoverId = "recipes" | "homework";

export interface CoverConfig {
  id: CoverId;
  /** Who the cover is for. Decides the help paths (helpLogic.helpLayout). */
  audience: Audience;
  /** Where the cover's ordinary content comes from. */
  content: string;
  /** The everyday list whose taps form the secret sequence. */
  door: string;
  /** Whether the cover's search box takes the four words that resume a chat. */
  fourWordReturn: boolean;
  /** Where the look lives. */
  theme: string;
  /** False until the cover has real content and has been reviewed. */
  finished: boolean;
}

export const COVERS: Readonly<Record<CoverId, CoverConfig>> = {
  recipes: {
    id: "recipes",
    audience: "adult",
    content: "src/content/recipes/<lang>.json, loaded by src/recipes.ts",
    door: "the ingredient checklist of any recipe (src/TapDoor.tsx)",
    fourWordReturn: true,
    theme: "src/styles.css",
    finished: true,
  },
  homework: {
    id: "homework",
    audience: "teen",
    content: "none yet: a stub that proves the door mounts on another cover",
    door: "the task checklist (src/covers/homework/HomeworkCover.tsx)",
    // Teens get a children's helpline, not a chat, so there is nothing to resume.
    fourWordReturn: false,
    theme: "src/covers/homework/homework.css",
    finished: false,
  },
};
