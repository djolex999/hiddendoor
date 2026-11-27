// Same 105 words the server uses for resume phrases (backend/chat/words.py).
// Not secret: the strength comes from 105^4 combinations plus rate limits.
// A backend test fails if this list and the server's drift apart.

export const FOOD_WORDS: ReadonlySet<string> = new Set([
  "cimet", "pita", "limun", "jabuka", "banana", "kivi", "ananas", "mango", "dinja", "lubenica",
  "malina", "kupina", "borovnica", "jagoda", "kajsija", "breskva", "smokva", "urma", "orah",
  "badem", "kikiriki", "susam", "mak", "med", "mleko", "jogurt", "kefir", "pavlaka", "kajmak",
  "sir", "maslac", "jaje", "kvasac", "biber", "origano", "bosiljak", "mirodija", "nana", "timijan",
  "ruzmarin", "lovor", "vanila", "kakao", "kafa", "keks", "torta", "krofna", "burek", "gibanica",
  "proja", "hleb", "kifla", "lepinja", "kora", "testo", "pasta", "pirinac", "kukuruz", "ovas",
  "heljda", "luk", "praziluk", "paprika", "paradajz", "krastavac", "tikvica", "kupus", "kelj",
  "brokoli", "karfiol", "blitva", "salata", "rotkva", "cvekla", "celer", "krompir", "pasulj",
  "leblebija", "tikva", "bundeva", "maslina", "ulje", "senf", "pekmez", "slatko", "sok", "sirup",
  "kompot", "supa", "sarma", "musaka", "riba", "losos", "tuna", "piletina", "kobasica", "slanina",
  "ajvar", "urnebes", "kiflica", "mafin", "strudla", "rolat", "kugla", "knedla",
]);
