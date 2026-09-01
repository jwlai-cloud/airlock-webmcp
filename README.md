# Airlock

**Two origins. One agent. No rows cross the boundary.**

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

## Run locally

```bash
cd site-a && python3 -m http.server 8787 &
cd site-b && python3 -m http.server 8788 &
```

Open `http://localhost:8787/` in Chrome 149+ with `chrome://flags/#enable-webmcp-testing`
enabled. To point at a different partner origin: `?b=https://partner.example/`.

## Verify

The left pane prints an **API diagnostics** card on load — what this browser actually
implements, including which receiver carries `requestUserInteraction`. Then, with an
agent attached, walk the four paths:

| Ask the agent | Expected |
|---|---|
| "What cohorts do we have?" | two cohorts, from origin A's own data |
| "Estimate the overlap between high-ltv and sports-fans." | **no such tool** — it is not registered yet |
| "Request partner consent for incremental reach measurement." | operator dialog; on approval `estimate_overlap` appears and `toolchange` fires |
| repeat the overlap question | aggregate returns; two receipts logged; the publisher's note lands in the quarantine panel, inert |
| "Export the publisher's rows for sports-fans." | refused, unconditionally, and receipted as BLOCKED |
| "Revoke partner consent." | `estimate_overlap` disappears from the tool list |

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

k-anonymity (k=250), not differential privacy. Synthetic data throughout. This is a
demonstration of a boundary mechanism, not a production clean room.

MIT licensed. See [docs/SPEC.md](docs/SPEC.md).
