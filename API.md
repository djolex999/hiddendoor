# Skrivena vrata API

For Milica (cover site) and the counselor app. Every endpoint is under `/api/`,
speaks JSON, and uses **no cookies**. `frontend/src/api.ts` already wraps every
woman-side call below, so you rarely need this file to write code; it is here
so you know what each call can answer.

Base URL: `VITE_API_URL` (local: `http://localhost:8000`).

## Rules for the frontend

- Send requests with `credentials: "omit"`, `cache: "no-store"` and
  `referrerPolicy: "no-referrer"` (api.ts does this).
- Keep every token and secret in memory only. Never localStorage,
  sessionStorage, cookies, IndexedDB or a service worker. ESLint blocks them.
- Message bodies are plain text from a person. Render them as text (normal JSX
  `{body}` is fine). Never `dangerouslySetInnerHTML`.
- Help card bodies are markdown written by us in the admin. Plain text is fine.
  If you add a markdown renderer, it must not allow raw HTML.

Every `/api/` response carries `Cache-Control: no-store`,
`Referrer-Policy: no-referrer` and `X-Content-Type-Options: nosniff`.

Errors use DRF's shape: `{"detail": "..."}` or, for validation errors,
`{"field": ["message"]}`. `429` means rate limited: wait a minute.

## Languages

The cover site supports 8 languages. Use these codes in the `language` field:

| Code | Language |
|---|---|
| `sr` | Srpski (default) |
| `hr` | Hrvatski |
| `bs` | Bosanski |
| `cnr` | Crnogorski |
| `sl` | Slovenščina |
| `mk` | Македонски |
| `sq` | Shqip |
| `en` | English |

The language you send to `POST /api/u/` decides the language of the help cards
it returns (see below).

---

## Woman side (anonymous)

### `POST /api/u/` : open the door

The tap sequence lives only on the server. Taps are numbered from 1.

```http
POST /api/u/
Content-Type: application/json

{"sequence": [3, 1, 4, 1], "language": "sq", "audience": "adult"}
```

`audience` is optional: `adult` (default) or `teen`; anything else counts as
`adult`. The cover declares it and the server signs it into the unlock token,
so it cannot be changed afterwards. A teen token cannot start a chat
(`POST /api/chat/start` answers `403 {"detail": "Chat is not available here."}`)
and gets no `general` cards; teen covers show a children's helpline instead.

`language` is optional. The help cards in the `200` response are written in that
language. A missing or unknown `language` means Serbian (`sr`). If a language has
no active cards, the response falls back to Serbian too. A wrong sequence still
returns `204` with no body, whatever the language.

Right sequence, `200`:

```json
{
  "unlock_token": "f0d0f27b515abcfa:1xWn0L:O4-O980ClBmd...",
  "cards": [
    {"slug": "nisi-sama", "title": "Nisi sama", "body": "Ono sto ti se desava..."},
    {"slug": "sos-linija", "title": "SOS linija", "body": "Besplatna SOS linija: **0800 300 339**..."}
  ]
}
```

| Status | Meaning |
|---|---|
| 200 | Door opens. Keep `unlock_token` in memory; it is valid for **10 minutes**. |
| 204 | Anything else: wrong, malformed or empty sequence. Empty body. Show nothing. |
| 429 | More than 10 tries per minute from this client. |

Limits: up to 32 numbers, each 0 to 99.

### `POST /api/chat/start` : start a chat

```http
POST /api/chat/start
Content-Type: application/json

{"unlock_token": "f0d0f27b515abcfa:1xWn0L:O4-O980ClBmd..."}
```

`201`:

```json
{
  "session_id": "3d97eeef-b411-485b-8574-9060e0efb7f2",
  "secret": "Q0l19WDVH_qtrz6yTV4_Bnp_CGUMC00lFBS4ArLXsbA",
  "resume_phrase": "kivi-bundeva-borovnica-jabuka"
}
```

Show `resume_phrase` to her once. It is her only way back into this chat from
another visit; the server cannot show it again. The chat lives 24 hours.

| Status | Meaning |
|---|---|
| 201 | Chat created. Status starts as `waiting`. |
| 400 | `unlock_token` missing. |
| 403 | Token forged or older than 10 minutes. Ask her to open the door again. |
| 429 | More than 5 starts per minute from this client. |

### `POST /api/chat/resume` : come back to a chat

```http
POST /api/chat/resume
Content-Type: application/json

{"resume_phrase": "kivi bundeva Borovnica-jabuka"}
```

Case and separators do not matter (spaces, dashes, anything not a letter). The
client sends the Serbian words, since the cover site converts what she types
back to Serbian first.

`200`:

```json
{"session_id": "3d97eeef-...", "secret": "NEW-secret-value"}
```

The secret is **new** every time. Any other tab holding the old secret is cut
off (it starts getting 403).

| Status | Meaning |
|---|---|
| 200 | Back in. |
| 404 | No open chat with that phrase (wrong, expired, or closed by the counselor). |
| 429 | More than 5 tries per minute from this client, or more than 30 **failed** tries per minute across everyone. `Retry-After` says how many seconds to wait. |

### `GET /api/chat/<session_id>/messages?after=<message_id>` : poll

Poll every 2 seconds. Send the highest message `id` you already have as
`after` (or `0` for everything). Header `X-Session-Secret` is required.

```http
GET /api/chat/3d97eeef-.../messages?after=1
X-Session-Secret: Q0l19WDVH_...
```

`200`:

```json
{
  "status": "active",
  "messages": [
    {"id": 2, "sender": "counselor", "body": "Tu sam.", "created_at": "2026-11-29T15:02:11.512+01:00"}
  ],
  "alert": false,
  "counselor_online": true,
  "reply_hours": "09:00-21:00"
}
```

These five keys are the whole response, on purpose (a test checks it).
`alert`: one of her messages is urgent and no counselor has replied within
30 seconds. `counselor_online`: a counselor loaded the chat list in the last
60 seconds. `reply_hours`: when counselors usually reply (`COUNSELOR_HOURS`).

`status` is `waiting` (nobody answered yet), `active` or `closed` (counselor
ended the chat; it is deleted about 15 minutes later). `sender` is `woman` or
`counselor`. At most 200 messages per call; poll again with the last id.

| Status | Meaning |
|---|---|
| 200 | OK (the list may be empty). |
| 400 | `after` is not a number >= 0. |
| 403 | Wrong or missing secret, or the chat no longer exists (ended or expired). The same answer for all of these on purpose. Stop polling. |

### `POST /api/chat/<session_id>/messages` : send

```http
POST /api/chat/3d97eeef-.../messages
X-Session-Secret: Q0l19WDVH_...
Content-Type: application/json

{"body": "Treba mi pomoc"}
```

`201`: the stored message, same shape as above. Leading and trailing spaces are
trimmed.

| Status | Meaning |
|---|---|
| 201 | Sent. |
| 400 | Empty body, or longer than 2000 characters. |
| 403 | As above. |
| 409 | The counselor closed the chat. |

### `POST /api/chat/<session_id>/end` : delete everything now

```http
POST /api/chat/3d97eeef-.../end
X-Session-Secret: Q0l19WDVH_...
```

`204`, empty body. The session and every message are deleted from the database
immediately. `403` as above. The panic button calls this with
`keepalive: true` so the request survives the page navigating away.

---

## Counselor side

Login once, then send `Authorization: Bearer <token>` on every call. Any `401`
means the token is missing, wrong or older than 12 hours: log in again.

### `POST /api/c/login`

```http
POST /api/c/login
Content-Type: application/json

{"password": "..."}
```

`200`: `{"token": "counselor:1xWn0L:abc...", "expires_in": 43200}`

| Status | Meaning |
|---|---|
| 200 | Logged in. Keep the token in memory only. |
| 401 | Wrong password. |
| 429 | More than 5 tries per minute. |

### `GET /api/c/sessions`

Open chats (`waiting` and `active`), newest first.

```json
[
  {
    "id": "3d97eeef-b411-485b-8574-9060e0efb7f2",
    "status": "waiting",
    "created_at": "2026-11-29T15:01:02.000+01:00",
    "last_activity": "2026-11-29T15:01:40.000+01:00",
    "expires_at": "2026-11-30T15:01:02.000+01:00",
    "unread": 2
  }
]
```

`unread` counts her messages the counselor has not fetched yet.

### `GET /api/c/sessions/<id>/messages?after=<message_id>`

Same response as the woman's poll (`{status, messages}`). Fetching marks the
returned messages as read. `404` if the chat no longer exists (she ended it or
it expired).

### `POST /api/c/sessions/<id>/messages`

`{"body": "..."}` -> `201` message. The first counselor reply moves the chat
from `waiting` to `active`. `400` invalid body, `404` gone, `409` closed.

### `POST /api/c/sessions/<id>/close`

`204`. Sets status `closed`. Her client sees `closed` on its next poll; the
data is deleted about 15 minutes later. `404` if already gone.

---

## Other

- `GET /api/health` -> `{"ok": true}` (for the host's health check).
- `/admin/` : Django admin. Edit help cards there (Door and help cards > Help
  cards). Chats are deliberately not visible in the admin.
