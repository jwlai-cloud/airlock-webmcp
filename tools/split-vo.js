// Splits one continuous narration recording into the per-line clips capture.js expects.
// Record docs/NARRATION.md in a single take, leaving roughly a second of silence between
// lines, then:
//     node tools/split-vo.js my-recording.m4a
// It writes .airlock-video/vo/00.wav .. NN.wav, then:
//     node tools/capture.js --tts file
const { execFileSync, spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

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

console.log(`${path.basename(src)}: ${total.toFixed(1)}s → ${segs.length} segments (expected ${EXPECTED})`);
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
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", src, "-ss", String(Math.max(0, a - 0.12)),
    "-to", String(b + 0.12), "-ar", "44100", "-ac", "2", out]);
});
const spoken = segs.reduce((t, [a, b]) => t + (b - a), 0);
console.log(`\nwrote ${segs.length} clips to ${VO}`);
console.log(`spoken ${Math.floor(spoken / 60)}:${String(Math.round(spoken % 60)).padStart(2, "0")}`);
console.log(`\nnow run:  node tools/capture.js --tts file`);
