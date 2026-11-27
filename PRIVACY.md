# Privacy

Short answers to "what happens to what she writes".

## What the server keeps

- No accounts, no names, no phone numbers, no email.
- No IP addresses in the database or our logs. Rate limits store a keyed hash of the IP, never the IP itself; these entries stop counting after minutes but stay in the cache table until it is cleaned. Requests to her endpoints are not logged by our app.
- The hosting provider's own edge logs can still record IP addresses. That is outside our app.
- A chat is deleted when she uses the exit (site name, "hide tips" or Escape). Otherwise, for example if she closes the tab, it is deleted at most 24 hours after it started. See [SAFETY.md](SAFETY.md).

## The urgency check

Some messages mean she is in danger right now. We flag those so a counselor sees them first.

Two layers do this:

1. **A danger-word list** in 8 languages. It runs on our server. Nothing leaves the server.
2. **An AI check** (Claude Opus 5.5 by Anthropic). It catches danger the word list misses.

What the AI check receives:

- The text of one message she wrote.
- Our fixed instructions ("is this immediate danger, yes or no").

What it never receives: who she is, her chat id, her IP address, request headers, her resume words, the topic she picked, or counselor notes.

We call one fixed model. There is no automatic fallback to another model.

## Partners can switch it off

Each deployment chooses. With `AI_TRIAGE_ENABLED=false` no message text leaves our server, and the danger-word list still flags danger on its own. If the AI check fails or times out, the word list still decides.

## Who sees the result

- Counselors see only an "Urgent" badge on the chat. They do not see why.
- Nothing on her screens mentions AI.

## What Anthropic does with the text

What she writes does reach Anthropic when the AI check is on. From Anthropic's own pages:

- Standard API retention: inputs and outputs are deleted on Anthropic's backend within 30 days ([how long we store data](https://privacy.claude.com/en/articles/7996866-how-long-do-you-store-my-organization-s-data)).
- If Anthropic's automated safety systems flag a message, inputs and outputs may be kept for up to 2 years, and the safety scores for up to 7 years (same page). Messages about violence or child abuse are the kind most likely to be flagged.
- Zero data retention is arranged per organization with Anthropic's sales team; there is no per-request switch. Even with it, flagged content may be kept for up to 2 years ([API and data retention](https://platform.claude.com/docs/en/manage-claude/api-and-data-retention)).
- We do not have a zero data retention agreement today.

So: for full control over her words, a partner sets `AI_TRIAGE_ENABLED=false` and relies on the danger-word list. A partner that keeps the AI check on should arrange zero data retention first.
