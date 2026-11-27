// Cover content. Real-looking Serbian home recipes; the ingredient lists
// double as the secret tap targets (numbered from 1 in list order).

export interface RecipeComment {
  name: string;
  when: string;
  text: string;
}

export interface Recipe {
  id: string;
  title: string;
  intro: string;
  time: string;
  yields: string;
  difficulty: string;
  ingredients: string[];
  steps: string[];
  comments: RecipeComment[];
}

/** The recipe the site opens on (and returns to after the exit). */
export const HOME_RECIPE: Recipe = {
  id: "pita-sa-jabukama",
  title: "Pita sa jabukama",
  intro: "Kora, jabuke i cimet. Pita koja miriše na nedeljno popodne kod bake.",
  time: "75 min",
  yields: "8 parčadi",
  difficulty: "lako",
  ingredients: [
    "500 g kora za pitu",
    "1 kg kiselih jabuka",
    "150 g šećera",
    "1 kašičica cimeta",
    "100 ml ulja",
    "50 g mlevenih oraha",
  ],
  steps: [
    "Jabuke oljušti, izrendaj na krupno rende i dobro ih oceđi.",
    "Pomešaj jabuke sa šećerom, cimetom i orasima.",
    "Svaku koru pokapaj uljem, rasporedi fil i uvij u rolat.",
    "Rolate složi u nauljen pleh i premaži ih uljem.",
    "Peci 40 minuta na 200 °C, dok kora ne porumeni.",
    "Prohlađenu pitu pospi šećerom u prahu.",
  ],
  comments: [
    { name: "Jelena", when: "pre 2 dana", text: "Dodala sam malo rendane limunove kore. Nestala je za pola sata." },
    { name: "Marko", when: "pre nedelju dana", text: "Moja baka stavlja i kašiku griza da upije sok. Preporuka." },
    { name: "Ana", when: "pre 3 nedelje", text: "U rerni sa ventilatorom je gotova brže, gledajte posle 30 minuta." },
  ],
};

export const RECIPES: Recipe[] = [
  HOME_RECIPE,
  {
    id: "proja-sa-sirom",
    title: "Proja sa sirom",
    intro: "Kukuruzna proja kakva se pravi u Šumadiji: mekana unutra, hrskava po ivicama.",
    time: "45 min",
    yields: "6 parčadi",
    difficulty: "lako",
    ingredients: [
      "300 g kukuruznog brašna",
      "3 jajeta",
      "200 ml jogurta",
      "100 ml ulja",
      "200 g belog sira",
      "1 kesica praška za pecivo",
      "1 kašičica soli",
    ],
    steps: [
      "Umuti jaja sa jogurtom i uljem.",
      "Dodaj brašno, so i prašak za pecivo, pa promešaj da nema grudvica.",
      "Umešaj izmrvljen sir.",
      "Izlij smesu u nauljen pleh i poravnaj.",
      "Peci 30 do 35 minuta na 200 °C.",
    ],
    comments: [
      { name: "Dragana", when: "juče", text: "Sa kajmakom umesto sira je još bolja." },
      { name: "Nikola", when: "pre 5 dana", text: "Pola brašna sam zamenio heljdinim, odlično je ispalo." },
    ],
  },
  {
    id: "prebranac",
    title: "Prebranac",
    intro: "Pečeni pasulj sa puno crnog luka. Najbolji je sutradan, podgrejan.",
    time: "3 sata",
    yields: "6 porcija",
    difficulty: "srednje",
    ingredients: [
      "500 g belog pasulja",
      "1 kg crnog luka",
      "2 kašike aleve paprike",
      "150 ml ulja",
      "3 lovorova lista",
      "so i biber",
    ],
    steps: [
      "Pasulj potopi u hladnu vodu i ostavi preko noći.",
      "Skuvaj ga sa lovorovim listom dok ne omekša, pa oceđi.",
      "Luk iseci na rebarca i dinstaj na ulju dok ne postane staklast.",
      "Dodaj alevu papriku, so i biber.",
      "U vatrostalnu posudu ređaj red pasulja, pa red luka.",
      "Peci sat vremena na 200 °C.",
    ],
    comments: [
      { name: "Milena", when: "pre 4 dana", text: "Stavila sam i malo suve paprike, ima divnu boju." },
      { name: "Stefan", when: "pre 2 nedelje", text: "Probajte sa crvenim lukom, sladji je." },
    ],
  },
];
