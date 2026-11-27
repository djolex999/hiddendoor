import { EMERGENCY_NUMBER } from "./emergency";
import { HELP_STRINGS } from "./helpStrings";
import { useLang } from "./i18n";

/**
 * "If you are in immediate danger" card. She decides whether to call:
 * nothing ever calls anyone for her. The call button appears only for
 * languages with a verified number (see emergency.ts).
 */
export function EmergencyCard() {
  const { lang } = useLang();
  const h = HELP_STRINGS[lang];
  const number = EMERGENCY_NUMBER[lang];
  return (
    <div className="emergency" role="alert">
      <p className="emergency-title">{h.emergencyTitle}</p>
      <p>{h.emergencyText}</p>
      {number && (
        <a className="emergency-call" href={`tel:${number}`}>
          {h.emergencyCall(number)}
        </a>
      )}
    </div>
  );
}
