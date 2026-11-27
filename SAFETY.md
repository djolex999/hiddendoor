# Safety

Hidden Door (Skrivena vrata) is an ordinary multilingual recipe site (60 real
recipes, 8 languages). A secret ingredient-checklist sequence opens help in
place: same URL, same title. This file explains what we promise, what we do
about it, and what we cannot control. It also gives counselors a practical
protocol.

## Safety principles

**The promise:** no trace on her device, and plausible deniability. We never
say "undiscoverable". Someone who knows to look can still learn that she
visited a recipe site. What they should not find is any sign of help.

After the door opens she answers one question: "What is happening to you?"
There are three paths: someone watches my phone (technology-facilitated
control), I am in danger right now (urgent help), someone online is asking me
for things (grooming). She can also choose to see all tips. Each path shows its
own help cards, and general cards show on all paths. The danger path shows the
emergency card first.

### On her device

- No cookies, localStorage, sessionStorage, IndexedDB or service worker. ESLint
  enforces this, so a new change cannot add them by accident.
- The URL and the page title never change for help. Browser history only shows
  recipes.
- The help code and help text load only after the door opens. A visitor who
  does not know the sequence never downloads them.
- Help hides when the tab goes to the background, so the app switcher snapshot
  shows a recipe.
- If the browser restores the page from the back/forward cache, the page
  reloads to a plain recipe.
- After 10 minutes of inactivity with help open, the page returns to the recipe.
  The chat is kept on the server and can be resumed.
- Panic exit (the site name, "hide tips" or the Escape key) deletes the chat on
  the server and reloads the recipe without adding a history entry.
- The chat keyboard is told not to autocorrect or learn the text.
- Quick replies make it fast to write under pressure: "I can't write right
  now", "He is next to me", "Please call the police", "I'll write later".
- Resume uses 4 food words shown as a "shopping list". She types them into the
  recipe search, in any language. Grammatical case forms, missing diacritics and
  filler words are accepted.

### On the server

- The server knows nothing about her: no accounts and no IP addresses stored.
  Throttling uses an HMAC-hashed client identity.
- Secrets and resume phrases are stored only as keyed hashes.
- Sensitive request paths are filtered from application logs, and the gunicorn
  access log is off.
- The resume phrase space is 105^4 (about 121 million) phrases, with per-client
  and global failure rate limits and a 24 hour session lifetime.
- Chats are deleted when she exits, 15 minutes after a counselor closes them,
  or 24 hours after they start, whichever comes first. Expired chats are
  deleted whenever a chat starts, whenever counselors load their list, and by
  a 15 minute cron job on Render.
- Urgency triage uses a danger-word list in all 8 languages. It works offline.
  When an API key is set and `AI_TRIAGE_ENABLED` is on (the partner
  organization chooses), Claude also checks each of her messages. Only the
  message text is sent, with no identifiers, under an 8 second timeout, to one
  fixed model with no fallback. On failure the word list decides. Whatever she
  writes (a name, a school) does reach Anthropic. What Anthropic keeps is in
  PRIVACY.md; a real deployment should arrange zero data retention.
- Triage only prioritizes. Urgent chats go to the top of the counselor list
  with a red badge, a banner, a one-time beep and a blinking tab title. If no
  counselor replies within 30 seconds, her side shows an "if you are in
  immediate danger" card, with a call button only where the number is verified.
  A counselor reply clears the urgent state.
- **The system never calls anyone on her behalf.** An unrequested police visit
  can raise the risk of violence. Only she decides to call.

### What is outside our control

- The hosting provider's edge logs and routers record request lines and IP
  addresses. We cannot turn that off.
- Anyone watching her network can see that she visited our domain. HTTPS hides
  the content, not the domain.
- Spyware that records the screen or keystrokes defeats any website. If she
  suspects it, a counselor should suggest using a device he cannot reach, such
  as a library or a friend's phone.
- The browser's HTTP cache may hold the site's JS bundle. It only looks like a
  recipe site's code.

## Counselor protocol

Practical steps. These are guidance written by the team, not a legal or clinical
standard. Follow your organization's protocol where it is stricter.

1. **Answer urgent chats first.** Urgent chats sit at the top with a red badge.
   Reply within seconds, even with one line, because a counselor reply clears
   the urgent state on her side and tells her someone is there.
2. **Never ask for her real name.** If she offers it, do not write it in the
   notes. Use a nickname for the chat. Notes are deleted with the chat and are
   never sent to her side, but keep them minimal anyway. Do not write her
   place either.
3. **Agree on a safe word or an "I can't talk" signal.** Early in the chat, set
   a word or a short message that means "he is near, stop". The quick reply
   "He is next to me" can serve as one. When it appears, stop writing and wait
   for her to return.
4. **Keep messages short and neutral.** Write as if the thread is recipe
   comments. Do not use alarming words that would be visible on a screen if
   someone looks over her shoulder.
5. **If she says she is in danger now,** give the emergency number for her
   country and help her make a plan: a safe room, an exit route, who can take
   her in, what to carry. Ask what she wants. Do not call the police without her
   consent, unless there is a direct threat to life and local law requires you
   to act. If you must act, tell her first when you safely can.
6. **Possible minors on the grooming path.** The counselor app shows a note on
   these chats. Check her age gently. If she may be under 18, follow the
   national child-protection procedure for your country. Point her to Take It
   Down if she is under 18, or StopNCII if she is an adult, to remove intimate
   images. Never ask her to send images, not even as proof. Keep notes minimal.
7. **Close the chat when you are done.** Closing starts the 15 minute deletion
   timer. Do not leave finished chats open.
8. **Do not promise what we cannot guarantee.** Say "this site leaves no trace
   on your phone", not "no one can ever find out". Remind her to use panic exit
   if someone comes near.

## Known limitations

- **Translations are drafts.** They have not been reviewed by native speakers.
- **Help cards are team drafts**, not yet reviewed by a support organization.
  They are editable per language in the Django admin.
- **Hotline numbers are researched, not called.** The emergency button uses
  numbers checked against official or international sources on 27 Nov 2026:
  192 (Serbia), 112 (Croatia, Slovenia, Montenegro, North Macedonia,
  Albanian speakers) and 122 (Bosnia and Herzegovina). The site picks by
  language, not country, so a Kosovo and an Albania user see the same number.
  Women's SOS lines are not on the button yet; each should be called once by
  the team before it is added. Serbia's 0800 300 339 is free but has no
  published hours, so it is never described as 24/7.
- **The resume phrase is not a password.** It is 4 food words, good enough for a
  24 hour chat, with rate limits. An attacker spread over many clients can use
  up the global failure cap and delay real resumes for a short time.
- **AI triage sends message text to a third party.** With it on, her messages
  reach Anthropic (see PRIVACY.md for what Anthropic keeps). Partners can turn
  it off with `AI_TRIAGE_ENABLED`; real use should arrange zero data
  retention.
- **LLM triage can miss or over-flag.** That is why it only prioritizes and
  never acts. The danger-word list is the fallback and has its own gaps.
- **Polling, not websockets.** Both sides poll every 2 seconds. It is simple and
  robust, but not instant.
- **One shared counselor password.** There are no counselor accounts and no audit
  log yet, so we cannot tell who read or wrote what.
- **No long-term case history.** Chats are deleted after at most 24 hours, so a
  returning woman starts fresh and counselors cannot look up earlier
  conversations.
