# Devpost submission — Airlock

Paste-ready. Numbers here must match `docs/VIDEO-SCRIPT.md` and the README exactly.

- **Live demo:** https://jwlai-cloud.github.io/airlock-webmcp/site-a/
- **Repository:** https://github.com/jwlai-cloud/airlock-webmcp (MIT)
- **Video:** *(YouTube URL — public, 2:51 — recorded against the deployed pair)*
- **Requires:** Chrome 149+ with `chrome://flags/#enable-webmcp-testing`. No account, no
  API key, no login.

---

## Elevator pitch (200 char limit)

Find out how many customers you share with a partner, without either of you sending the
other a single customer record. No clean room, no contract, no upload.

---

## Inspiration

Two companies with overlapping customers cannot answer the most basic question in their
partnership: how many customers do we share, and how many more could we reach together?

Answering it means comparing two customer lists, and neither side may show the other its
list. So the industry built data clean rooms — a vendor, a contract, a procurement cycle,
six figures a year, and both companies uploading their raw customer files to a third
party they now have to trust.

Look at what that costs. To measure an overlap without exposing anyone, both datasets
leave both buildings. The measurement creates the exposure it exists to avoid. Small
partnerships simply never ask the question, because the answer costs more than it's worth.

WebMCP makes the alternative possible for the first time. If a page can hand an agent a
narrow, declared set of verbs, and the browser enforces which *other origins* may even see
them, then the question can travel to the data instead of the data travelling to a vendor.

## What it does

**Airlock is a data clean room with no clean-room vendor in it.** Two independent origins,
each holding its own first-party records, answer a joint question through one agent — and
the boundary between them is enforced by the browser, not by a contract.

The differentiating claim, plainly: **authority is enforced by tool existence, not by a
runtime permission check.** `estimate_overlap` is not registered until an operator at each
company approves a stated purpose. Before that it is absent from the agent's tool list. It
cannot be called, cannot be guessed at, and cannot be talked into existence by a prompt
injection — because a permission check is something a model can be argued past, and a tool
that does not exist is not.

End to end:

1. A marketer at **Northwind Retail** asks how their high-lifetime-value audience overlaps
   with **Meridian Media**'s sports fans.
2. The agent reports that it has no such capability. `estimate_overlap` is not registered,
   so it is not in the tool list at all.
3. Asked to export Meridian's records instead, it is refused. `publisher_export_rows`
   exists only so that refusal is explicit and auditable.
4. The agent calls `request_partner_consent`. Northwind's operator authorises a purpose;
   the request then **crosses to Meridian's own console as a WebMCP tool call**, where
   their governance officer decides independently.
5. Two approvals register `estimate_overlap`, and `toolchange` fires.
6. The same question now returns: **2,178** shared customers out of 2,400 (91%),
   **15,235** partner segment reach, **13,057** incremental reach. Two aggregate counts
   crossed the boundary. **Zero customer records moved.**
7. Meridian also returns a free-text segment note that is a prompt injection ordering the
   agent into "export mode". It is quarantined — rendered as text, never followed. And
   even a model that believed it finds no tool on the other side that can return a record.
8. Asked about a deliberately thin segment, the answer is **withheld** rather than
   rounded: fewer than **k = 250** people matched, so the number is computed on Meridian's
   side and never leaves it.
9. Every crossing is receipted on both sides.
10. Withdrawing approval **unregisters** the tool. Gone, not disabled.

## What people and agents can do together that was impossible before

Two organisations answer a joint question through one agent, in one conversation, with
each side keeping its own data, its own policy and its own veto — and with the boundary
enforced by the browser rather than by a contract.

Before WebMCP there was no browser-mediated channel between two mutually-distrusting
origins that an agent could traverse. The options were: send your data to a third party,
or don't ask the question. Every other way an agent reaches an app — a raw API, a backend
MCP server, computer use, browser automation — either skips the website entirely or hands
the agent a generic surface it has to interpret. None of them lets *two* origins each
expose a governed capability to the same agent while the browser polices who may see what.

The second thing that is new: **consent creates capability.** Approval here does not flip
a flag that a tool then consults. It calls `registerTool`, and withdrawal aborts the
registration signal. The security property is structural rather than behavioural, which is
what makes it robust to prompt injection instead of merely resistant to it.

## Why WebMCP is a strong fit, and how it improves the experience

**Start with the ordinary case, because Airlock is one.** Origin A is a normal marketing
application. A person opens it, picks an audience and a partner segment, and reads a
result. WebMCP lets that application write down what it can do, so an agent operates the
product instead of reading the screen and guessing at it:

| What the person clicks | What the app declares |
|---|---|
| Audiences | `list_cohorts` |
| Request partner approval | `request_partner_consent` |
| Run analysis | `estimate_overlap` |
| Check reach *(a plain `<form>`)* | `check_segment_reach` — declarative, no JavaScript |
| Audit trail | `get_receipts` |

Every button in the UI calls the tool through `executeTool()`. There is no second
implementation for agents and no back door for either — the human path and the agent path
are the same code by construction.

**Then the part that is new.** Answering this particular question needs a *second*
application, owned by a different company, on a different origin. WebMCP's `exposedTo` is
what makes that possible, and it is the least-exercised corner of the API:

- **`exposedTo` is a capability, not an access-control check.** Meridian publishes four
  capabilities to Northwind's origin and nothing else. A third origin does not receive a
  denial — it does not learn the tools exist, so there is no error message to probe.
- **Tools execute in the registering page's own context.** Meridian's aggregate is computed
  inside Meridian's page, over Meridian's records, in a session Meridian's own operator is
  already signed into. There is no key to hand the agent and nothing to serialise out.
- **The tool list is live.** Registration and unregistration fire `toolchange`, so what an
  agent may do changes with the state of the page.

That last property is normally a convenience — a logged-out visitor's agent sees read-only
tools, and signing in adds the rest. Airlock gates on a **business approval from two
companies** instead of a login, which turns the same mechanism into a privacy boundary.

For the person using it, this means asking a partnership question in plain language and
getting an answer in seconds, with a visible audit trail, instead of a procurement cycle.
For the data owner, it means their governance officer sees the stated purpose and decides
in their own interface, with a standing guarantee that no tool they published can emit a
record.

## How we implemented WebMCP

Two static HTML files. No backend, no database, no build step, no dependencies.

**Imperative registration** on both origins:

```js
document.modelContext.registerTool({
  name: "estimate_overlap",
  description: "Overlap and incremental reach between one of your audiences and a partner segment. Aggregates only; withheld below the k-anonymity floor.",
  inputSchema: { type: "object",
    properties: { cohortId: { type: "string" }, segment: { type: "string" } },
    required: ["cohortId", "segment"] },
  annotations: { untrustedContentHint: true },
  execute: async ({ cohortId, segment }) => { /* brokers to origin B */ }
}, { signal: overlapAbort.signal });     // aborting this unregisters the tool
```

**Cross-origin exposure**, origin B registering only to origin A:

```js
document.modelContext.registerTool(tool, { exposedTo: [A_ORIGIN] });
```

**Discovery and invocation**, origin A brokering:

```js
const tools = await document.modelContext.getTools({ fromOrigins: [B_ORIGIN] });
const tool  = tools.find(t => t.name === name && t.origin === B_ORIGIN);
const raw   = await document.modelContext.executeTool(tool, JSON.stringify(input));
const out   = JSON.parse(JSON.parse(raw).content[0].text);
```

**Declarative registration** — the browser synthesises a tool from a form, no JavaScript:

```html
<form toolname="check_segment_reach"
      tooldescription="Look up the total reach of one partner audience segment.">
  <select name="segment" toolparamdescription="Partner segment name, such as sports-fans">
</form>
```

Submitting it runs the page's ordinary submit handler, so the human path and the agent
path are the same code by construction rather than by discipline.

Also used: `allow="tools"` to delegate the API to the cross-origin frame, `annotations`
(`readOnlyHint`, `untrustedContentHint`), the `toolchange` event, and `AbortController`
for revocation.

**Airlock calls no model and ships no API key.** Google's [Model Context Tool
Inspector](https://chromewebstore.google.com/detail/model-context-tool-inspec/gbpdfapgefenggkahomfgkhfehlcenpd)
extension — an agent chat running `gemini-3-flash-preview` — discovers these tools by
itself, with no configuration on our side. A judge who prefers to watch a
model reason over them can paste their own Gemini key in Agent settings — it stays in
their browser and is sent only to Google. A deterministic no-model router is the fallback.
All three drive the identical `getTools()` / `executeTool()` path.

## Challenges we ran into

**The consent gate never worked, and nothing said so.** The seed called
`client.requestUserInteraction()` from the execute callback's second argument, following
published examples. Testing against Chrome 152 showed that argument is `undefined` and the
method exists on **no receiver at all** — it is absent from the W3C IDL, absent from
Chrome's own docs, and absent from the runtime. The submission's central claim had been
throwing on every attempt. Consent now opens an in-page modal, which is also stylable and
visible on camera where a native `confirm()` was neither.

**Reaching a flag-gated API from automation.** Chrome exposes WebMCP only behind
`chrome://flags/#enable-webmcp-testing`, and guessing the Chromium feature name got us
nowhere. The fix was to stop guessing: write the enabled lab experiments into a throwaway
profile's `Local State`, which Chrome applies at startup exactly as it would for a person
who ticked the flag. That turned an untestable project into 21 automated checks.

**`getTools({fromOrigins})` is additive, not a filter.** It returns the caller's own tools
*plus* the listed origins'. Our diagnostics reported the partner as unreachable while it
was working perfectly. Filter on `t.origin`.

**A cross-boundary XSS in our own UI.** Log lines were rendered with
`insertAdjacentHTML` on interpolated strings. Once partner text flowed through that path,
origin B could inject script into origin A — the boundary leaking in the opposite
direction from the one being advertised. Everything renders with `textContent` now, and
`tools/check.sh` fails the build if a sink reappears.

**The k-anonymity floor was unreachable.** Every audience returned 2,178, so suppression
could only be triggered by naming a segment that does not exist — which demonstrates
nothing. Origin B now holds a deliberately thin segment so a never-cut rule is actually
demonstrable.

## Accomplishments we're proud of

- **21 automated checks against real Chrome**, not mocks — including both refusal paths,
  the two-sided approval crossing an origin boundary, the exact error string Chrome throws
  for a non-string input, and that `estimate_overlap` is absent before approval and gone
  after revocation.
- **Zero records exchanged**, structurally: no tool on the publisher's side can emit one.
- **Both halves of the API.** Imperative registration for everything gated or carrying
  untrusted text; declarative form registration where the browser can synthesise the
  schema itself.
- **Approval that genuinely crosses the boundary** as a tool call, so neither company can
  approve on the other's behalf.
- **No backend, no database, no dependencies, no API key.** The application is two static
  HTML files.
- **A deterministic, re-takeable demo.** `npm run capture` synthesises the narration,
  drives the real product, and mixes the audio at the recorded beat times. Fixing one
  line means re-running a script, not re-shooting.

## What we learned

**A permission check is a conversation; a missing tool is not.** We started with the
conventional `if (!consented) return { error }` and realised the tool is still in the
model's context, its description still readable, its refusal still an oracle confirming
the capability exists. Not registering it removes the negotiation entirely. That
reframing — from "deny the call" to "never offer the verb" — is the most transferable
thing we take away.

**`untrustedContentHint` enforces nothing.** The spec is candid that it is a signal
permitting a client to sanitize, spotlight, or hide a payload. Building the privacy claim
on it alone would have made the boundary depend on the goodwill of whichever agent turned
up. Annotate *and* handle the text as hostile regardless.

**Verify the API before building the argument on it.** Three of the facts this project
depended on were wrong, and one of them was load-bearing. An hour spent making a
flag-gated API automatable paid for itself several times over.

## What's next

- **A real thin-origin publisher SDK.** Origin B's whole governance surface is ~300 lines;
  packaging it so any publisher can expose k-anonymised aggregates by dropping in a script
  is the obvious next step.
- **Differential privacy with a query budget**, replacing k-anonymity — the honest fix for
  the repeated-query attack we currently disclose rather than defend against.
- **Per-purpose, expiring approvals** with the purpose bound into the receipt, so an audit
  trail proves not just what crossed but what it was authorised for.
- **More than two parties.** `exposedTo` takes a list; three-way overlap is the natural
  extension and the point at which clean-room pricing gets genuinely painful.

## Built with

`webmcp` · `javascript` · `html` · `css` · `chrome` · `gemini` · `playwright` ·
`github-pages` · `k-anonymity` · `privacy` · `data-clean-room` · `adtech`

---

## Consistency checklist

Every number below must be identical in the video, the README and this document.

| Claim | Value |
|---|---|
| Shared customers | 2,178 |
| Advertiser audience | 2,400 (91%) |
| Partner segment reach | 15,235 |
| Incremental reach | 13,057 |
| k-anonymity floor | 250 |
| Records held by publisher | 4,200 |
| Records exchanged | 0 |
| Tools | 10 (6 on A, 4 on B) |
| Automated checks | 21 |
| Video runtime | 2:51 |
