# ARCHITECTURE — Airlock

Current state, not history. Replace, don't append.

## Shape

Two independent origins, no backend, no third party. Origin A embeds origin B in a
cross-origin iframe carrying `allow="tools"`. Each origin holds its own data and
registers its own WebMCP tools. The browser mediates every crossing.

```
┌─ agent (Chrome built-in / ChatGPT in-app browser) ─────────────┐
│  sees only tools origin A exposes to it                        │
└───────────────────────────┬────────────────────────────────────┘
                            │ getTools / executeTool
┌───────────────────────────▼────────────────────────────────────┐
│ ORIGIN A — advertiser · site-a/index.html                      │
│   data: COHORTS (2 synthetic cohorts, in-page const)           │
│   tools: list_cohorts, request_partner_consent,                │
│          revoke_partner_consent, get_receipts                  │
│          estimate_overlap  ← registered ONLY after consent     │
│   UI:  cohorts | receipts ledger + quarantine | B iframe       │
└───────────────────────────┬────────────────────────────────────┘
                            │ getTools({fromOrigins:[B]})
                            │ executeTool(tool, JSON.stringify(input))
                            │   ── aggregates only, k≥250 ──▶
┌───────────────────────────▼────────────────────────────────────┐
│ ORIGIN B — publisher · site-b/index.html   <iframe allow=tools> │
│   data: ROWS — 4,200 synthetic user rows, never leave           │
│   tools (all registered {exposedTo:[A]}):                       │
│     publisher_segment_reach   → aggregate  (untrustedContentHint)│
│     publisher_overlap_count   → aggregate or {suppressed:true}   │
│     publisher_export_rows     → always refuses                   │
└─────────────────────────────────────────────────────────────────┘
```

## Data flow — `estimate_overlap`

1. Agent calls `estimate_overlap({cohortId, segment})` on origin A. It can only do this
   if consent has already registered the tool.
2. A calls `getTools({fromOrigins:[B_ORIGIN]})`, finds `publisher_segment_reach`,
   invokes it via `executeTool(tool, JSON.stringify(input))`.
3. B computes the aggregate **in its own execution context** over `ROWS`, returns a
   count plus a free-text `note`. No row is serialized.
4. A repeats for `publisher_overlap_count`. Below k=250, B returns `{suppressed:true}`
   and the number never leaves B.
5. A joins the aggregate with its own local cohort size and returns the result. The
   partner's free text is passed through tagged `partnerNoteTrust: untrusted` and is
   rendered in A's UI quarantined, via `textContent`.
6. Every crossing appends to the receipts ledger, visible in A's middle pane and
   readable by the agent through `get_receipts`.

## Enforcement points

| Rule | Enforced where | Mechanism |
|---|---|---|
| K1 k-anonymity, k=250 | origin B, `publisher_overlap_count` | count < K → `{suppressed:true}`, number never returned |
| K2 no rows cross | origin B | no tool can emit a row; `publisher_export_rows` refuses unconditionally |
| K3 consent gates crossing | origin A | `estimate_overlap` unregistered until consent; `AbortController` unregisters on revoke |
| K4 partner text untrusted | both | `untrustedContentHint` annotation + `textContent`-only rendering + quarantine panel |
| K5 every crossing receipted | origin A | append-only `receipts[]`, rendered live, exposed via `get_receipts` |

Origin B's exposure is scoped by `registerTool(tool, {exposedTo:[A_ORIGIN]})`. A third
origin does not receive a denial — it does not learn the tools exist.

## Files

| Path | Role |
|---|---|
| `site-a/index.html` | origin A: whole app, inline. Broker, ledger, quarantine, consent gate. |
| `site-b/index.html` | origin B: whole app, inline. Synthetic rows, three aggregate-only tools. |
| `tools/check.sh` | parses both inline scripts; asserts no HTML sink on either page. |
| `docs/SPEC.md` | locked scope, tool inventory, rules, timeline, risks. |
| `docs/LEARNING.md` | how WebMCP works and why Airlock is built this way. |
| `docs/adr/` | decision records. |

No build step, no dependencies, no package manager. Two static HTML files.

## Configuration

- A finds B at `?b=<url>` (default `http://localhost:8788/`).
- A passes its own origin to B as `?a=<origin>`; B uses it for `exposedTo`.
- So the deployed pair needs no code change — only the two URLs.

## Deployment topology

Two **distinct HTTPS origins** are required; `exposedTo` and `fromOrigins` take
origins, and same-origin would defeat the demonstration. All repos under one GitHub
account share a single Pages origin, so the pair cannot both live on GitHub Pages.

Current: origin A on GitHub Pages; origin B needs a second host (Cloudflare Pages,
Vercel, Netlify and Render are all sponsor-listed and acceptable).

## Known limits

k-anonymity, not differential privacy — repeated queries over varied cohorts still
leak. Synthetic data only. No auth, no persistence, no mobile layout. This
demonstrates a boundary mechanism; it is not a production clean room.
