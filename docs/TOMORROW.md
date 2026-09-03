# The live-model cut — what is actually wrong, and the window to fix it

## The finding that cost two renders

A prompt is not a request. One tool-calling turn is a loop of four or five API
calls, and the free tier allows **five per minute and twenty per day, per model
name**. So a single question can exhaust its own model's minute, and about four
questions exhaust its whole day.

Two consequences, both of which I got wrong first:

- **Pacing between questions does nothing.** The 429s came from the suggestion
  chips, which ran unpaced on whatever model was last set. Pacing now runs inside
  `pace()`, called by both `ask()` and `chip()`.
- **The model pool is the budget.** Six model names is six daily buckets.
  Flash-lite names are excluded: they 404 when the request carries tools.

## The second finding

An earlier contact sheet appeared to show a live model calling
`request_partner_consent`. It did not — those beats ran with `setModel(false)`,
so what the sheet showed was the deterministic router. There is still no
evidence either way about whether a live model reaches for approval on its own,
because every attempt so far has been rate-limited before it got the chance.
`tools/probe-approval.js` answers that question for one prompt's worth of quota.

## The window

Daily caps reset at **midnight Pacific**. Do not spend requests testing before
then — a probe costs the same bucket as a beat.

```bash
export $(grep -E '^GEMINI_API_KEY=' .env | xargs)

# 1. one prompt: does a live model open the consent modal at all?
node tools/probe-approval.js gemini-3.8-flash

# 2. only if that says MODAL OPENED: true
node tools/capture.js --tts file --with-key --tempo 1.08 \
  --base https://jwlai-cloud.github.io/airlock-webmcp/site-a/
```

The render now reports `no rate limiting during the take` or the count it hit, so
the log answers the question the duration never could.

## Then look at every frame, not the duration

Twice a render passed on duration and codec while showing rate-limit notices on
screen. `tools/scan-cut.sh` builds a contact sheet of the assistant rail across
the whole timeline:

```bash
tools/scan-cut.sh .airlock-video/airlock-demo.mp4 /tmp/scan.png
```

## The fallback

`.airlock-cuts/router-232.mp4` (2:32) is verified clean. It says nothing untrue
and loses only the on-camera model — the app itself still demonstrates the live
path better than any recording, because a judge pastes their own key and watches
real Gemini call real tools.
