# Session handoff prompt

Paste the block below to start a fresh session on this project.

---

I'm building **Airlock** for The WebMCP Challenge (https://webmcp.devpost.com/).
**Deadline: 2026-09-03 13:00 PDT.** Repo: https://github.com/jwlai-cloud/airlock-webmcp
(public, MIT, already pushed). Read `docs/SPEC.md` in that repo first — it has the
full tool inventory, rules, timeline and risks. Don't re-litigate the idea; it's locked.

**What Airlock is:** two independent origins, each holding its own first-party data.
The publisher (origin B) registers aggregate-only WebMCP tools and exposes them to the
advertiser (origin A) via `exposedTo`. An agent asks a question needing both sides;
origin A brokers it with `getTools({fromOrigins})` + `executeTool()`. k-anonymised
aggregates cross; rows never do. No backend, no third party. A browser-native data
clean room.

**The submission's core argument:** authority is enforced by *tool existence*, not by a
runtime permission check. `estimate_overlap` is not registered until both operators
consent via `client.requestUserInteraction()`. Before that it is absent from the agent's
tool list — it cannot be called or talked into existence by a prompt injection.

**Verified API facts (Chrome 152 + `chrome://flags/#enable-webmcp-testing`). Published
docs get all three wrong — don't "fix" these back:**
- Entry point is `document.modelContext`, NOT `navigator.modelContext`.
- `executeTool` takes the `RegisteredTool` object from `getTools()`, not a name string.
- Its input must be a JSON string (an object throws `UnknownError: Failed to parse input arguments`); its return is a JSON string too.
- `RegisteredTool` shape: `{annotations, description, inputSchema, name, origin, title, window}`.
- Cross-origin iframe registration needs `allow="tools"`. `exposedTo` accepts `http://localhost`, so local dev needs no HTTPS.

**Current state:** working seed committed. Origin B has `publisher_segment_reach`,
`publisher_overlap_count` (suppresses below k=250), `publisher_export_rows` (always
refuses). Origin A has `list_cohorts`, `request_partner_consent`, `get_receipts`, and
`estimate_overlap` (consent-gated). Split-screen UI, receipt logging. Run with
`cd site-a && python3 -m http.server 8787` and `cd site-b && python3 -m http.server 8788`,
open http://localhost:8787/ in flag-enabled Chrome.

**Constraints:** client-side only, no backend, no database, synthetic data only. Public
repo with a detectable OSS license. Submission needs a live HTTPS URL, a <3-min YouTube
demo with audio, and a written description answering: why WebMCP fits, how it improves
UX, **what people and agents can do together that was impossible before**, and how
WebMCP was implemented.

**Next up (day 1 per the spec):** real UI polish, receipts panel, and the
`untrustedContentHint` boundary for partner-returned text. Then day 2: refusal paths and
polish. Day 3 AM: video and submission text, submit by 12:00 PDT with an hour of buffer.

**Two things still open, neither blocking:** (1) the HTTPS pair — GitHub Pages serves
site-a at https://jwlai-cloud.github.io/airlock-webmcp/site-a/ but site-b needs a second
origin (Netlify Drop; note all repos under one GitHub account share ONE Pages origin, and
this shell can't reach api.netlify.com so CLI auth fails). (2) untested in ChatGPT's
in-app browser — not fatal, the brief accepts Chrome 149+.

Use the `hackathon-engineering` skill during the build, `hackathon-demo-video` for the
video, and `hackathon-submission` for the Devpost write-up.
