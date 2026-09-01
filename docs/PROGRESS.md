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

### Next, in order

1. **Verify the consent path in flag-enabled Chrome.** Which branch
   `withUserInteraction` takes is unknown until someone runs it. This gates the
   submission's central claim; do it before anything else.
2. **Second HTTPS origin.** All repos under one GitHub account share one Pages origin,
   so the pair cannot both live there. Cloudflare Pages, Vercel, Render and Netlify are
   all sponsor-listed and acceptable. Network to all four APIs is reachable from this
   shell now — the earlier Netlify block was transient. Needs the operator to
   authenticate.
3. Exercise both refusal paths end to end against the deployed pair.
4. Video, then submission text.

### Open questions

- **Does `requestUserInteraction` live on the execute callback's options argument or on
  `document.modelContext`?** Unresolved from documentation — neither the W3C IDL nor
  Chrome's docs mention it at all. Mitigated in code, but the answer should be recorded
  here once observed, and the LEARNING.md errata table updated.
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
