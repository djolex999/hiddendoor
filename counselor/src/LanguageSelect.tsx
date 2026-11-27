import { LANGUAGE_OPTIONS, useLang, type Lang } from "./i18n";

export function LanguageSelect() {
  const { lang, setLang, t } = useLang();
  return (
    <select
      className="lang-select"
      aria-label={t.languageLabel}
      value={lang}
      onChange={(e) => {
        const match = LANGUAGE_OPTIONS.find((o) => o.code === e.target.value);
        if (match) setLang(match.code satisfies Lang);
      }}
    >
      {LANGUAGE_OPTIONS.map((o) => (
        <option key={o.code} value={o.code}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
