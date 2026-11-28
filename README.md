# Skrivena vrata (Hidden Door)

SheSafe Online Hackathon project. Demo: Sunday 29 Nov 2026, 16:00 CET.

A woman whose partner monitors her phone visits an ordinary recipe site. A
secret tap sequence opens help in place (same URL, same title). One question
("What is happening to you?") leads to three paths: someone controls my phone,
I am in danger now, someone online asks me for things. Each path has its own
help cards, and she can chat anonymously with a counselor in what looks like
recipe comments. Her browser history only shows recipes.

The door is the product; the recipe site is one swappable cover. A teen cover
that leads to a children's helpline instead of the chat is the next step
(a stub exists, see [COVERS.md](COVERS.md)).

**The promise:** no trace on her device and plausible deniability. Never
"undiscoverable". The server knows nothing about her: no accounts, no cookies,
no IPs in our database or logs.

## Layout

| Path | What |
|---|---|
| `backend/` | Django 5.2 + DRF API, Postgres. Apps: `door`, `chat`, `counselor` |
| `counselor/` | Vite + React + TS app for counselors |
| `frontend/` | Vite + React + TS cover site |
| `API.md` | Every endpoint with examples and error codes |
| `SAFETY.md` | Safety principles, counselor protocol, known limitations |
| `PRIVACY.md` | What the server keeps and what the AI check receives |
| `SECURITY.md` | What happens if he takes the phone |
| `COVERS.md` | How to add a cover, or embed the door in an existing site |
| `REVIEW.md` | Translation review checklist (all pending) |
| `render.yaml` | Render Blueprint |
| `scripts/check.sh` | All checks: types, lint, tests, build |

## Requirements

Python 3.13 via [uv](https://docs.astral.sh/uv/), Node 22, pnpm 12, Docker.

## Local setup

```bash
# 1. Database (Postgres 16 on host port 5434)
docker compose up -d

# 2. Backend
cd backend
cp .env.example .env          # then edit: real SECRET_KEY, your sequence and password
uv sync
uv run --env-file .env python manage.py migrate
uv run --env-file .env python manage.py createsuperuser
uv run --env-file .env python manage.py runserver    # http://localhost:8000

# 3. Frontends (new terminal, repo root)
pnpm install
cp frontend/.env.example frontend/.env.local
cp counselor/.env.example counselor/.env.local
pnpm dev:frontend     # http://localhost:5173
pnpm dev:counselor    # http://localhost:5174
```

Generate a real `SECRET_KEY`:

```bash
uv run python -c "import secrets; print(secrets.token_urlsafe(50))"
```

Help card text: http://localhost:8000/admin/ > Help cards.

### Checks

```bash
scripts/check.sh all     # types, lint (JS + ruff), tests, build; prints only failures
```

The test step runs the backend tests (pytest) and the frontend logic tests
(`frontend/tests/`, Node's built-in test runner, no extra packages). Full logs
land in `.claude/tmp/`. Tests need the docker Postgres running; they do not
need a `.env` (`config/settings_test.py` provides test values).

### Expired chats

Expired sessions are deleted on every chat start, whenever counselors load
their chat list, and by the Render cron job in `render.yaml`. To purge by hand:

```bash
cd backend && uv run --env-file .env python manage.py purge_expired
```

## How the flow works

1. The recipe page collects taps on ingredient lines and, after 1.5 s idle,
   sends them to `POST /api/u/` with the cover's audience (`adult` here). The
   right sequence exists only in the server's `DOOR_SEQUENCE`. Wrong taps get
   an empty 204: nothing happens.
2. Right taps return help cards and a 10 minute unlock token. Help opens in
   place; the URL and title never change. Help code loads only now, as a file
   with a meaningless name.
3. She picks a path. "I am in danger now" shows her country's emergency number
   first (`frontend/src/emergency.ts`, verified numbers only).
4. "Write to us" returns a session id, a secret (kept in memory only) and a
   4-word food phrase like `kivi-bundeva-borovnica-jabuka` to resume later.
   One-tap quick replies cover "I can't write right now" and "I need the police".
5. Both sides poll every 2 s. If no counselor has opened the chat list in the
   last 150 s, her chat says so plainly, with reply hours if the partner set
   them, and shows her emergency number.
6. Every message she sends goes through a danger-word list in 8 languages
   and, if the partner enabled it, an AI check. Urgent chats jump to the top
   of the counselor list with an "Urgent" badge. Nothing ever calls anyone
   for her.
7. Exit (site name, "hide tips", Escape) asks the server to delete the chat
   and reloads the site with `location.replace`, so it adds no history entry.
   Help also closes after a minute away or ten idle minutes (SECURITY.md).

A teen unlock (`audience: teen`) gets no counselor chat: the server answers
403 to a chat start and sends no general cards; the teen cover shows a
children's helpline instead.

## Settings a partner chooses

| Setting | Where | Default | What it does |
|---|---|---|---|
| `AI_TRIAGE_ENABLED` | `backend/.env` | `true` | Off: only the danger-word list runs and no text leaves the server. On: message text also goes to Claude (see PRIVACY.md). |
| `ANTHROPIC_API_KEY` | `backend/.env` | empty | Needed for the AI check; without it only the word list runs. |
| `COUNSELOR_HOURS` | `backend/.env` | empty | When counselors usually reply, e.g. `09:00-21:00`. Empty shows no hours. |
| `VITE_COVER` | `frontend/.env.local` | `recipes` | Which cover to build. `homework` is an unfinished teen stub; never link it publicly. |

## Languages

The cover site and help cards come in 8 languages: `sr` (Serbian, default),
`hr`, `bs`, `cnr`, `sl`, `mk`, `sq` and `en`. The API details are in `API.md`.

1. **Help cards:** each card has a `language` and a `topic` (general, control,
   danger, grooming) in the Django admin, and you can filter by both. The same
   slug (for example `sos-linija`) exists once per language.
2. **SOS card outside Serbia:** it still says `[upiši broj]` (enter number), so
   migration 0008 hides it, and a test makes sure no active card shows a
   bracket placeholder. Her emergency card shows the verified number for her
   language instead. Someone must verify each hotline before filling in a
   card in the admin. Never guess a hotline number.
3. **Resume phrase:** still 4 food words, hashed on the server in Serbian. The
   site shows the phrase in the visitor's language, using 105 food words per
   language aligned by position with the Serbian list in
   `backend/chat/phrase_languages.py`. It converts what she types back to
   Serbian, accepts case forms, missing diacritics (`c` for `č`, `e` for `ë`)
   and small filler words. If a phrase does not match the current language, the
   site tries every other language.
4. **Frontend word lists are generated.** After changing the word lists, run:

   ```bash
   cd backend && uv run python manage.py export_food_words
   ```

   This writes `frontend/src/foodWords.ts`. A backend test fails if that file is
   stale. Another test runs the TypeScript in Node and checks it matches the
   Python lists exactly.
5. **Cover site:** a language picker sits in the header. The chosen language is
   kept in memory only, never stored, and the default comes from the browser
   language. There are 60 recipes, one JSON file per language in
   `frontend/src/content/recipes/<lang>.json`, and each language loads only when
   it is chosen. Every recipe has its own address (`?r=recipe-id`), so browser
   history lists real recipes. Opening help never changes the address or the
   title. Ingredient order must be identical in every language, because the
   ingredient checklist is the secret door.
6. **Translations are drafts.** Serbian was written by the team; the other
   seven are AI-assisted. [REVIEW.md](REVIEW.md) lists everything a native
   speaker must review before a pilot.

## What we promise, and its limits

- **On her device:** no cookies, no web storage, no service worker; the URL
  and title never change. Closing the tab forgets everything. The browser's
  HTTP cache may still hold the site's JS bundle, which only looks like a
  recipe site's code.
- **On our server:** no accounts, no IPs, no user agents. Secrets and resume
  phrases are stored only as keyed HMAC hashes. Requests to `/api/u/` and
  `/api/chat/` are filtered out of Django's logs; gunicorn's access log is off.
  Chats are deleted when she uses exit (best effort: the request may not
  arrive without signal), and always within 24 h after they start.
- **The AI check:** optional per deployment. It receives only the text of one
  message, never who she is. Anthropic may keep it up to 30 days, flagged
  messages up to 2 years (PRIVACY.md).
- **Outside our code:** the hosting edge (Render's router, Cloudflare when
  tunneling) logs request lines and IPs. We cannot turn that off. Anyone who
  can see her network traffic sees that she contacted our domain (HTTPS hides
  the content, not the domain).
- **Resume phrase:** 4 of 105 words (about 121 million combinations), 5
  tries per minute per client plus 30 failed tries per minute across all
  clients, 24 h lifetime. Good enough here, not a password. Trade-off: an
  attacker spread over many IPs can use up the global cap and delay real
  resumes for up to a minute at a time.

## Share with Milica (cloudflared tunnel)

Milica runs the frontend on her laptop against your local API.

1. Start the tunnel (prints an `https://<random>.trycloudflare.com` URL):

   ```bash
   cloudflared tunnel --url http://localhost:8000
   ```

2. In `backend/.env`, update and restart runserver:

   ```
   ALLOWED_HOSTS=localhost,127.0.0.1,.trycloudflare.com
   CSRF_TRUSTED_ORIGINS=http://localhost:8000,https://<random>.trycloudflare.com
   NUM_PROXIES=1
   DEBUG=false
   ```

   - `NUM_PROXIES=1`: the tunnel is a proxy; without it every visitor shares
     one throttle bucket.
   - `DEBUG=false`: never expose Django debug pages to the internet. With
     DEBUG off, run `uv run --env-file .env python manage.py collectstatic`
     once so the admin has its CSS.
   - CORS needs no change: Milica's dev server is also
     `http://localhost:5173`, which `FRONTEND_ORIGIN` already allows.
   - `CSRF_TRUSTED_ORIGINS` only matters if she edits cards in the admin
     through the tunnel.

3. Milica sets `VITE_API_URL=https://<random>.trycloudflare.com` in her
   `frontend/.env.local` and restarts `pnpm dev:frontend`.

Notes:

- The URL changes every time you restart `cloudflared`; send her the new one.
- **The tunnel lives only while your laptop is awake and both processes run.**
  Keep the Mac awake with `caffeinate -i` in another terminal.
- Anyone with the URL can reach your API. Use a non-default `DOOR_SEQUENCE`
  and a strong `COUNSELOR_PASSWORD`.

## Deploy later (Render)

`render.yaml` defines the API (gunicorn + WhiteNoise), a managed Postgres 16
and both frontends as static sites. Render deploys from this GitHub repo.

What you will click in the Render dashboard:

1. Render > **New > Blueprint**, connect the repo, pick `render.yaml`.
2. When asked, fill the `sync: false` secrets: `DOOR_SEQUENCE`,
   `COUNSELOR_PASSWORD` and, only if the partner wants the AI check,
   `ANTHROPIC_API_KEY`. (`SECRET_KEY` is generated.) Set `COUNSELOR_HOURS` to
   the real reply hours, or leave it empty.
3. After the first deploy, check each service's real URL. If any differs from
   `hiddendoor-api / hiddendoor-web / hiddendoor-counselor.onrender.com`,
   update `ALLOWED_HOSTS`, `CSRF_TRUSTED_ORIGINS`, `FRONTEND_ORIGIN`,
   `COUNSELOR_ORIGIN` (API) and `VITE_API_URL` plus the CSP `connect-src`
   (both static sites), then redeploy.
4. Create the admin user. The free plan has no Shell, so once: add env vars
   `DJANGO_SUPERUSER_USERNAME`, `DJANGO_SUPERUSER_EMAIL`,
   `DJANGO_SUPERUSER_PASSWORD` on the API, temporarily append
   `&& uv run python manage.py createsuperuser --noinput` to the start
   command, deploy, then remove both.
5. The Blueprint includes a cron job (`hiddendoor-purge`, every 15 minutes,
   paid starter plan) running `purge_expired`. Without it, expired chats are
   still purged on chat start and whenever counselors load their list, and
   are never readable after expiry.

Free-plan caveats for the demo:

- The API sleeps after 15 min idle; the first request takes about a minute.
  Open `/api/health` a few minutes before presenting.
- Free Postgres expires after 30 days.
- Gunicorn's access log is off in `gunicorn.conf.py`, but Render's own HTTP
  request logs (dashboard) still exist.

## Known limitations

Full detail, plus the counselor protocol, is in [SAFETY.md](SAFETY.md). The main
ones:

- Translations into the 8 languages are drafts that need native-speaker review.
- Help cards are team drafts, and emergency numbers are researched from official sources but not yet test-called. Children's helplines are verified for Serbia only.
- The teen cover is a stub, and the teen audience is declared by the cover; for a pilot the server should decide it from the site address.
- The hosting edge logs IPs, and spyware on her device defeats any website.
- One shared counselor password, with no counselor accounts or audit log yet.
- LLM urgency triage can miss or over-flag, so it only prioritizes and never acts. Partners can turn the AI check off (`AI_TRIAGE_ENABLED`); with it on, message text goes to Anthropic (see PRIVACY.md).

## License

MIT, see [LICENSE](LICENSE). Hidden Door is meant to be given away: a partner organization can run, change and host it for free.
