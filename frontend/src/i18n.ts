// Languages and interface text for the cover site.
//
// The chosen language lives in memory only (no storage): on every visit the
// site starts from the browser's language. Translations are drafts for the
// demo and need a native speaker's review before real use.

import { createContext, useContext } from "react";

import type { PhraseLanguage } from "./foodWords";

export type Lang = PhraseLanguage;

export type Category =
  | "dorucak"
  | "supe-i-corbe"
  | "glavna-jela"
  | "salate-i-prilozi"
  | "hleb-i-peciva"
  | "kolaci-i-torte"
  | "zimnica";

export const CATEGORIES: readonly Category[] = [
  "dorucak",
  "supe-i-corbe",
  "glavna-jela",
  "salate-i-prilozi",
  "hleb-i-peciva",
  "kolaci-i-torte",
  "zimnica",
];

export const LANGUAGE_OPTIONS: readonly { code: Lang; label: string; html: string }[] = [
  { code: "sr", label: "Srpski", html: "sr-Latn" },
  { code: "hr", label: "Hrvatski", html: "hr" },
  { code: "bs", label: "Bosanski", html: "bs" },
  { code: "cnr", label: "Crnogorski", html: "cnr" },
  { code: "sl", label: "Slovenščina", html: "sl" },
  { code: "mk", label: "Македонски", html: "mk" },
  { code: "sq", label: "Shqip", html: "sq" },
  { code: "en", label: "English", html: "en" },
];

/** Pick the first browser language we support; Serbian otherwise. */
export function detectLanguage(): Lang {
  for (const tag of navigator.languages) {
    const lower = tag.toLowerCase();
    if (lower === "sr-me" || lower.startsWith("cnr")) return "cnr";
    const base = lower.split("-")[0];
    const match = LANGUAGE_OPTIONS.find((o) => o.code === base);
    if (match) return match.code;
  }
  return "sr";
}

export interface Strings {
  siteName: string;
  searchLabel: string;
  noResultFor: (query: string) => string;
  noResult: string;
  searchBusy: string;
  searchDown: string;
  languageLabel: string;
  homeTitle: string;
  homeIntro: string;
  resultsTitle: string;
  allRecipes: string;
  categories: Record<Category, string>;
  time: string;
  amount: string;
  difficulty: string;
  ingredients: string;
  ingredientsHint: string;
  steps: string;
  comments: string;
  moreRecipes: string;
  colophon: string;
}

export const STRINGS: Record<Lang, Strings> = {
  sr: {
    siteName: "Sveska sa receptima",
    searchLabel: "Pretraži recepte",
    noResultFor: (q) => `Nema recepta za „${q}“.`,
    noResult: "Nema takvog recepta.",
    searchBusy: "Pretraga je trenutno zauzeta. Pokušaj ponovo za minut.",
    searchDown: "Pretraga trenutno ne radi. Pokušaj ponovo.",
    languageLabel: "Jezik",
    homeTitle: "Recepti iz porodične sveske",
    homeIntro: "Domaća jela kakva se kuvaju kod kuće: provereni recepti, tačne mere i saveti iz komentara.",
    resultsTitle: "Rezultati pretrage",
    allRecipes: "Svi recepti",
    categories: {
      dorucak: "Doručak",
      "supe-i-corbe": "Supe i čorbe",
      "glavna-jela": "Glavna jela",
      "salate-i-prilozi": "Salate i prilozi",
      "hleb-i-peciva": "Hleb i peciva",
      "kolaci-i-torte": "Kolači i torte",
      zimnica: "Zimnica",
    },
    time: "Vreme",
    amount: "Količina",
    difficulty: "Težina",
    ingredients: "Sastojci",
    ingredientsHint: "Štikliraj sastojke dok kuvaš.",
    steps: "Priprema",
    comments: "Komentari",
    moreRecipes: "Još recepata",
    colophon: "Recepti iz porodične sveske, prepisani za sve koji vole domaću kuhinju.",
  },
  hr: {
    siteName: "Bilježnica s receptima",
    searchLabel: "Pretraži recepte",
    noResultFor: (q) => `Nema recepta za „${q}“.`,
    noResult: "Nema takvog recepta.",
    searchBusy: "Pretraživanje je trenutno zauzeto. Pokušaj ponovno za minutu.",
    searchDown: "Pretraživanje trenutno ne radi. Pokušaj ponovno.",
    languageLabel: "Jezik",
    homeTitle: "Recepti iz obiteljske bilježnice",
    homeIntro: "Domaća jela kakva se kuhaju kod kuće: provjereni recepti, točne mjere i savjeti iz komentara.",
    resultsTitle: "Rezultati pretraživanja",
    allRecipes: "Svi recepti",
    categories: {
      dorucak: "Doručak",
      "supe-i-corbe": "Juhe i variva",
      "glavna-jela": "Glavna jela",
      "salate-i-prilozi": "Salate i prilozi",
      "hleb-i-peciva": "Kruh i peciva",
      "kolaci-i-torte": "Kolači i torte",
      zimnica: "Zimnica",
    },
    time: "Vrijeme",
    amount: "Količina",
    difficulty: "Težina",
    ingredients: "Sastojci",
    ingredientsHint: "Označi sastojke dok kuhaš.",
    steps: "Priprema",
    comments: "Komentari",
    moreRecipes: "Još recepata",
    colophon: "Recepti iz obiteljske bilježnice, prepisani za sve koji vole domaću kuhinju.",
  },
  bs: {
    siteName: "Sveska s receptima",
    searchLabel: "Pretraži recepte",
    noResultFor: (q) => `Nema recepta za „${q}“.`,
    noResult: "Nema takvog recepta.",
    searchBusy: "Pretraga je trenutno zauzeta. Pokušaj ponovo za minutu.",
    searchDown: "Pretraga trenutno ne radi. Pokušaj ponovo.",
    languageLabel: "Jezik",
    homeTitle: "Recepti iz porodične sveske",
    homeIntro: "Domaća jela kakva se kuhaju kod kuće: provjereni recepti, tačne mjere i savjeti iz komentara.",
    resultsTitle: "Rezultati pretrage",
    allRecipes: "Svi recepti",
    categories: {
      dorucak: "Doručak",
      "supe-i-corbe": "Supe i čorbe",
      "glavna-jela": "Glavna jela",
      "salate-i-prilozi": "Salate i prilozi",
      "hleb-i-peciva": "Hljeb i peciva",
      "kolaci-i-torte": "Kolači i torte",
      zimnica: "Zimnica",
    },
    time: "Vrijeme",
    amount: "Količina",
    difficulty: "Težina",
    ingredients: "Sastojci",
    ingredientsHint: "Označi sastojke dok kuhaš.",
    steps: "Priprema",
    comments: "Komentari",
    moreRecipes: "Još recepata",
    colophon: "Recepti iz porodične sveske, prepisani za sve koji vole domaću kuhinju.",
  },
  cnr: {
    siteName: "Sveska sa receptima",
    searchLabel: "Pretraži recepte",
    noResultFor: (q) => `Nema recepta za „${q}“.`,
    noResult: "Nema takvog recepta.",
    searchBusy: "Pretraga je trenutno zauzeta. Pokušaj ponovo za minut.",
    searchDown: "Pretraga trenutno ne radi. Pokušaj ponovo.",
    languageLabel: "Jezik",
    homeTitle: "Recepti iz porodične sveske",
    homeIntro: "Domaća jela kakva se kuvaju kod kuće: provjereni recepti, tačne mjere i savjeti iz komentara.",
    resultsTitle: "Rezultati pretrage",
    allRecipes: "Svi recepti",
    categories: {
      dorucak: "Doručak",
      "supe-i-corbe": "Supe i čorbe",
      "glavna-jela": "Glavna jela",
      "salate-i-prilozi": "Salate i prilozi",
      "hleb-i-peciva": "Hljeb i peciva",
      "kolaci-i-torte": "Kolači i torte",
      zimnica: "Zimnica",
    },
    time: "Vrijeme",
    amount: "Količina",
    difficulty: "Težina",
    ingredients: "Sastojci",
    ingredientsHint: "Štikliraj sastojke dok kuvaš.",
    steps: "Priprema",
    comments: "Komentari",
    moreRecipes: "Još recepata",
    colophon: "Recepti iz porodične sveske, prepisani za sve koji vole domaću kuhinju.",
  },
  sl: {
    siteName: "Zvezek z recepti",
    searchLabel: "Išči recepte",
    noResultFor: (q) => `Ni recepta za »${q}«.`,
    noResult: "Takega recepta ni.",
    searchBusy: "Iskanje je trenutno zasedeno. Poskusi znova čez minuto.",
    searchDown: "Iskanje trenutno ne deluje. Poskusi znova.",
    languageLabel: "Jezik",
    homeTitle: "Recepti iz družinskega zvezka",
    homeIntro: "Domače jedi, kot jih kuhamo doma: preverjeni recepti, natančne mere in nasveti iz komentarjev.",
    resultsTitle: "Rezultati iskanja",
    allRecipes: "Vsi recepti",
    categories: {
      dorucak: "Zajtrk",
      "supe-i-corbe": "Juhe in enolončnice",
      "glavna-jela": "Glavne jedi",
      "salate-i-prilozi": "Solate in priloge",
      "hleb-i-peciva": "Kruh in pecivo",
      "kolaci-i-torte": "Sladice in torte",
      zimnica: "Ozimnica",
    },
    time: "Čas",
    amount: "Količina",
    difficulty: "Zahtevnost",
    ingredients: "Sestavine",
    ingredientsHint: "Med kuhanjem odkljukaj sestavine.",
    steps: "Priprava",
    comments: "Komentarji",
    moreRecipes: "Še več receptov",
    colophon: "Recepti iz družinskega zvezka, prepisani za vse, ki imajo radi domačo kuhinjo.",
  },
  mk: {
    siteName: "Тетратка со рецепти",
    searchLabel: "Пребарај рецепти",
    noResultFor: (q) => `Нема рецепт за „${q}“.`,
    noResult: "Нема таков рецепт.",
    searchBusy: "Пребарувањето е моментално зафатено. Обиди се повторно за една минута.",
    searchDown: "Пребарувањето моментално не работи. Обиди се повторно.",
    languageLabel: "Јазик",
    homeTitle: "Рецепти од семејната тетратка",
    homeIntro: "Домашни јадења какви што се готват дома: проверени рецепти, точни мерки и совети од коментарите.",
    resultsTitle: "Резултати од пребарувањето",
    allRecipes: "Сите рецепти",
    categories: {
      dorucak: "Појадок",
      "supe-i-corbe": "Супи и чорби",
      "glavna-jela": "Главни јадења",
      "salate-i-prilozi": "Салати и прилози",
      "hleb-i-peciva": "Леб и пецива",
      "kolaci-i-torte": "Колачи и торти",
      zimnica: "Зимница",
    },
    time: "Време",
    amount: "Количина",
    difficulty: "Тежина",
    ingredients: "Состојки",
    ingredientsHint: "Штиклирај ги состојките додека готвиш.",
    steps: "Подготовка",
    comments: "Коментари",
    moreRecipes: "Уште рецепти",
    colophon: "Рецепти од семејната тетратка, препишани за сите што ја сакаат домашната кујна.",
  },
  sq: {
    siteName: "Fletorja e recetave",
    searchLabel: "Kërko receta",
    noResultFor: (q) => `Nuk ka recetë për „${q}“.`,
    noResult: "Nuk ka recetë të tillë.",
    searchBusy: "Kërkimi është i zënë tani. Provo përsëri pas një minute.",
    searchDown: "Kërkimi nuk funksionon tani. Provo përsëri.",
    languageLabel: "Gjuha",
    homeTitle: "Receta nga fletorja e familjes",
    homeIntro: "Gatime shtëpie siç gatuhen në shtëpi: receta të provuara, masa të sakta dhe këshilla nga komentet.",
    resultsTitle: "Rezultatet e kërkimit",
    allRecipes: "Të gjitha recetat",
    categories: {
      dorucak: "Mëngjesi",
      "supe-i-corbe": "Supa dhe çorba",
      "glavna-jela": "Pjata kryesore",
      "salate-i-prilozi": "Sallata dhe garniturë",
      "hleb-i-peciva": "Bukë dhe brumëra",
      "kolaci-i-torte": "Ëmbëlsira dhe torta",
      zimnica: "Turshi dhe konserva",
    },
    time: "Koha",
    amount: "Sasia",
    difficulty: "Vështirësia",
    ingredients: "Përbërësit",
    ingredientsHint: "Shëno përbërësit ndërsa gatuan.",
    steps: "Përgatitja",
    comments: "Komentet",
    moreRecipes: "Më shumë receta",
    colophon: "Receta nga fletorja e familjes, të rishkruara për të gjithë ata që e duan kuzhinën e shtëpisë.",
  },
  en: {
    siteName: "The Recipe Notebook",
    searchLabel: "Search recipes",
    noResultFor: (q) => `No recipe for “${q}”.`,
    noResult: "No such recipe.",
    searchBusy: "Search is busy right now. Try again in a minute.",
    searchDown: "Search is not working right now. Try again.",
    languageLabel: "Language",
    homeTitle: "Recipes from a family notebook",
    homeIntro: "Home cooking the way it is made at home: tested recipes, exact measures and tips from the comments.",
    resultsTitle: "Search results",
    allRecipes: "All recipes",
    categories: {
      dorucak: "Breakfast",
      "supe-i-corbe": "Soups and stews",
      "glavna-jela": "Main dishes",
      "salate-i-prilozi": "Salads and sides",
      "hleb-i-peciva": "Bread and pastries",
      "kolaci-i-torte": "Cakes and desserts",
      zimnica: "Preserves",
    },
    time: "Time",
    amount: "Makes",
    difficulty: "Difficulty",
    ingredients: "Ingredients",
    ingredientsHint: "Tick off ingredients as you cook.",
    steps: "Method",
    comments: "Comments",
    moreRecipes: "More recipes",
    colophon: "Recipes from a family notebook, written out for everyone who loves home cooking.",
  },
};

export interface LangState {
  lang: Lang;
  t: Strings;
}

export const LangContext = createContext<LangState>({ lang: "sr", t: STRINGS.sr });

export function useLang(): LangState {
  return useContext(LangContext);
}
