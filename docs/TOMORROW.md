# Where this stands, and what is left

Deadline: **2026-09-03, 1:00 PM PT.**

## The video

Two cuts exist. Both are compliant; they differ in whether a live model appears.

| File | Runtime | Driven by | State |
|---|---|---|---|
| `/tmp/airlock-router-clean.mp4` | 2:35 | deterministic router | **scanned clean, uploadable** |
| `.airlock-video/airlock-demo.mp4` | varies | one live-model beat | last attempt unverified |

The router cut is the safe deliverable. Copy it into place with:

```bash
cp /tmp/airlock-router-clean.mp4 .airlock-video/airlock-demo.mp4
```

## Why the live-model version keeps failing

Every Gemini model that supports function calling is capped at **5 requests per
minute** on the free tier. One `ask()` costs two or more, so a scripted demo making
several calls in quick succession trips the cap and sits through 30-second retries —
that is what produced a 5:55 render.

The higher-limit models (`gemini-3.1-flash-lite`, `gemini-3.5-flash-lite`: 15 RPM,
500/day) **return 404 when `tools` is present**. They cannot drive this at all.

So a live model in the recording is possible but fragile, and it is worth remembering
that the app itself demonstrates it far better: a judge pastes their own key and watches
real Gemini call real tools. That path is verified working on the deployed site.

## To try the live-model cut tomorrow

Daily caps reset at midnight Pacific. Do not spend requests testing first.

```bash
export $(grep -E '^GEMINI_API_KEY=' .env | xargs)
node tools/capture.js --tts file --with-key --tempo 1.08 \
  --base https://jwlai-cloud.github.io/airlock-webmcp/site-a/
```

Then **scan the whole timeline before trusting it** — twice a render has looked fine by
duration and codec while showing rate-limit notices on screen:

```bash
for t in $(seq 6 7 165); do
  ffmpeg -y -loglevel error -ss $t -i .airlock-video/airlock-demo.mp4 \
    -frames:v 1 /tmp/scan/f$(printf %03d $t).png
done
```

If it fights the limit again, ship the router cut. It says nothing untrue and loses only
the on-camera model.

## Everything else is done

- Live pair: `jwlai-cloud.github.io` + `rawcdn.githack.com`, **25 + 12 checks passing**
- Repo public, MIT, all work pushed
- `docs/FORM.md` — every Devpost field paste-ready
- `docs/SUBMISSION.md` — the four required questions
- Four gallery images in `docs/diagrams/`, two slides in `docs/slides/`
- Narration: 25 clips backed up at `/tmp/vo-full-backup`

## Four fields only you can fill

Country of residence · submitter type (individual vs. organisation — a real ownership
decision) · the two learning questions.

## Before submitting

- [ ] Watch the final cut end to end **with sound**
- [ ] YouTube upload is **public**, not unlisted
- [ ] `docs/FORM.md` runtime matches the cut you upload
