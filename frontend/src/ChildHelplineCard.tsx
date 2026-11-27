import { CHILD_HELPLINE } from "./emergency";
import { HELP_STRINGS } from "./helpStrings";
import { useLang } from "./i18n";

/**
 * Teen covers: a children's helpline instead of the adult counselor chat.
 * The call button appears only for languages with a verified number
 * (see emergency.ts); otherwise she is pointed to a trusted adult.
 */
export function ChildHelplineCard() {
  const { lang } = useLang();
  const h = HELP_STRINGS[lang];
  const number = CHILD_HELPLINE[lang];
  return (
    <div className="emergency child-helpline">
      <p className="emergency-title">{h.childHelplineTitle}</p>
      <p>{number ? h.childHelplineText : h.childHelplineNone}</p>
      {number && (
        <a className="emergency-call" href={`tel:${number.replaceAll(" ", "")}`}>
          {h.childHelplineCall(number)}
        </a>
      )}
    </div>
  );
}
