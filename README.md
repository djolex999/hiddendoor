# Skrivena vrata (Hidden Door)

SheSafe Online Hackathon project. Demo: Sunday 29 Nov 2026, 16:00 CET.

A woman whose partner monitors her phone visits an ordinary recipe site. A
secret tap sequence opens help in place (same URL, same title): help cards and
an anonymous chat with a counselor. Her browser history only shows recipes.

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
| `render.yaml` | Render Blueprint |

## Requirements

Python 3.13 via [uv](https://docs.astral.sh/uv/), Node 22, pnpm 12, Docker.

## Local setup

```bash
# 1. Database (Postgres 16 on host port 5433)
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
cd backend && uv run pytest && uv run ruff check . && uv run ruff format --check .
pnpm typecheck && pnpm lint && pnpm build     # from repo root
```

Tests need the docker Postgres running; they do not need a `.env`
(`config/settings_test.py` provides test values).

### Expired chats

Expired sessions are deleted lazily on every chat start. To purge by hand:

```bash
cd backend && uv run --env-file .env python manage.py purge_expired
```

## How the flow works

1. The recipe page collects taps on ingredient lines and, after 1.5 s idle,
   sends them to `POST /api/u/`. The right sequence exists only in the
   server's `DOOR_SEQUENCE`. Wrong taps get an empty 204: nothing happens.
2. Right taps return help cards and a 10 minute unlock token. Help replaces the
   recipe in place; the URL and title never change.
3. "Start chat" returns a session id, a secret (kept in memory only) and a
   4-word food phrase like `kivi-bundeva-borovnica-jabuka` to resume later.
4. Both sides poll every 2 s. The counselor app sees waiting chats with
   unread counts.
5. The exit button deletes the chat on the server and reloads the recipe with
   `location.replace`, so it adds no history entry.

## Languages

The cover site and help cards come in 8 languages: `sr` (Serbian, default),
`hr`, `bs`, `cnr`, `sl`, `mk`, `sq` and `en`. The API details are in `API.md`.

1. **Help cards:** each card has a `language` field in the Django admin, and you
   can filter the list by language. The same slug (for example `sos-linija`)
   exists once per language. A data migration seeded the seven non-Serbian
   languages with placeholder text.
2. **SOS card outside Serbia:** it intentionally has no phone numbers, only
   placeholders like `[upiši broj]`. Someone must verify each hotline and fill
   it in through the admin. Never guess a hotline number.
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
6. **Translations are drafts** made for the demo. Native speakers must review
   them before any real use.

## What we promise, and its limits

- **On her device:** no cookies, no web storage, no service worker; the URL
  and title never change. Closing the tab forgets everything. The browser's
  HTTP cache may still hold the site's JS bundle, which only looks like a
  recipe site's code.
- **On our server:** no accounts, no IPs, no user agents. Secrets and resume
  phrases are stored only as keyed HMAC hashes. Requests to `/api/u/` and
  `/api/chat/` are filtered out of Django's logs; gunicorn's access log is off.
  Chats are deleted when she presses exit, or 24 h after they start.
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
2. When asked, fill the `sync: false` secrets: `DOOR_SEQUENCE` and
   `COUNSELOR_PASSWORD`. (`SECRET_KEY` is generated.)
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
5. Optional (paid): add a Cron Job running
   `uv run python manage.py purge_expired` hourly. Without it, expired chats
   are still purged on every chat start and are never readable after expiry.

Free-plan caveats for the demo:

- The API sleeps after 15 min idle; the first request takes about a minute.
  Open `/api/health` a few minutes before presenting.
- Free Postgres expires after 30 days.
- Gunicorn's access log is off in `gunicorn.conf.py`, but Render's own HTTP
  request logs (dashboard) still exist.

## Known limitations

Full detail, plus the counselor protocol, is in [SAFETY.md](SAFETY.md). The top
five:

- Translations into the 8 languages are drafts that need native-speaker review.
- Help cards are team drafts, and emergency numbers are researched from official sources but not yet test-called.
- The hosting edge logs IPs, and spyware on her device defeats any website.
- One shared counselor password, with no counselor accounts or audit log yet.
- LLM urgency triage can miss or over-flag, so it only prioritizes and never acts. Partners can turn the AI check off (`AI_TRIAGE_ENABLED`); with it on, message text goes to Anthropic (see PRIVACY.md).

## License

MIT, see [LICENSE](LICENSE). Hidden Door is meant to be given away: a partner organization can run, change and host it for free.
