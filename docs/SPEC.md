# SPEC — Airlock

WebMCP Challenge submission. Deadline **2026-09-03 13:00 PDT**.

## 1. Problem

Two companies each hold first-party data about overlapping audiences. They want one
number — how much do our audiences overlap, what was the incremental reach — and
neither may see the other's rows. Today that means a data clean room: a third-party
service, a procurement cycle, six figures, and both parties uploading their raw data
to someone else's infrastructure.

## 2. What Airlock does

Two independent origins. Each registers WebMCP tools over its own data and exposes
them **only** to the other via `exposedTo`. An agent asks a question that needs both
sides. The advertiser's page brokers it: discovers the publisher's tools with
`getTools({fromOrigins})`, invokes them with `executeTool()`, receives k-anonymised
aggregates, combines with its own rows locally.

No raw rows cross the boundary. No backend. No third party. The browser is the
clean room.

## 3. What people and agents can do together that was impossible before

Two organisations answer a joint question through one agent, in one conversation,
with each side keeping its own data, its own policy, and its own veto — and with
the boundary enforced by the browser rather than by a contract.

Before WebMCP there was no browser-mediated channel between two origins that an
agent could traverse. The options were: send your data to a third party, or don't
ask the question.

## 4. Tool inventory

### Origin B — publisher (data holder)

Registered with `{ exposedTo: [ORIGIN_A] }`.

| Tool | Input | Annotations | Returns |
|---|---|---|---|
| `publisher_segment_reach` | `{segment}` | `readOnlyHint` | `{segment, reach, k}` — aggregate only |
| `publisher_overlap_count` | `{segment, cohortId}` | `readOnlyHint` | `{count}`, or `{suppressed:true, reason}` when `count < K` |
| `publisher_export_rows` | `{segment}` | — | **Always refuses.** Exists so the refusal is visible and the boundary is demonstrable, not implied. |

### Origin A — advertiser (broker)

Registered for the visiting agent.

| Tool | Input | Annotations | Returns |
|---|---|---|---|
| `list_cohorts` | `{}` | `readOnlyHint` | local cohorts, counts |
| `request_partner_consent` | `{purpose}` | — | Wraps `client.requestUserInteraction()`. Both sides' operators approve the stated purpose. On grant, registers `estimate_overlap`. |
| `estimate_overlap` | `{cohortId, segment}` | — | **Not registered until consent is granted.** Brokers to B, applies k-anonymity, returns aggregate. |
| `get_receipts` | `{}` | `readOnlyHint` | every boundary crossing, ordered |

### The mechanism that carries the submission

Authority is enforced by **tool existence**, not by a runtime permission check.
`estimate_overlap` does not exist in the agent's tool list before consent. It cannot
be called, cannot be guessed at, and cannot be talked into existence by a prompt
injection. Consent registers it; revocation unregisters it; each transition fires
`toolchange`.

## 5. Rules

| # | Rule | Effect |
|---|---|---|
| K1 | k-anonymity threshold K=250 | counts below K return `{suppressed:true}`, never the number |
| K2 | No row-level data crosses the boundary, ever | `publisher_export_rows` refuses unconditionally |
| K3 | Cross-boundary queries require consent from both operators | `estimate_overlap` unregistered until granted |
| K4 | Partner-returned text is untrusted | `untrustedContentHint` on anything free-text from B |
| K5 | Every crossing is receipted | append-only log, visible in both UIs |

## 6. Verified API behaviour

Established by spike on Chrome 152 with `chrome://flags/#enable-webmcp-testing`.
Published docs get all three of these wrong.

```js
const tools = await document.modelContext.getTools({ fromOrigins: [B_ORIGIN] });
const tool  = tools.find(t => t.name === "publisher_segment_reach");
const raw   = await document.modelContext.executeTool(tool, JSON.stringify({ segment }));
const out   = JSON.parse(raw);   // { content: [{ type: "text", text: "..." }] }
```

- `executeTool` takes the **`RegisteredTool` object**, not a name string.
- Its input is a **JSON string**; an object throws `UnknownError: Failed to parse input arguments`.
- Its return is a **JSON string**, not an object.
- `RegisteredTool` shape: `{ annotations, description, inputSchema, name, origin, title, window }`.
- Cross-origin iframe registration needs `allow="tools"`.
- `exposedTo` accepts `http://localhost` — local dev needs no HTTPS.

## 7. Scope

**In:** two origins, 7 tools, k-anonymity, consent gate, receipts, split-screen UI
showing both sides, synthetic data, deployed HTTPS pair.

**Out:** no backend, no database, no real data, no auth, no mobile layout, no
differential privacy (k-anonymity only — say so plainly rather than overclaiming).

## 8. Timeline

| When | Work | Gate |
|---|---|---|
| Aug 31 PM | Repo, license, seed both sites, deploy pair | Cross-origin call green over HTTPS |
| Sep 1 | Real tool set, k-anonymity, receipts, split-screen UI | Agent answers an overlap question end to end |
| Sep 2 | Consent gate + dynamic registration, refusal paths, untrusted-content boundary, polish | Happy path and both refusal paths work |
| Sep 3 AM | Video, README, submission text | **Submit by 12:00 PDT** |

Cut order if behind: receipts replay → `untrustedContentHint` panel → split-screen
(show one side) → `publisher_overlap_count` (keep reach only).

Never cut: `exposedTo` boundary, k-anonymity suppression, consent-gated registration,
the row-export refusal.

## 9. Risks

1. **Legibility.** "Federated aggregate query" is abstract. Fix: the money shot is the
   agent asking for rows and being refused while a k-anonymised number crosses.
   One frame, no jargon.
2. **Untested in ChatGPT's in-app browser.** Not fatal — the brief accepts Chrome 149+
   as an alternative, and Chrome is already verified green.
3. **Overclaiming privacy.** k-anonymity is not differential privacy. State the limit
   in the README before a judge does.
