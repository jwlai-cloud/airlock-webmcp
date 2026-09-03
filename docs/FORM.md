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
Two companies compare customer lists without sharing them. Each side publishes WebMCP tools to the other's origin — and the tool that crosses doesn't exist until both approve.
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

**This field matters more than usual — without the flag a judge sees "WebMCP unavailable"
and nothing works.** It is ordered by friction: everything essential needs only the flag.

```
No account, no login, no API key. One setup step, then about a minute.

SETUP — required
1. Chrome 149 or later.
2. Open chrome://flags/#enable-webmcp-testing, set Enabled, relaunch Chrome.
3. Open https://jwlai-cloud.github.io/airlock-webmcp/site-a/
   (If you skip step 2 the page says so and tells you what to do.)

WHAT YOU ARE LOOKING AT
Two companies, two separate origins. The left is the advertiser's workspace on
github.io. The panel on the right is the publisher's own console, a separate
application on a separate origin (rawcdn.githack.com) — there is a link in that
panel to open it on its own if you want to confirm that. It is embedded here
because WebMCP only exposes cross-origin tools to documents in the same frame
tree; without the allow="tools" frame, neither side could reach the other at all.

THE 60-SECOND PATH — no extra setup, uses the panel on the right
1. Click "How much does high lifetime value overlap with sports fans?"
   It reports that no such tool exists. Not a denial — estimate_overlap is not
   registered, so it is absent from getTools() entirely.
2. Open Diagnostics in the left nav. Confirm estimate_overlap says "not
   registered" while the other five say "registered". This is the whole claim,
   and it is visible without any model involved.
3. Click "Export Meridian's customer records". Refused, unconditionally.
4. Click "Request approval to measure incremental reach". An operator approves
   on each side — the second approval happens inside the publisher's own
   console, because neither company can approve for the other.
5. Re-open Diagnostics. estimate_overlap has appeared.
6. Ask the overlap question again: 2,178 shared, 13,057 incremental reach. Two
   aggregate counts crossed. Zero customer records moved. The publisher's note
   comes back quarantined — it contains a deliberate prompt injection.
7. Click "Check luxury auto intenders". Withheld: fewer than 250 people matched.
8. Click "Withdraw approval", then re-open Diagnostics. The tool is gone. Not
   disabled — unregistered.

That panel is a deterministic router with no model, and the UI says so. It calls
the identical getTools() and executeTool() a real agent would.

OPTIONAL — drive it with a real agent
Nothing here is scripted for a particular client, so any WebMCP agent works.

  (a) Google's Model Context Tool Inspector extension, whose agent chat runs
      gemini-3-flash-preview:
      https://chromewebstore.google.com/detail/model-context-tool-inspec/gbpdfapgefenggkahomfgkhfehlcenpd
      Ask in your own words: "How much does our high lifetime value audience
      overlap with Meridian's sports fans?" Before approval it will tell you no
      such tool exists, because none does.

  (b) Your own Gemini API key — the "Use your own model" button at the top of
      the assistant panel. It is kept in your browser's localStorage and sent
      only to Google. Airlock has no backend and ships no key, so it never
      reaches us. Entirely optional — the steps above prove the same thing
      without it.
      Note: free-tier keys allow only a few requests a minute. If you ask
      several questions quickly the page will say it is retrying and wait;
      that is the API's limit, not the app stalling.

VERIFY IT YOURSELF
  git clone https://github.com/jwlai-cloud/airlock-webmcp && npm install
  npm run verify -- --base https://jwlai-cloud.github.io/airlock-webmcp/site-a/
  npm run verify:ui -- --base https://jwlai-cloud.github.io/airlock-webmcp/site-a/
25 checks of the WebMCP surface and 12 of the keyless UI path, both against the
deployed pair rather than a local copy.

All data is synthetic. k-anonymity at k=250, which is not differential privacy —
said plainly in the README rather than overclaimed.
```

## Video demo link

```
(paste the YouTube URL — must be PUBLIC, not unlisted)
```

Local file: `.airlock-cuts/vertex9-236.mp4` — 2:36, 1920×1080, H.264 + AAC.

---

## Description

Paste the whole of `docs/SUBMISSION.md` from **## Inspiration** down to
**## Built with**. It answers the four required questions in the order Devpost
lists them.

---

## Image gallery

Upload in this order — the first is the gallery thumbnail:

1. `docs/diagrams/airlock-thumbnail.png` — **the gallery thumbnail.** The real product
   mid-analysis: the numbers, the quarantined injection, and the agent's tool calls.
   A screenshot of the thing working is more credible than an illustration.
2. `docs/diagrams/airlock-architecture.png` — the system, both origins, what crosses
3. `docs/diagrams/airlock-sequence.png` — the refusal, the two-sided approval, one analysis
4. `docs/diagrams/airlock-defence.png` — the three gates an injection meets

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
  boundary. 25 checks, run against both the local pair and the deployed HTTPS
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
- Google's Model Context Tool Inspector extension, whose agent chat runs
  gemini-3-flash-preview, will discover these tools with no configuration, since
  they are registered through the standard API and nothing is scripted for a
  particular client. The extension is not scriptable, so we are not claiming a
  verified end-to-end run through it.

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
