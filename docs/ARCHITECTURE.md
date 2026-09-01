# ARCHITECTURE — Airlock

Current state, not history. Replace, don't append.

## Shape

Two independent origins, no backend, no third party, no dependencies. Origin A embeds
origin B in a cross-origin iframe carrying `allow="tools"`. Each origin holds its own
data and registers its own WebMCP tools. The browser mediates every crossing.

```
┌─ agent ────────────────────────────────────────────────────────────────┐
│  Chrome's built-in agent (gemini-3-flash-preview) · the judge's own     │
│  Gemini key · or the in-app deterministic router. All three use the     │
│  identical getTools() / executeTool() path.                             │
└───────────────────────────┬────────────────────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────────────────────┐
│ ORIGIN A — Northwind Retail · "Partner Insights" · site-a/index.html    │
│   data: 2 audiences (9,100 and 2,400 people), in-page constants         │
│   tools:                                                                │
│     list_cohorts               readOnlyHint                             │
│     request_partner_consent    two-sided; registers estimate_overlap    │
│     revoke_partner_consent     aborts the registration signal           │
│     get_receipts               readOnlyHint · untrustedContentHint      │
│     check_segment_reach        DECLARATIVE — synthesised from a <form>  │
│     estimate_overlap           NOT REGISTERED until both sides approve  │
│   views: Overview · Partner insights · Audiences · Partners ·           │
│          Audit trail · Diagnostics · Agent settings                     │
└───────────────────────────┬────────────────────────────────────────────┘
                            │ getTools({fromOrigins:[B]})
                            │ executeTool(tool, JSON.stringify(input))
                            │   ── aggregates only, k ≥ 250 ──▶
┌───────────────────────────▼────────────────────────────────────────────┐
│ ORIGIN B — Meridian Media · "Clean Room Governance" · site-b/index.html │
│                                    <iframe allow="tools">              │
│   data: 4,200 synthetic user records, 4 segments — never leave          │
│   tools, all registered { exposedTo: [A] }:                             │
│     publisher_segment_reach    aggregate · readOnly + untrustedContent  │
│     publisher_overlap_count    aggregate or { suppressed: true }        │
│     publisher_export_rows      refuses, unconditionally                 │
│     publisher_review_request   opens a decision in B's own console      │
└─────────────────────────────────────────────────────────────────────────┘
```

Ten tools. Six on A (one declarative, one consent-gated), four on B.

## Data flow — one overlap analysis

1. An agent calls `estimate_overlap({cohortId, segment})` on origin A. It can only do
   this if approval has already registered the tool.
2. A calls `getTools({fromOrigins:[B_ORIGIN]})` and filters on `t.origin` —
   `fromOrigins` is additive, so the call also returns A's own tools.
3. A invokes `publisher_segment_reach` via `executeTool(tool, JSON.stringify(input))`.
4. B computes the aggregate **in its own execution context** over its records and
   returns a count plus a free-text `note`. No record is serialised.
5. A invokes `publisher_overlap_count`. Below k = 250 B returns `{suppressed:true}` and
   the number never leaves B.
6. A joins the aggregate with its own audience size and renders overlap, share of
   audience, partner reach and incremental reach. The partner's free text is tagged
   `partnerNoteTrust: untrusted` and rendered quarantined via `textContent`.
7. Every crossing appends to the audit trail, visible in A's Audit view and readable by
   the agent through `get_receipts`.

## Approval — two-sided, over the boundary

1. The agent calls `request_partner_consent({purpose})` on A.
2. A opens a modal for Northwind's operator. Declining stops here.
3. A calls B's `publisher_review_request({purpose})` **across the origin boundary**.
   The rail surfaces B's console while they decide, and hands it back afterwards.
4. B opens a modal for Meridian's governance officer and returns their decision.
5. Only on two approvals does A call `registerTool(estimate_overlap, {signal})`.
6. `revoke_partner_consent` aborts that signal, which unregisters the tool. Each
   transition fires `toolchange`.

## Enforcement points

| Rule | Enforced where | Mechanism |
|---|---|---|
| k-anonymity, k = 250 | origin B | count < K → `{suppressed:true}`; the number is never returned |
| no records cross | origin B | no tool can emit a record; `publisher_export_rows` refuses unconditionally |
| approval gates the crossing | both | `estimate_overlap` unregistered until *both* operators approve; `AbortController` unregisters on revoke |
| partner text is untrusted | both | `untrustedContentHint` + `textContent`-only rendering + a quarantine panel |
| every crossing receipted | origin A + B | append-only log on each side, exposed via `get_receipts` |

Origin B's exposure is scoped by `registerTool(tool, {exposedTo:[A_ORIGIN]})`. A third
origin does not receive a denial — it does not learn the tools exist.

## Agents

Airlock calls no model and holds no key. Three ways in, all through the same tools:

| Path | Model | Key |
|---|---|---|
| Chrome's built-in agent | `gemini-3-flash-preview` | none — the browser's |
| Agent settings → paste your own | default `gemini-flash-latest` | the user's, in their browser only |
| In-app assistant | none — deterministic router | none |

The BYO-key path does real function calling: it declares whatever `getTools()` returns
*that turn*, re-read each turn because approval registers a tool mid-conversation. Before
approval `estimate_overlap` is absent from the declarations, so the model is never told
it exists.

## Files

| Path | Role |
|---|---|
| `site-a/index.html` | origin A: the whole application, inline. No dependencies. |
| `site-b/index.html` | origin B: the whole application, inline. No dependencies. |
| `tools/check.sh` | parses both inline scripts; fails if an HTML sink appears |
| `tools/verify.js` | 21 checks against real Chrome via Playwright |
| `tools/capture.js` | synthesises narration, records the demo, mixes the audio |
| `tools/script-doc.js` | regenerates `docs/VIDEO-SCRIPT.md` from the capture |
| `tools/deploy-publisher.sh` | publishes origin B to a GitHub organisation origin |

## Deployment topology

Two **distinct HTTPS origins** are required; same-origin documents see each other's tools
automatically, which would defeat the demonstration. Every repo under one GitHub account
shares a single Pages origin, so the pair cannot both live there.

- Origin A — GitHub Pages: `https://jwlai-cloud.github.io/airlock-webmcp/site-a/`
- Origin B — githack: `https://rawcdn.githack.com/jwlai-cloud/airlock-webmcp/master/site-b/index.html`

githack is a static file host only. It serves the page and sees none of the data, which
stays inside the two browser contexts. `tools/deploy-publisher.sh` publishes to a GitHub
organisation origin instead, which is tidier long-term.

## Known limits

k-anonymity at k = 250, not differential privacy — repeated queries over varied audience
definitions can still narrow an individual down. Synthetic data throughout. No auth, no
persistence, no mobile layout. This demonstrates a boundary mechanism; it is not a
production clean room.
