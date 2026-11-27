# Covers

Hidden Door has two parts:

- **The door** is the product: the secret tap sequence, the help paths, the
  counselor chat, the four-word return and the trace guards (nothing on the
  phone, nothing in the history).
- **The cover** is the ordinary website the door hides behind. It is a skin
  and can be swapped.

Recipes is the default cover and the only finished one. A teen "homework
helper" cover exists as a stub only: it proves the door mounts on another
site and leads to a children's helpline. It has no real content and must not
be linked publicly.

## What a cover defines

Each cover is listed in `frontend/src/covers/index.ts`:

| Field | Recipes | Homework (stub) |
|---|---|---|
| `audience` | adult | teen |
| `content` | `src/content/recipes/<lang>.json` | none yet |
| `door` | ingredient checklist of any recipe | task checklist |
| `fourWordReturn` | yes, through the recipe search | no (teens get a helpline, not a chat) |
| `theme` | `src/styles.css` | `src/covers/homework/homework.css` |
| `finished` | yes | no |

One cover is built into a site, chosen at build time with `VITE_COVER`
(`recipes` by default, `homework` for the stub). The page a visitor of the
recipe site loads contains nothing from other covers. The help code, loaded
only after the door opens, includes the teen helpline card.

## How a partner adds a cover

1. Pick something people really use, with a list they tick or tap every day:
   a recipe's ingredients, a homework checklist, a knitting pattern's rows,
   a plant's watering days. The cover has to be believable on its own: real
   content, real search, nothing that looks like a help site.
2. Add `frontend/src/covers/<name>/` with a root component and its CSS.
3. Render the list with `TapDoor`. The secret sequence is the positions of
   the items tapped, counted from 1, checked only on the server
   (`DOOR_SEQUENCE`). Keep item positions the same in every language.
4. Pass the cover's `audience` to `TapDoor` and `HelpView` (both require it,
   so a cover that forgets it does not compile).
   - `adult`: the three paths, the emergency number and the counselor chat.
   - `teen`: the path cards with a children's helpline instead of the chat,
     and none of the general cards written for adult women.
   - The cover declares its audience when the door opens. The server signs
     it into the unlock token and refuses a chat for any unlock that declared
     teen. For a pilot, the server should decide the audience itself from
     the site's address instead of trusting the cover.
5. If the cover has a search box, use it for the four-word return (see
   `App.tsx`, `handleSearch`). If it has none, there is no return path, which
   is only acceptable when there is no chat (teen covers).
6. Register the cover in `covers/index.ts` and in the switch in `main.tsx`.
7. Add the trace guards (close help after a minute away or ten idle minutes,
   Escape exits). They live in the cover's root today (`App.tsx`,
   `HomeworkCover.tsx`); a shared hook is the next clean-up.
8. Keep the rules every cover inherits:
   - help never changes the address or the tab title;
   - nothing goes into browser storage or cookies (ESLint blocks it);
   - help is loaded only after the door opens;
   - every string in all site languages.

## Option: the door inside an existing website

A partner that already runs an ordinary website (a school portal, a local
news site, a pharmacy's page) could host the door instead of a new cover. The
idea: one script tag turns an existing list on that site into the door and
mounts help in place, on the same address.

This is not built. Before it could be, a deployment would need:

- the partner's site served over HTTPS with a content security policy that
  allows our script and our API, and no third-party analytics on the page;
- the same trace rules as above, checked on that site;
- an agreement on who runs the counselors and the server.
