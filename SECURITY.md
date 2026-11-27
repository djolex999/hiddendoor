# Security: if he takes the phone

**On stage, in one sentence:** One tap on the site name takes her back to the
recipe site and tells the server to delete the chat; if she can't reach it,
help hides the moment the phone locks or switches apps, and closes itself if
she was away more than a minute or idle for ten.

**What happens, exactly** (frontend/src/panic.ts and App.tsx):

- **Exit.** While help is open, tapping the site name, the "hide tips" link
  or Escape on a keyboard sends one request asking the server to delete the
  chat and reloads the recipe site's home page without adding a history
  entry, so Back does not bring help back. The delete is best effort: with no
  signal it may not arrive, and then the chat expires within 24 hours.
- **Tab hidden or phone locked.** The moment the page is hidden, help is
  hidden too, in the same step, so the app switcher snapshot should show a
  recipe. We checked this in desktop browsers; check it on the demo phone
  before relying on it.
- **Away for more than a minute.** When the page becomes visible again after
  more than 60 seconds, help is closed and the recipe reloads instead of
  help reappearing. The chat stays on the server; her four words bring it
  back.
- **Ten minutes without use.** Help closes itself the same way.
- **Back and forward cache.** If the browser restores the page from memory,
  it reloads, so a restored help view never appears.

**The limits.**

- If he grabs the phone while help is open and the screen stays on, he sees
  help until she taps the site name or ten minutes pass.
- If the phone is locked and unlocked again within a minute, help is shown
  again, because the one-minute rule only applies to longer absences.
- No website can prevent either, and spyware that records the screen is also
  outside what a website can stop (see SAFETY.md).

These guards cover both covers: the recipe site (App.tsx) and the teen stub
(covers/homework/HomeworkCover.tsx).
