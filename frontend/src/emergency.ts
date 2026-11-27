// Emergency numbers shown on the "immediate danger" card, per site language.
//
// ONLY numbers someone has verified belong here. A wrong number in this
// product is dangerous, so a language without a verified number shows the
// card with text only (no call button) until the team fills it in.
// - sr: 192 (police, Serbia), given by the team.
// - hr, sl: 112, the EU emergency number (Croatia and Slovenia are EU members).
// TODO before real use: verify and add bs, cnr, mk, sq; decide what "en" means.

import type { Lang } from "./i18n";

export const EMERGENCY_NUMBER: Readonly<Record<Lang, string | null>> = {
  sr: "192",
  hr: "112",
  sl: "112",
  bs: null,
  cnr: null,
  mk: null,
  sq: null,
  en: null,
};
