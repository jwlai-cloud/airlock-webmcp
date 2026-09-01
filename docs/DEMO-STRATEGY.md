# Demo strategy

## The objection this is built to defuse

Most people meet WebMCP through the storefront example: a site declares `add_to_cart` so
an agent can shop without reading pixels. A judge holding that picture can look at a
cross-origin clean room and think *this isn't really a WebMCP use case.*

It is — the canonical one, with one addition. So the demo establishes the ordinary case
**first**, and only then introduces the second origin. Lead with the boundary and the
audience is evaluating an unfamiliar claim; lead with the app and they are watching a
familiar thing do something new.

## Beat order, and why

| # | Beat | Doing what |
|---|---|---|
| 1–4 | The problem | Clean rooms cost six figures, and both datasets leave the building to measure a thing that is supposed to protect people. |
| 5 | **An ordinary web app** | Establishes the familiar frame before anything unusual happens. |
| 6 | **The app declares what it can do** | The Diagnostics view, showing registered tools next to the buttons that call them. This is the canonical WebMCP story, on screen. |
| 7 | **An agent operates it** | No screenshots, no guessing. Still entirely familiar. |
| 8 | **The twist** | This answer needs a second app, at another company, on another origin. |
| 9–11 | Two refusals | The tool is not registered; the records are refused. The security argument lands *after* the audience is oriented. |
| 12–14 | Two-sided approval | The request crosses to the publisher's console. Consent creates the capability. |
| 15 | The answer | 2,178 shared, 13,057 incremental, zero records moved. |
| 16–18 | Injection, k-anonymity | Both defences shown failing safely. |
| 19–21 | Audit, `exposedTo`, the API | The mechanism, once the behaviour is understood. |
| 22–23 | Revocation, close | Withdrawal unregisters. Restate the claim. |

## What the demo must not do

- **Do not open with the security claim.** "Authority by tool existence" means nothing to
  someone who has not yet seen the tool list.
- **Do not describe the tools before showing the app.** The tool table reads as
  configuration until you have seen the buttons it corresponds to.
- **Do not let the assistant look like the product.** The product is the workspace. The
  assistant panel is one of three ways to drive it, and the video should show a button and
  an agent reaching the same tool.

## Letting a judge try it themselves

The Overview leads with how to drive it from a real agent, because the strongest
demonstration is one the judge runs. Three paths, none needing a key from us:

1. **Chrome's built-in agent** — runs `gemini-3-flash-preview`, discovers these tools with
   no setup. Ask it the overlap question before approving anything; it will report that no
   such tool exists, because none does.
2. **Their own Gemini key** in Agent settings — kept in their browser, sent only to Google.
3. **The built-in router** — no model, for a browser without an agent. Labelled as such.

Ask a real agent to export the records. Watch it be refused. That is the demonstration
that cannot be faked, and it is why the tool descriptions are written as prompts rather
than documentation.
