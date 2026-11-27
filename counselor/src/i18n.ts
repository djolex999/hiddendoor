// Languages and interface text for the counselor app.
//
// The chosen language lives in memory only (no storage): on every visit the
// app starts from the browser's language. Translations need a native
// speaker's review before real use.

import { createContext, useContext } from "react";

export type Lang = "sr" | "hr" | "bs" | "cnr" | "sl" | "mk" | "sq" | "en";

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
  title: string;
  password: string;
  signIn: string;
  signingIn: string;
  wrongPassword: string;
  tooManyAttempts: string;
  cannotReachServer: string;
  languageLabel: string;
  logOut: string;
  selectSession: string;
  sessions: string;
  connectionLost: string;
  noOpenSessions: string;
  justNow: string;
  minutesAgo: (minutes: number) => string;
  status: { waiting: string; active: string; closed: string };
  closeChat: string;
  confirmClose: string;
  chatGone: string;
  reply: string;
  chatClosed: string;
  send: string;
  couldNotSend: string;
  couldNotClose: string;
  urgent: string;
  urgentBanner: string;
  notesTitle: string;
  nicknameLabel: string;
  nicknameHint: string;
  notesLabel: string;
  notesHint: string;
  saveNotes: string;
  notesSaved: string;
  notesSaveFailed: string;
}

export const STRINGS: Record<Lang, Strings> = {
  sr: {
    title: "Skrivena vrata: savetnici",
    password: "Lozinka",
    signIn: "Prijava",
    signingIn: "Prijavljivanje...",
    wrongPassword: "Pogrešna lozinka.",
    tooManyAttempts: "Previše pokušaja. Sačekajte minut.",
    cannotReachServer: "Server nije dostupan.",
    languageLabel: "Jezik",
    logOut: "Odjava",
    selectSession: "Izaberite razgovor.",
    sessions: "Razgovori",
    connectionLost: "Veza je prekinuta, pokušavam ponovo...",
    noOpenSessions: "Nema otvorenih razgovora.",
    justNow: "upravo sada",
    minutesAgo: (n) => `pre ${n} min`,
    status: { waiting: "čeka", active: "aktivan", closed: "zatvoren" },
    closeChat: "Zatvori razgovor",
    confirmClose: "Zatvoriti ovaj razgovor? Ona će ga videti kao završen.",
    chatGone: "Ovaj razgovor više ne postoji. Ona ga je završila ili je istekao.",
    reply: "Odgovor...",
    chatClosed: "Razgovor je zatvoren",
    send: "Pošalji",
    couldNotSend: "Slanje nije uspelo.",
    couldNotClose: "Zatvaranje nije uspelo.",
    urgent: "HITNO",
    urgentBanner: "Hitno: poruka ukazuje na neposrednu opasnost. Odgovorite odmah.",
    notesTitle: "Beleške",
    nicknameLabel: "Nadimak",
    nicknameHint: "Nadimak, ne pravo ime ni mesto. Briše se zajedno sa razgovorom.",
    notesLabel: "Beleške",
    notesHint: "Samo za savetnice. Ona ovo ne vidi. Briše se zajedno sa razgovorom.",
    saveNotes: "Sačuvaj",
    notesSaved: "Sačuvano",
    notesSaveFailed: "Beleške nisu sačuvane.",
  },
  hr: {
    title: "Skrivena vrata: savjetnici",
    password: "Lozinka",
    signIn: "Prijava",
    signingIn: "Prijava u tijeku...",
    wrongPassword: "Pogrešna lozinka.",
    tooManyAttempts: "Previše pokušaja. Pričekajte minutu.",
    cannotReachServer: "Poslužitelj nije dostupan.",
    languageLabel: "Jezik",
    logOut: "Odjava",
    selectSession: "Odaberite razgovor.",
    sessions: "Razgovori",
    connectionLost: "Veza je prekinuta, pokušavam ponovno...",
    noOpenSessions: "Nema otvorenih razgovora.",
    justNow: "upravo sada",
    minutesAgo: (n) => `prije ${n} min`,
    status: { waiting: "čeka", active: "aktivan", closed: "zatvoren" },
    closeChat: "Zatvori razgovor",
    confirmClose: "Zatvoriti ovaj razgovor? Ona će ga vidjeti kao završen.",
    chatGone: "Ovaj razgovor više ne postoji. Ona ga je završila ili je istekao.",
    reply: "Odgovor...",
    chatClosed: "Razgovor je zatvoren",
    send: "Pošalji",
    couldNotSend: "Slanje nije uspjelo.",
    couldNotClose: "Zatvaranje nije uspjelo.",
    urgent: "HITNO",
    urgentBanner: "Hitno: poruka upućuje na neposrednu opasnost. Odgovorite odmah.",
    notesTitle: "Bilješke",
    nicknameLabel: "Nadimak",
    nicknameHint: "Nadimak, ne pravo ime ni mjesto. Briše se zajedno s razgovorom.",
    notesLabel: "Bilješke",
    notesHint: "Samo za savjetnice. Ona ovo ne vidi. Briše se zajedno s razgovorom.",
    saveNotes: "Spremi",
    notesSaved: "Spremljeno",
    notesSaveFailed: "Bilješke nisu spremljene.",
  },
  bs: {
    title: "Skrivena vrata: savjetnici",
    password: "Šifra",
    signIn: "Prijava",
    signingIn: "Prijavljivanje...",
    wrongPassword: "Pogrešna šifra.",
    tooManyAttempts: "Previše pokušaja. Sačekajte minut.",
    cannotReachServer: "Server nije dostupan.",
    languageLabel: "Jezik",
    logOut: "Odjava",
    selectSession: "Odaberite razgovor.",
    sessions: "Razgovori",
    connectionLost: "Veza je prekinuta, pokušavam ponovo...",
    noOpenSessions: "Nema otvorenih razgovora.",
    justNow: "upravo sada",
    minutesAgo: (n) => `prije ${n} min`,
    status: { waiting: "čeka", active: "aktivan", closed: "zatvoren" },
    closeChat: "Zatvori razgovor",
    confirmClose: "Zatvoriti ovaj razgovor? Ona će ga vidjeti kao završen.",
    chatGone: "Ovaj razgovor više ne postoji. Ona ga je završila ili je istekao.",
    reply: "Odgovor...",
    chatClosed: "Razgovor je zatvoren",
    send: "Pošalji",
    couldNotSend: "Slanje nije uspjelo.",
    couldNotClose: "Zatvaranje nije uspjelo.",
    urgent: "HITNO",
    urgentBanner: "Hitno: poruka ukazuje na neposrednu opasnost. Odgovorite odmah.",
    notesTitle: "Bilješke",
    nicknameLabel: "Nadimak",
    nicknameHint: "Nadimak, ne pravo ime ni mjesto. Briše se zajedno sa razgovorom.",
    notesLabel: "Bilješke",
    notesHint: "Samo za savjetnice. Ona ovo ne vidi. Briše se zajedno sa razgovorom.",
    saveNotes: "Sačuvaj",
    notesSaved: "Sačuvano",
    notesSaveFailed: "Bilješke nisu sačuvane.",
  },
  cnr: {
    title: "Skrivena vrata: savjetnici",
    password: "Lozinka",
    signIn: "Prijava",
    signingIn: "Prijavljivanje...",
    wrongPassword: "Pogrešna lozinka.",
    tooManyAttempts: "Previše pokušaja. Sačekajte minut.",
    cannotReachServer: "Server nije dostupan.",
    languageLabel: "Jezik",
    logOut: "Odjava",
    selectSession: "Izaberite razgovor.",
    sessions: "Razgovori",
    connectionLost: "Veza je prekinuta, pokušavam ponovo...",
    noOpenSessions: "Nema otvorenih razgovora.",
    justNow: "upravo sada",
    minutesAgo: (n) => `prije ${n} min`,
    status: { waiting: "čeka", active: "aktivan", closed: "zatvoren" },
    closeChat: "Zatvori razgovor",
    confirmClose: "Zatvoriti ovaj razgovor? Ona će ga vidjeti kao završen.",
    chatGone: "Ovaj razgovor više ne postoji. Ona ga je završila ili je istekao.",
    reply: "Odgovor...",
    chatClosed: "Razgovor je zatvoren",
    send: "Pošalji",
    couldNotSend: "Slanje nije uspjelo.",
    couldNotClose: "Zatvaranje nije uspjelo.",
    urgent: "HITNO",
    urgentBanner: "Hitno: poruka ukazuje na neposrednu opasnost. Odgovorite odmah.",
    notesTitle: "Bilješke",
    nicknameLabel: "Nadimak",
    nicknameHint: "Nadimak, ne pravo ime ni mjesto. Briše se zajedno sa razgovorom.",
    notesLabel: "Bilješke",
    notesHint: "Samo za savjetnice. Ona ovo ne vidi. Briše se zajedno sa razgovorom.",
    saveNotes: "Sačuvaj",
    notesSaved: "Sačuvano",
    notesSaveFailed: "Bilješke nijesu sačuvane.",
  },
  sl: {
    title: "Skrivena vrata: svetovalci",
    password: "Geslo",
    signIn: "Prijava",
    signingIn: "Prijavljanje...",
    wrongPassword: "Napačno geslo.",
    tooManyAttempts: "Preveč poskusov. Počakajte minuto.",
    cannotReachServer: "Strežnik ni dosegljiv.",
    languageLabel: "Jezik",
    logOut: "Odjava",
    selectSession: "Izberite pogovor.",
    sessions: "Pogovori",
    connectionLost: "Povezava je prekinjena, poskušam znova...",
    noOpenSessions: "Ni odprtih pogovorov.",
    justNow: "pravkar",
    minutesAgo: (n) => `pred ${n} min`,
    status: { waiting: "čaka", active: "aktiven", closed: "zaprt" },
    closeChat: "Zapri pogovor",
    confirmClose: "Želite zapreti ta pogovor? Ona ga bo videla kot končanega.",
    chatGone: "Ta pogovor ne obstaja več. Ona ga je končala ali pa je potekel.",
    reply: "Odgovor...",
    chatClosed: "Pogovor je zaprt",
    send: "Pošlji",
    couldNotSend: "Pošiljanje ni uspelo.",
    couldNotClose: "Zapiranje ni uspelo.",
    urgent: "NUJNO",
    urgentBanner: "Nujno: sporočilo kaže na neposredno nevarnost. Odgovorite takoj.",
    notesTitle: "Zapiski",
    nicknameLabel: "Vzdevek",
    nicknameHint: "Vzdevek, ne pravega imena ali kraja. Izbriše se skupaj s pogovorom.",
    notesLabel: "Zapiski",
    notesHint: "Samo za svetovalke. Ona tega ne vidi. Izbriše se skupaj s pogovorom.",
    saveNotes: "Shrani",
    notesSaved: "Shranjeno",
    notesSaveFailed: "Zapiski niso shranjeni.",
  },
  mk: {
    title: "Скриени врата: советници",
    password: "Лозинка",
    signIn: "Најава",
    signingIn: "Се најавувате...",
    wrongPassword: "Погрешна лозинка.",
    tooManyAttempts: "Премногу обиди. Почекајте една минута.",
    cannotReachServer: "Серверот не е достапен.",
    languageLabel: "Јазик",
    logOut: "Одјава",
    selectSession: "Изберете разговор.",
    sessions: "Разговори",
    connectionLost: "Врската е прекината, се обидувам повторно...",
    noOpenSessions: "Нема отворени разговори.",
    justNow: "токму сега",
    minutesAgo: (n) => `пред ${n} мин.`,
    status: { waiting: "чека", active: "активен", closed: "затворен" },
    closeChat: "Затвори го разговорот",
    confirmClose: "Да се затвори овој разговор? Таа ќе го види како завршен.",
    chatGone: "Овој разговор повеќе не постои. Таа го заврши или истече.",
    reply: "Одговор...",
    chatClosed: "Разговорот е затворен",
    send: "Испрати",
    couldNotSend: "Испраќањето не успеа.",
    couldNotClose: "Затворањето не успеа.",
    urgent: "ИТНО",
    urgentBanner: "Итно: пораката укажува на непосредна опасност. Одговорете веднаш.",
    notesTitle: "Белешки",
    nicknameLabel: "Прекар",
    nicknameHint: "Прекар, не вистинско име ниту место. Се брише заедно со разговорот.",
    notesLabel: "Белешки",
    notesHint: "Само за советнички. Таа ова не го гледа. Се брише заедно со разговорот.",
    saveNotes: "Зачувај",
    notesSaved: "Зачувано",
    notesSaveFailed: "Белешките не се зачувани.",
  },
  sq: {
    title: "Dera e fshehur: këshilltarët",
    password: "Fjalëkalimi",
    signIn: "Hyr",
    signingIn: "Duke hyrë...",
    wrongPassword: "Fjalëkalim i gabuar.",
    tooManyAttempts: "Shumë përpjekje. Prisni një minutë.",
    cannotReachServer: "Serveri nuk është i arritshëm.",
    languageLabel: "Gjuha",
    logOut: "Dil",
    selectSession: "Zgjidhni një bisedë.",
    sessions: "Bisedat",
    connectionLost: "Lidhja u ndërpre, po provoj përsëri...",
    noOpenSessions: "Nuk ka biseda të hapura.",
    justNow: "tani",
    minutesAgo: (n) => `${n} min më parë`,
    status: { waiting: "në pritje", active: "aktive", closed: "e mbyllur" },
    closeChat: "Mbyll bisedën",
    confirmClose: "Ta mbyllim këtë bisedë? Ajo do ta shohë si të përfunduar.",
    chatGone: "Kjo bisedë nuk ekziston më. Ajo e ka përfunduar ose ka skaduar.",
    reply: "Përgjigju...",
    chatClosed: "Biseda është mbyllur",
    send: "Dërgo",
    couldNotSend: "Dërgimi nuk u krye.",
    couldNotClose: "Mbyllja nuk u krye.",
    urgent: "URGJENT",
    urgentBanner: "Urgjent: mesazhi tregon rrezik të menjëhershëm. Përgjigjuni menjëherë.",
    notesTitle: "Shënime",
    nicknameLabel: "Pseudonimi",
    nicknameHint: "Pseudonim, jo emri i vërtetë as vendi. Fshihet bashkë me bisedën.",
    notesLabel: "Shënime",
    notesHint: "Vetëm për këshilltaret. Ajo nuk e sheh këtë. Fshihet bashkë me bisedën.",
    saveNotes: "Ruaj",
    notesSaved: "U ruajt",
    notesSaveFailed: "Shënimet nuk u ruajtën.",
  },
  en: {
    title: "Skrivena vrata: counselor",
    password: "Password",
    signIn: "Sign in",
    signingIn: "Signing in...",
    wrongPassword: "Wrong password.",
    tooManyAttempts: "Too many attempts. Wait a minute.",
    cannotReachServer: "Cannot reach the server.",
    languageLabel: "Language",
    logOut: "Log out",
    selectSession: "Select a session.",
    sessions: "Sessions",
    connectionLost: "Connection lost, retrying...",
    noOpenSessions: "No open sessions.",
    justNow: "just now",
    minutesAgo: (n) => `${n} min ago`,
    status: { waiting: "waiting", active: "active", closed: "closed" },
    closeChat: "Close chat",
    confirmClose: "Close this chat? She will see it as ended.",
    chatGone: "This chat no longer exists. She ended it or it expired.",
    reply: "Reply...",
    chatClosed: "Chat closed",
    send: "Send",
    couldNotSend: "Could not send.",
    couldNotClose: "Could not close.",
    urgent: "URGENT",
    urgentBanner: "Urgent: this message suggests immediate danger. Reply now.",
    notesTitle: "Notes",
    nicknameLabel: "Nickname",
    nicknameHint: "Use a nickname, never her real name or place. It is deleted with the chat and must not identify her.",
    notesLabel: "Notes",
    notesHint: "For counselors only. She cannot see this. Deleted with the chat.",
    saveNotes: "Save",
    notesSaved: "Saved",
    notesSaveFailed: "Notes were not saved.",
  },
};

export interface LangState {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Strings;
}

export const LangContext = createContext<LangState>({
  lang: "sr",
  setLang: () => undefined,
  t: STRINGS.sr,
});

export function useLang(): LangState {
  return useContext(LangContext);
}
