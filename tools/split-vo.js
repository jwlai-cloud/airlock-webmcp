// Splits one continuous narration recording into the per-line clips capture.js expects.
// Record docs/NARRATION.md in a single take, leaving roughly a second of silence between
// lines, then:
//     node tools/split-vo.js my-recording.m4a
// It writes .airlock-video/vo/00.wav .. NN.wav, then:
//     node tools/capture.js --tts file
const { execFileSync, spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// ElevenLabs renders its break tags inconsistently -- three takes of the same voice at
// the same settings needed 1.15s, 0.70s and 1.25s. Rather than make that a manual knob,
// sweep for the threshold that yields exactly the number of beats the script has.
const src = process.argv[2];
const GAP = parseFloat(process.argv[3] || "1.15");   // silence long enough to count as a break
const FLOOR = process.argv[4] || "-40dB";            // anything quieter counts as silence
if (!src) { console.error("usage: node tools/split-vo.js <recording> [minGap=0.55] [floor=-34dB]"); process.exit(1); }

const VO = path.resolve(__dirname, "../.airlock-video/vo");
const EXPECTED = (fs.readFileSync(path.join(__dirname, "capture.js"), "utf8")
  .match(/^\s*\{ cap:/gm) || []).length;

const sh = (c, a) => execFileSync(c, a, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
const total = parseFloat(sh("ffprobe",
  ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", src]).trim());

// silencedetect writes to stderr, and ffmpeg exits 0, so this must be read from
// stderr explicitly rather than from a thrown error or from stdout.
const probe = spawnSync("ffmpeg", ["-hide_banner", "-i", src,
  "-af", `silencedetect=noise=${FLOOR}:d=${GAP}`, "-f", "null", "-"],
  { encoding: "utf8", maxBuffer: 1 << 26 });
const log = String(probe.stderr || "");

const starts = [...log.matchAll(/silence_start:\s*([\d.]+)/g)].map(m => +m[1]);
const ends = [...log.matchAll(/silence_end:\s*([\d.]+)/g)].map(m => +m[1]);

// speech runs from the end of one silence to the start of the next
const segs = [];
let cursor = ends.length && starts.length && ends[0] < starts[0] ? ends[0] : 0;
for (let i = 0; i < starts.length; i++) {
  if (starts[i] > cursor + 0.25) segs.push([cursor, starts[i]]);
  cursor = ends[i] ?? starts[i];
}
if (cursor < total - 0.25) segs.push([cursor, total]);

let chosen = GAP;
if (segs.length !== EXPECTED && process.argv[3] === undefined) {
  for (const g of [0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.7]) {
    const probe = spawnSync("ffmpeg", ["-hide_banner", "-i", src,
      "-af", `silencedetect=noise=${FLOOR}:d=${g}`, "-f", "null", "-"],
      { encoding: "utf8", maxBuffer: 1 << 26 });
    const log2 = String(probe.stderr || "");
    const st2 = [...log2.matchAll(/silence_start:\s*([\d.]+)/g)].map(m => +m[1]);
    const en2 = [...log2.matchAll(/silence_end:\s*([\d.]+)/g)].map(m => +m[1]);
    const out = []; let cur = en2.length && st2.length && en2[0] < st2[0] ? en2[0] : 0;
    for (let i = 0; i < st2.length; i++) {
      if (st2[i] > cur + 0.25) out.push([cur, st2[i]]);
      cur = en2[i] ?? st2[i];
    }
    if (cur < total - 0.25) out.push([cur, total]);
    if (out.length === EXPECTED) { segs.length = 0; segs.push(...out); chosen = g; break; }
  }
}

console.log(`${path.basename(src)}: ${total.toFixed(1)}s → ${segs.length} segments (expected ${EXPECTED})`
            + (chosen !== GAP ? `  [auto-tuned gap ${chosen}s]` : ""));
if (segs.length !== EXPECTED) {
  console.log(`\nSegment count does not match the script.`);
  console.log(`Leave a clearer pause between lines, or retry with a different gap/floor:`);
  console.log(`   node tools/split-vo.js ${src} 0.4 -30dB`);
  console.log(`\nDetected segments:`);
  segs.forEach(([a, b], i) => console.log(`  ${String(i).padStart(2, "0")}  ${a.toFixed(1)}–${b.toFixed(1)}s  (${(b - a).toFixed(1)}s)`));
  process.exit(1);
}

fs.mkdirSync(VO, { recursive: true });
segs.forEach(([a, b], i) => {
  const out = path.join(VO, String(i).padStart(2, "0") + ".wav");
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", src, "-ss", String(Math.max(0, a - 0.05)),
    "-to", String(b + 0.08), "-ar", "44100", "-ac", "2", out]);
});
const spoken = segs.reduce((t, [a, b]) => t + (b - a), 0);
console.log(`\nwrote ${segs.length} clips to ${VO}`);
console.log(`spoken ${Math.floor(spoken / 60)}:${String(Math.round(spoken % 60)).padStart(2, "0")}`);
console.log(`\nnow run:  node tools/capture.js --tts file`);
