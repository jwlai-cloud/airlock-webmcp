// Regenerates docs/VIDEO-SCRIPT.md from the capture's own beats.json, so the written
// script and the recorded cut cannot drift apart.
const fs = require("fs"), path = require("path");
const beats = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../.airlock-video/beats.json")));
const mm = t => `${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, "0")}`;
const total = beats[beats.length - 1].at + beats[beats.length - 1].len + 1.5;

const rows = beats.map((b, i) => {
  const out = i + 1 < beats.length ? beats[i + 1].at : total;
  return `| ${mm(b.at)} | ${mm(out)} | ${b.cap} | ${b.vo} |`;
}).join("\n");

fs.writeFileSync(path.resolve(__dirname, "../docs/VIDEO-SCRIPT.md"), `# Demo video — script

Generated from the capture itself (\`tools/script-doc.js\`), so this and the recorded cut
cannot drift.

**Runtime ${mm(total)}. The limit is a ceiling, not a target** — the rules say the video
"must be less than three (3) minutes", with no minimum, and judges are not required to
watch beyond it. Leave margin; do not aim at 2:59.

The narration is synthesised by \`tools/capture.js\` with macOS \`say\` and mixed onto the
picture at the beat times actually recorded, so audio and picture cannot drift either.

\`\`\`bash
npm run capture                              # default voice, 205 wpm
node tools/capture.js --voice "Karen (Premium)" --rate 190
node tools/capture.js --no-voice             # picture only, to record your own
\`\`\`

To re-record in a human voice, read the narration column against the timestamps and run
\`--no-voice\`, or replace the audio track in an editor. Every beat carries a burned-in
caption, so the cut reads with the sound off; the narration carries the argument, not the
picture.

## Script

| In | Out | On screen | Narration |
|---|---|---|---|
${rows}

## Before upload

- [ ] Runtime under 3:00 with margin.
- [ ] 1920×1080, H.264, AAC audio.
- [ ] Public on YouTube — the rules require publicly visible, not unlisted.
- [ ] Audio present throughout.
- [ ] No third-party trademarks, no copyrighted music.
- [ ] Numbers match the written submission: **2,178** shared, **13,057** incremental,
      **15,235** partner reach, **k = 250**, **4,200** records held, **0** exchanged.
- [ ] Watch once muted — if a beat is unreadable without narration, raise its \`extra\`.
`);
console.log(`docs/VIDEO-SCRIPT.md — ${beats.length} beats, ${mm(total)}`);
