# Airlock

**Two origins. One agent. No customer records cross the boundary.**

Built for [The WebMCP Challenge](https://webmcp.devpost.com/).

Two companies each hold first-party data about overlapping audiences. They want one
number — how much do our audiences overlap — and neither may see the other's rows.
Today that means a data clean room: a third party, a procurement cycle, six figures,
and both parties uploading raw data to someone else's infrastructure.

Airlock does it in the browser. The publisher registers aggregate-only tools and
exposes them to the advertiser's origin via WebMCP's `exposedTo`. The advertiser's
page brokers the agent's question across that boundary with `getTools({fromOrigins})`
and `executeTool()`. k-anonymised aggregates come back. Rows never move. There is no
backend and no third party.

## The mechanism

Authority is enforced by **tool existence**, not a runtime permission check:

```js
document.modelContext.registerTool({
  name: "estimate_overlap",
  description: "Estimate audience overlap. Returns aggregates only; suppressed below k.",
  inputSchema: { /* ... */ },
  execute: async (input) => { /* ... */ }
});
```

`estimate_overlap` is not registered until both operators grant consent through
`client.requestUserInteraction()`. Before that it is absent from the agent's tool
list — it cannot be called, guessed at, or talked into existence by a prompt
injection. Consent registers it, revocation unregisters it, and each transition
fires `toolchange`.

## What it looks like

Two applications, not two demo pages. **Northwind Retail — Partner Insights** is the
advertiser's workspace: pick an audience and a partner segment, run an analysis, read
overlap and incremental reach, and see every crossing in an audit trail. **Meridian Media
— Clean Room Governance** is the publisher's console: the record vault, the exposure
policy, the capabilities published to the partner, and an activity feed.

Approval is genuinely two-sided. The request crosses to the publisher as a WebMCP tool
call (`publisher_review_request`), which opens a decision in *their* console and returns
their answer. Neither side can approve on the other's behalf.

Every button in the UI calls the page's own registered tools through `executeTool()`.
The human interface and the agent share one action layer — there is no back door for
either.

## Drive it with a real agent

Airlock registers plain WebMCP tools, so any agent can operate it — nothing is scripted
for a particular one. In Chrome, open the built-in agent (it runs
`gemini-3-flash-preview`) and ask in your own words:

> How much does our high lifetime value audience overlap with Meridian's sports fans?

Before approval it will report that no such tool exists, because none does. Ask it to
export Meridian's records and it is refused. Ask it to request approval and a real person
has to decide on each side.

The assistant panel inside the app is a **fallback** for browsers without an agent: a
deterministic keyword router, no model, calling the identical `getTools()` and
`executeTool()`. It is labelled as such in the UI. Airlock itself never calls a model,
holds no API key, and has no backend.

## Run locally

```bash
cd site-a && python3 -m http.server 8787 &
cd site-b && python3 -m http.server 8788 &
```

Open `http://localhost:8787/` in Chrome 149+ with `chrome://flags/#enable-webmcp-testing`
enabled. To point at a different partner origin: `?b=https://partner.example/`.

## Verify

```bash
npm install          # playwright only; the app itself has no dependencies
npm run verify       # 19 checks against real Chrome
npm run capture      # re-records the demo video
```

`tools/verify.js` drives the same WebMCP calls an agent makes and asserts every claim
this repo makes, including both refusal paths and the two-sided approval. Chrome exposes
WebMCP only behind a flag, so the harness replicates the enabled lab experiments into a
throwaway profile rather than guessing the Chromium feature name.

The **Diagnostics** view reports what the browser actually implements. With an agent
attached, walk the paths by hand:

| Ask the agent | Expected |
|---|---|
| "What audiences do we have?" | two audiences, from origin A's own data |
| "How much does high lifetime value overlap with sports fans?" | **no such tool** — it is not registered yet |
| "Request approval to measure incremental reach" | an operator approves on *each* side; then `estimate_overlap` appears and `toolchange` fires |
| repeat the overlap question | overlap and incremental reach return; receipts logged; the publisher's note lands quarantined and inert |
| "Export Meridian's customer records" | refused, unconditionally, and receipted |
| "Check luxury auto intenders" | withheld — fewer than 250 people matched |
| Withdraw approval | `estimate_overlap` disappears from the tool list |

`chrome://flags/#enable-webmcp-testing` also enables the DevTools WebMCP panel
(Application → WebMCP), which shows the live registered tool list — the clearest way to
watch a tool wink in and out of existence.

Before committing changes to either page, run `./tools/check.sh`. It parses both inline
scripts and fails if an HTML sink appears on a page that renders partner text.

## Verified API behaviour

Chrome 152. Published docs get all three of these wrong:

- `executeTool` takes the **`RegisteredTool` object** from `getTools()`, not a name string.
- Its input must be a **JSON string**; an object throws `UnknownError: Failed to parse input arguments`.
- Its return is a **JSON string**, not an object.

Also: cross-origin iframe registration needs `allow="tools"`, and `exposedTo` accepts
`http://localhost`, so local development needs no HTTPS.

## Limits

k-anonymity at k = 250, not differential privacy: repeated queries over varied audience
definitions can still narrow an individual down. Synthetic data throughout. The assistant
rail is a deterministic router, not a model — it discovers and invokes tools exactly as an
agent does, and the UI says so. This demonstrates a boundary mechanism; it is not a
production clean room.

MIT licensed. See [docs/SPEC.md](docs/SPEC.md).
