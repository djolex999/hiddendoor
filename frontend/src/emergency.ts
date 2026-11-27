// Emergency numbers shown on the "immediate danger" card, per site language.
//
// ONLY numbers verified from a source belong here. A wrong number in this
// product is dangerous. Researched 27 Nov 2026, confirmed by the team:
// - sr: 192, police (mup.gov.rs contacts). 112 is not yet live in Serbia.
// - hr: 112, works via county centres (Croatian Ministry directory 2025-01).
// - sl: 112, police calls are passed on (gov.si/teme/klic-v-sili).
// - bs: 122, police. 112 does not work in Bosnia and Herzegovina
//   (help.unhcr.org/bosniaandherzegovina; RFE).
// - cnr: 112, Montenegro's 112 operations centre (ekip.me, 2023).
// - mk: 112, E-112 since 2021 (mia.mk).
// - sq: 112, works in Kosovo (ame.rks-gov.net) and is listed with police 129
//   in Albania (UN Women). One number for both countries.
// - en: no country, so no number; the card shows text only.
// The language is not the country: a Kosovo or Albania user both read "sq".

import type { Lang } from "./i18n";

export const EMERGENCY_NUMBER: Readonly<Record<Lang, string | null>> = {
  sr: "192",
  hr: "112",
  sl: "112",
  bs: "122",
  cnr: "112",
  mk: "112",
  sq: "112",
  en: null,
};

// Children's helplines for teen covers, per site language. Verified numbers only.
// - sr: 116 111, NADEL national children's line, free, phone answered 24/7
//   (116111.rs/o-nadelu.html; UNICEF Serbia; Child Helpline International).
// TODO before a teen pilot: verify hr, bs, cnr, sl, mk, sq from official
// sources. Until then the card points her to a trusted adult, no number.
export const CHILD_HELPLINE: Readonly<Record<Lang, string | null>> = {
  sr: "116 111",
  hr: null,
  bs: null,
  cnr: null,
  sl: null,
  mk: null,
  sq: null,
  en: null,
};
