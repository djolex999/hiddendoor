# Translation review

The site and the counselor app run in 8 languages. Serbian was written by the
team; the other seven were machine-assisted (AI) drafts. None of it has been
reviewed by a native speaker yet. Nothing here changes what she sees; this is
the checklist to finish before a pilot.

Status for every row: **review pending**.

## What to review in each language

| Content | Where |
|---|---|
| Cover texts (site name, search, categories) | `frontend/src/i18n.ts` |
| Help texts (paths, chat, quick replies, helpline, no-counselor notice) | `frontend/src/helpStrings.ts` |
| Help cards | Django admin, seeded by `backend/door/migrations/0002`, `0005`, `0007` |
| Recipes (60 per language) | `frontend/src/content/recipes/<lang>.json` |
| Four-word return list | `backend/chat/phrase_languages.py`, `frontend/src/foodWords.ts` |
| Danger words for urgency | `backend/chat/triage.py`, `DANGER_STEMS` |
| Counselor app | `counselor/src/i18n.ts` |

## Checklist

| Language | Code | Source | Cover | Help texts | Help cards | Recipes | Four words | Danger words | Counselor app |
|---|---|---|---|---|---|---|---|---|---|
| Serbian | sr | team-written | pending | pending | pending | pending | pending | pending | pending |
| Croatian | hr | machine-assisted | pending | pending | pending | pending | pending | pending | pending |
| Bosnian | bs | machine-assisted | pending | pending | pending | pending | pending | pending | pending |
| Montenegrin | cnr | machine-assisted | pending | pending | pending | pending | pending | pending | pending |
| Slovenian | sl | machine-assisted | pending | pending | pending | pending | pending | pending | pending |
| Macedonian | mk | machine-assisted | pending | pending | pending | pending | pending | pending | pending |
| Albanian | sq | machine-assisted | pending | pending | pending | pending | pending | pending | pending |
| English | en | machine-assisted | pending | pending | pending | pending | pending | pending | pending |

## What a reviewer checks

- Natural, plain wording a frightened person understands at a glance.
- Help cards: correct for that country. A phone number in card text only
  with a source (the verified emergency numbers live in
  `frontend/src/emergency.ts`). Cards that still say "[enter number]" are
  hidden until a reviewer fills them in.
- Danger words: real everyday phrasing of "he has a knife", "he is choking
  me", "help" and similar, including slang; no common words that would flag
  ordinary messages.
- Four-word list: every word is a food, unambiguous, and its common
  grammatical forms are accepted.
