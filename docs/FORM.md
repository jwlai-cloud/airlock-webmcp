# Devpost submission form — paste-ready

Fill top to bottom. Every field below is final text; nothing needs editing.

---

## Project name

```
Airlock
```

## Elevator pitch

```
Two companies measure their shared customers in the browser. Aggregates cross, customer records never do — and the tool that crosses doesn't exist until both sides approve.
```

*(172 characters)*

---

## Built with

```
webmcp, javascript, html, css, google-chrome, gemini, playwright, github-pages, k-anonymity, privacy, clean-room, adtech
```

---

## Try it out (links)

```
https://jwlai-cloud.github.io/airlock-webmcp/site-a/
https://github.com/jwlai-cloud/airlock-webmcp
```

---

## Testing instructions

**This field matters more than usual — without the flag a judge sees "WebMCP unavailable" and nothing works.**

```
No account, no login, no API key.

1. Chrome 149 or later. Open chrome://flags/#enable-webmcp-testing, set it to
   Enabled, and relaunch Chrome.
2. Open https://jwlai-cloud.github.io/airlock-webmcp/site-a/
   The right-hand panel embeds the partner company's console, which runs on a
   separate origin (rawcdn.githack.com). Both sides are live.
3. Diagnostics in the left nav shows what the browser actually implements and
   which tools are currently registered.

Drive it three ways, all reaching the same tools:

  • Chrome's own agent (runs gemini-3-flash-preview) — ask it in your own words:
    "How much does our high lifetime value audience overlap with Meridian's
    sports fans?" Before approval it will report no such tool exists, because
    none does. Ask it to export the partner's records and it is refused.
  • Your own Gemini key, pasted in Agent settings — stays in your browser.
  • The built-in panel — a deterministic router, no model, labelled as such.

Worth trying: ask for the overlap BEFORE approving anything (the tool is not in
the agent's tool list at all), then "Request approval to measure incremental
reach" — an operator approves on each side, and estimate_overlap appears in
Diagnostics. "Check luxury auto intenders" is withheld under the k=250 floor.

Repo: npm install && npm run verify runs 21 checks against real Chrome,
including against the deployed pair with --base.

All data is synthetic.
```

---

## Video demo link

```
(paste the YouTube URL — must be PUBLIC, not unlisted)
```

Local file: `.airlock-video/airlock-demo.mp4` — 2:51, 1920×1080, H.264 + AAC.

---

## Description

Paste the whole of `docs/SUBMISSION.md` from **## Inspiration** down to
**## Built with**. It answers the four required questions in the order Devpost
lists them.

---

## Image gallery

Upload in this order — the first is the gallery thumbnail:

1. `docs/diagrams/airlock-architecture.png` — the system, both origins, what crosses
2. `docs/diagrams/airlock-sequence.png` — the refusal, the two-sided approval, one analysis

---

## Before you press submit

- [ ] Video is **public** on YouTube, not unlisted
- [ ] Video plays with sound from a logged-out browser
- [ ] Live URL opens in flag-enabled Chrome and the partner panel populates
- [ ] Repo is public and the About box shows the MIT licence
- [ ] Testing instructions include the Chrome flag step
- [ ] Teammates added, if any
