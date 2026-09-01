# PROGRESS

## 2026-09-01 — day 1

### Done

- **Receipts ledger (K5).** Origin A's middle pane is now an ordered ledger: sequence,
  direction (`A→B` / `A→A`), tool, detail, and a PASS/BLOCKED verdict. Backed by the
  same `receipts[]` the `get_receipts` tool returns, so UI and agent never disagree.
- **`untrustedContentHint` boundary (K4).** Verified against the W3C IDL that this is a
  *registration annotation* alongside `readOnlyHint`, not a response field. Applied to
  `publisher_segment_reach`, `estimate_overlap`, `get_receipts`. Origin B now returns a
  free-text `note` per segment; `sports-fans` carries a deliberate synthetic
  prompt-injection probe so the defence is observable. See ADR 0002.
- **Fixed a real XSS across the boundary.** The seed rendered log lines with
  `insertAdjacentHTML` on interpolated strings. With partner text now flowing through
  that path, origin B could have injected markup and script into origin A — the boundary
  leaking in the opposite direction from the one advertised. All rendering is
  `textContent` now.
- **`tools/check.sh`.** Parses each page's inline `<script>` and fails if any HTML sink
  appears on either page. Catches the failure mode that costs a demo: a typo in a
  250-line inline script that shows up only as a blank page in flag-enabled Chrome.
- **Consent revocation.** `revoke_partner_consent` aborts the `AbortController` whose
  signal registered `estimate_overlap`, which unregisters it. SPEC §4 already claimed
  revocation worked; it does now.
- **Hardened the consent prompt.** `requestUserInteraction` is in Chrome's
  `model_context.idl` but appears in neither the W3C IDL (whose
  `ToolExecuteCallbackOptions` carries only `signal`) nor Chrome's own docs.
  `withUserInteraction()` probes both plausible receivers and falls back to a direct
  dialog, and logs which path it took.
- **UI polish.** Three-pane split, live consent/tool-count badges, local cohort card,
  an "ask the agent" prompt list for the video, quarantine panel for partner text.
- **Docs.** ARCHITECTURE.md, LEARNING.md, ADR 0001 and 0002, and an interactive
  handbook (`docs/handbook.html`) teaching the API through five live demos.
- **Scraped and read the official rules and resources.** License detected as MIT in the
  repo's About section — requirement satisfied.

### Later on 2026-09-01 — verification

Built `tools/verify.js` (Playwright, real Chrome via `channel: "chrome"`). Chrome exposes
WebMCP only behind a flag; rather than guess the Chromium feature name, the harness writes
`{"browser":{"enabled_labs_experiments":["enable-webmcp-testing@1","devtools-webmcp-support@1"]}}`
into a throwaway profile's `Local State`, which Chrome applies at startup exactly as it
would for a person who ticked the flag. 17 checks, all passing. `npm run verify`.

It disproved three things this repo asserted:

1. **`requestUserInteraction` does not exist in Chrome 152** — on `document.modelContext`
   or anywhere else. The execute callback's second argument is `undefined`, not even the
   spec'd `{signal}`. The consent gate threw on every attempt. Consent now opens an
   in-page modal, which is also filmable and stylable where `confirm()` was neither.
2. **`getTools({fromOrigins})` is additive, not a filter** — returns the caller's own
   tools plus the listed origins'. Filter on `t.origin`.
3. **Cross-origin registration completes after the partner iframe's `load` event**, so
   sampling once reports a false negative. Polls now.

Also: 7× `toolchange fired` buried the activity panel at startup (coalesced); origin A's
ledger claimed to log every crossing when it can only log ones it brokers (relabelled);
and every cohort returned 2178, so the k-anonymity floor was unreachable without naming
a nonexistent segment — added a rare `luxury-auto-intenders` segment so the never-cut
suppression rule is actually demonstrable.

`tools/capture.js` records the demo by driving the live UI with the same WebMCP calls an
agent makes. First cut is 82s (cap is 3:00), in `.airlock-video/` (gitignored). Beat
timings in `beats.json` for writing narration against.

### Next, in order

1. **Second HTTPS origin.** All repos under one GitHub account share one Pages origin,
   so the pair cannot both live there. Cloudflare Pages, Vercel, Render and Netlify are
   all sponsor-listed and acceptable. Network to all four APIs is reachable from this
   shell now — the earlier Netlify block was transient. Needs the operator to
   authenticate.
2. Re-run `npm run verify` against the deployed HTTPS pair, not just localhost.
3. Record narration over the 82s cut; the beat timings are in `.airlock-video/beats.json`.
4. Submission text.

### Open questions

- ~~Where does `requestUserInteraction` live?~~ **Resolved: nowhere.** It is absent from
  Chrome 152 entirely. Recorded in SPEC §6, LEARNING.md and the handbook.
- **Untested in ChatGPT's in-app browser.** Not fatal; the brief accepts Chrome 149+.

### Notes for the write-up

There are **no sponsor tracks**. The prize page lists a single pool — "WebMCP Challenge
Winners", ten winners — and each winner receives the OpenAI cash plus the Cloudflare,
Vercel, Render, Netlify, Shopify and Chrome prizes together. Nothing to target
separately; choice of host is a deployment decision, not a category.

Judging criteria, verbatim: **WebMCP Leverage** (thorough, non-trivial use),
**Execution** (a complete, coherent product experience — "not just a technical proof of
concept"), **Potential Impact** (a credible, specific case for a real audience),
**Creativity & Ambition**.

The Execution wording is the one to watch. A split-screen developer console reads as a
proof of concept to a judge skimming a gallery; the receipts ledger and quarantine panel
exist partly to answer that.
