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
  helpTitle: string;
  hideTips: string;
  askPrompt: string;
  writeToUs: string;
  startExpired: string;
  startFailed: string;
  shoppingTitle: string;
  shoppingHint: string;
  you: string;
  counselorName: string;
  leaveComment: string;
  publish: string;
  waiting: string;
  closed: string;
  gone: string;
  sendFailed: string;
  emergencyTitle: string;
  emergencyText: string;
  emergencyCall: (number: string) => string;
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
    helpTitle: "Saveti iz sveske",
    hideTips: "Sakrij savete",
    askPrompt: "Imaš pitanje? Piši nam ovde, odgovara prava osoba.",
    writeToUs: "Napiši nam",
    startExpired: "Prošlo je previše vremena. Otvori savete ponovo.",
    startFailed: "Nije uspelo. Pokušaj ponovo.",
    shoppingTitle: "Lista za kupovinu",
    shoppingHint: "Ove četiri reči upisane u pretragu vraćaju te na ovaj razgovor.",
    you: "Ti",
    counselorName: "Vesna",
    leaveComment: "Ostavi komentar",
    publish: "Objavi komentar",
    waiting: "Komentar je primljen. Odgovor stiže uskoro.",
    closed: "Komentari su zatvoreni.",
    gone: "Ovaj razgovor više ne postoji.",
    sendFailed: "Komentar nije poslat. Pokušaj ponovo.",
    emergencyTitle: "Ako si u neposrednoj opasnosti",
    emergencyText: "Ne čekaj odgovor: pozovi policiju odmah.",
    emergencyCall: (n) => `Pozovi ${n}`,
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
    helpTitle: "Savjeti iz bilježnice",
    hideTips: "Sakrij savjete",
    askPrompt: "Imaš pitanje? Piši nam ovdje, odgovara prava osoba.",
    writeToUs: "Piši nam",
    startExpired: "Prošlo je previše vremena. Ponovno otvori savjete.",
    startFailed: "Nije uspjelo. Pokušaj ponovno.",
    shoppingTitle: "Popis za kupnju",
    shoppingHint: "Ove četiri riječi upisane u tražilicu vraćaju te u ovaj razgovor.",
    you: "Ti",
    counselorName: "Vesna",
    leaveComment: "Ostavi komentar",
    publish: "Objavi komentar",
    waiting: "Komentar je primljen. Odgovor stiže uskoro.",
    closed: "Komentari su zatvoreni.",
    gone: "Ovaj razgovor više ne postoji.",
    sendFailed: "Komentar nije poslan. Pokušaj ponovno.",
    emergencyTitle: "Ako si u neposrednoj opasnosti",
    emergencyText: "Ne čekaj odgovor: odmah nazovi policiju.",
    emergencyCall: (n) => `Nazovi ${n}`,
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
    helpTitle: "Savjeti iz sveske",
    hideTips: "Sakrij savjete",
    askPrompt: "Imaš pitanje? Piši nam ovdje, odgovara prava osoba.",
    writeToUs: "Piši nam",
    startExpired: "Prošlo je previše vremena. Ponovo otvori savjete.",
    startFailed: "Nije uspjelo. Pokušaj ponovo.",
    shoppingTitle: "Lista za kupovinu",
    shoppingHint: "Ove četiri riječi upisane u pretragu vraćaju te u ovaj razgovor.",
    you: "Ti",
    counselorName: "Vesna",
    leaveComment: "Ostavi komentar",
    publish: "Objavi komentar",
    waiting: "Komentar je primljen. Odgovor stiže uskoro.",
    closed: "Komentari su zatvoreni.",
    gone: "Ovaj razgovor više ne postoji.",
    sendFailed: "Komentar nije poslan. Pokušaj ponovo.",
    emergencyTitle: "Ako si u neposrednoj opasnosti",
    emergencyText: "Ne čekaj odgovor: odmah pozovi policiju.",
    emergencyCall: (n) => `Pozovi ${n}`,
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
    helpTitle: "Savjeti iz sveske",
    hideTips: "Sakrij savjete",
    askPrompt: "Imaš pitanje? Piši nam ovdje, odgovara prava osoba.",
    writeToUs: "Piši nam",
    startExpired: "Prošlo je previše vremena. Otvori savjete ponovo.",
    startFailed: "Nije uspjelo. Pokušaj ponovo.",
    shoppingTitle: "Lista za kupovinu",
    shoppingHint: "Ove četiri riječi upisane u pretragu vraćaju te na ovaj razgovor.",
    you: "Ti",
    counselorName: "Vesna",
    leaveComment: "Ostavi komentar",
    publish: "Objavi komentar",
    waiting: "Komentar je primljen. Odgovor stiže uskoro.",
    closed: "Komentari su zatvoreni.",
    gone: "Ovaj razgovor više ne postoji.",
    sendFailed: "Komentar nije poslat. Pokušaj ponovo.",
    emergencyTitle: "Ako si u neposrednoj opasnosti",
    emergencyText: "Ne čekaj odgovor: odmah pozovi policiju.",
    emergencyCall: (n) => `Pozovi ${n}`,
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
    helpTitle: "Nasveti iz zvezka",
    hideTips: "Skrij nasvete",
    askPrompt: "Imaš vprašanje? Piši nam tukaj, odgovori resnična oseba.",
    writeToUs: "Piši nam",
    startExpired: "Preteklo je preveč časa. Ponovno odpri nasvete.",
    startFailed: "Ni uspelo. Poskusi znova.",
    shoppingTitle: "Nakupovalni seznam",
    shoppingHint: "Te štiri besede, vpisane v iskalnik, te vrnejo v ta pogovor.",
    you: "Ti",
    counselorName: "Vesna",
    leaveComment: "Napiši komentar",
    publish: "Objavi komentar",
    waiting: "Komentar je prejet. Odgovor prihaja kmalu.",
    closed: "Komentarji so zaprti.",
    gone: "Ta pogovor ne obstaja več.",
    sendFailed: "Komentar ni bil poslan. Poskusi znova.",
    emergencyTitle: "Če si v neposredni nevarnosti",
    emergencyText: "Ne čakaj na odgovor: takoj pokliči policijo.",
    emergencyCall: (n) => `Pokliči ${n}`,
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
    helpTitle: "Совети од тетратката",
    hideTips: "Скриј ги советите",
    askPrompt: "Имаш прашање? Пиши ни овде, одговара вистинска личност.",
    writeToUs: "Пиши ни",
    startExpired: "Помина премногу време. Отвори ги советите повторно.",
    startFailed: "Не успеа. Обиди се повторно.",
    shoppingTitle: "Листа за купување",
    shoppingHint: "Овие четири зборови внесени во пребарувањето те враќаат во овој разговор.",
    you: "Ти",
    counselorName: "Весна",
    leaveComment: "Остави коментар",
    publish: "Објави коментар",
    waiting: "Коментарот е примен. Одговорот наскоро стигнува.",
    closed: "Коментарите се затворени.",
    gone: "Овој разговор повеќе не постои.",
    sendFailed: "Коментарот не е испратен. Обиди се повторно.",
    emergencyTitle: "Ако си во непосредна опасност",
    emergencyText: "Не чекај одговор: веднаш јави се во полиција.",
    emergencyCall: (n) => `Јави се на ${n}`,
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
    helpTitle: "Këshilla nga fletorja",
    hideTips: "Fshih këshillat",
    askPrompt: "Ke një pyetje? Na shkruaj këtu, përgjigjet një person i vërtetë.",
    writeToUs: "Na shkruaj",
    startExpired: "Ka kaluar shumë kohë. Hap përsëri këshillat.",
    startFailed: "Nuk funksionoi. Provo përsëri.",
    shoppingTitle: "Lista e blerjeve",
    shoppingHint: "Këto katër fjalë, të shkruara në kërkim, të kthejnë te kjo bisedë.",
    you: "Ti",
    counselorName: "Vesna",
    leaveComment: "Lër një koment",
    publish: "Publiko komentin",
    waiting: "Komenti u mor. Përgjigjja vjen së shpejti.",
    closed: "Komentet janë mbyllur.",
    gone: "Kjo bisedë nuk ekziston më.",
    sendFailed: "Komenti nuk u dërgua. Provo përsëri.",
    emergencyTitle: "Nëse je në rrezik të menjëhershëm",
    emergencyText: "Mos prit përgjigje: telefono policinë menjëherë.",
    emergencyCall: (n) => `Telefono ${n}`,
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
    helpTitle: "Tips from the notebook",
    hideTips: "Hide tips",
    askPrompt: "Have a question? Write to us here; a real person answers.",
    writeToUs: "Write to us",
    startExpired: "Too much time has passed. Open the tips again.",
    startFailed: "That didn't work. Try again.",
    shoppingTitle: "Shopping list",
    shoppingHint: "Type these four words into the search to come back to this conversation.",
    you: "You",
    counselorName: "Vesna",
    leaveComment: "Leave a comment",
    publish: "Post comment",
    waiting: "Comment received. A reply is on its way.",
    closed: "Comments are closed.",
    gone: "This conversation no longer exists.",
    sendFailed: "Comment not sent. Try again.",
    emergencyTitle: "If you are in immediate danger",
    emergencyText: "Don't wait for a reply: call the police now.",
    emergencyCall: (n) => `Call ${n}`,
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
