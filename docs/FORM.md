# Devpost submission form — paste-ready

Fill top to bottom. Every field below is final text; nothing needs editing.

---

## Project name

```
Airlock — audience overlap without sharing customer data
```

*(56 characters. Says what it does in plain words — a judge who has never heard
of a data clean room still knows what this is. Alternatives, if you prefer the
industry term: "Airlock — a data clean room in the browser" (42), or
"Airlock — cross-origin data clean room" (38).)*

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
3. `docs/diagrams/airlock-defence.png` — the three gates an injection meets

---

---

## Additional info (judges and organisers only)

**Submitter type** — Individual, unless you are entering on behalf of TrafficGuard.
That is a real decision, not a formality: entering as an organisation changes who
owns the submission. The rules require the entrant to solely own the work.

**Country of residence** — yours to fill.

**Organisation name** — leave blank for an individual entry.

**App status** — **New**.
First commit `2026-09-01 11:15 +0800`, inside the submission period (opened
August 25). Nothing here predates it; the whole repository was written during
the window. `git log --reverse` shows it if a judge checks.

**Live URL**

```
https://jwlai-cloud.github.io/airlock-webmcp/site-a/
```

**Testing instructions** — use the block above.

**Public code repo**

```
https://github.com/jwlai-cloud/airlock-webmcp
```

**Which agent(s) or client(s) did you test your WebMCP tools with?**

```
Google Chrome 152, with chrome://flags/#enable-webmcp-testing. Everything below
was established there.

Tested end to end:
- An automated Playwright harness (tools/verify.js) driving the same calls an
  agent makes — getTools({fromOrigins}) and executeTool() across the origin
  boundary. 23 checks, run against both the local pair and the deployed HTTPS
  pair.
- The in-page assistant, a deterministic router with no model, exercised by
  tools/verify-ui.js the way a visitor without an API key uses it: 12 checks,
  also run against the deployed pair.
- Chrome DevTools' WebMCP panel (chrome://flags/#devtools-webmcp-support) for
  watching the registered tool list change as consent is granted and withdrawn.

Also built, and exercised only in part:
- A Gemini function-calling client inside the page, driven by the visitor's own
  API key. Its tool declarations are asserted by the test suite; we did not have
  a key to run a full live conversation through it.
- Chrome's built-in agent (gemini-3-flash-preview) will discover these tools
  with no configuration, since they are registered through the standard API and
  nothing is scripted for a particular client. We could not automate it, so we
  are not claiming a verified run.

Not tested: ChatGPT's in-app browser. We had no access to it. Saying so here
rather than leaving a judge to find out.

Three things that testing disproved, all recorded in docs/LEARNING.md and fixed
in the code:
- requestUserInteraction does not exist in Chrome 152 on any receiver, and the
  execute callback's second argument is undefined — not even the spec'd
  {signal}. The consent gate had been throwing on every attempt.
- getTools({fromOrigins}) is additive, not a filter: it returns the caller's own
  tools as well as the listed origins'.
- executeTool requires a JSON string; an object throws
  "UnknownError: Failed to parse input arguments".
- A declarative tool's inputSchema arrives as a JSON string where an imperative
  tool's is an object, and declarative tools carry no annotations key at all.
```

**Which AI tools have you leveraged while working on this project?**

```
Claude Code (Claude Opus) for the implementation, the Playwright test harness,
the documentation, and the demo capture pipeline. ElevenLabs for the demo
narration. The architecture and sequence diagrams were generated from typed
specifications rather than drawn by hand.

Airlock itself calls no model and ships no API key. The tools are the product;
any WebMCP agent drives them.

The project idea, the name, and the framing decisions were the author's. Several
of the better choices came from the author pushing back on a first attempt: the
app-first narrative rather than leading with the security claim, showing the
tool list change on camera rather than describing it, and asking whether the
keyless path had actually been tested — which is how the last real bug was
found.
```

**Level of learning derived** — yours to answer.

Honest raw material if useful: the project began with three wrong assumptions
about the WebMCP API taken from published documentation, and all three were
disproved by building a way to test a flag-gated browser API automatically. The
consent gate — the central claim of the submission — had never worked until that
harness existed.

**Did you gain AI value you can use in your career?** — yours to answer.

---

## Before you press submit

- [ ] Video is **public** on YouTube, not unlisted
- [ ] Video plays with sound from a logged-out browser
- [ ] Live URL opens in flag-enabled Chrome and the partner panel populates
- [ ] Repo is public and the About box shows the MIT licence
- [ ] Testing instructions include the Chrome flag step
- [ ] Teammates added, if any
