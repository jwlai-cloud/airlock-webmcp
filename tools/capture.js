// Records the Airlock demo end to end: synthesises the narration, drives the real
// product through the same WebMCP calls an agent makes, holds each caption for exactly
// as long as its line takes to read, then mixes the voice track onto the video at the
// beat times actually recorded. Deterministic and re-takeable -- change one line and
// re-run; there is no re-shoot.
//
//   node tools/capture.js [--voice "Samantha"] [--no-voice]
const { chromium } = require("playwright");
const { execFileSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf(k); return i < 0 ? d : argv[i + 1]; };
const VOICE = arg("--voice", "Karen (Premium)");
const RATE = arg("--rate", "202");        // words per minute; macOS default is ~175
const NO_VOICE = argv.includes("--no-voice");

// "say"    -- macOS built-in, no credentials
// "gcp"    -- Cloud Text-to-Speech, needs a project you can use
// "gemini" -- Gemini TTS via an AI Studio key in GEMINI_API_KEY; no IAM involved
// "eleven" -- ElevenLabs, one request per line, so segmentation is exact and no
//             silence-splitting is needed. Needs ELEVENLABS_API_KEY.
// "file"   -- your own recording: .airlock-video/vo/00.wav .. 22.wav, one per line.
//             Record a single take and run tools/split-vo.js to produce them.
const TTS = arg("--tts", "say");
const GEMINI_VOICE = arg("--gemini-voice", "Charon");
const EL_VOICE = arg("--voice-id", "");                       // see --list-voices
const EL_MODEL = arg("--eleven-model", "eleven_multilingual_v2");
const GCP_VOICE = arg("--gcp-voice", "en-US-Chirp3-HD-Charon");
const GCP_PROJECT = arg("--project", process.env.GOOGLE_CLOUD_PROJECT || "");

const OUT = path.resolve(__dirname, "../.airlock-video");
const VO = path.join(OUT, "vo");
const A = "http://localhost:8787/";

// Chrome exposes WebMCP only behind chrome://flags/#enable-webmcp-testing. Rather than
// guess the Chromium feature name, replicate the enabled lab experiments into a
// throwaway profile -- Chrome applies them at startup exactly as it would for a human.
function profile() {
  const dir = path.resolve(__dirname, ".airlock-profile");
  fs.mkdirSync(path.join(dir, "Default"), { recursive: true });
  fs.writeFileSync(path.join(dir, "Local State"), JSON.stringify({
    browser: { enabled_labs_experiments: ["devtools-webmcp-support@1", "enable-webmcp-testing@1"] }
  }));
  return dir;
}
const sh = (c, a) => execFileSync(c, a, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
const dur = f => parseFloat(sh("ffprobe",
  ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", f]).trim());

/* ── the script ──────────────────────────────────────────────────────────────
   `cap` is burned into the picture so the cut reads with the sound off. `vo` is
   read aloud over it. `go` runs before the caption appears. `extra` adds hold on
   top of the spoken length, for beats where the screen needs longer than the line. */
const SCRIPT = [
  // ---- the pain point, first -----------------------------------------------
  { cap: "Two companies. One question neither can answer.",
    vo: "Two companies have customers in common, and a question neither of them can answer alone. How many do we share? And how many more could we reach?",
    go: async p => { await p.click('nav a[data-view="overview"]'); } },

  { cap: "Neither is allowed to see the other's customer records.",
    vo: "Answering it means comparing two customer lists. Neither is allowed to show the other its list." },

  { cap: "Today: a clean-room vendor, a contract, six figures, and weeks.",
    vo: "So today they hire a data clean room. Six figures a year, and both companies upload their customer files to a third party.",
    extra: 0.3 },

  { cap: "The data leaves both buildings to answer one question.",
    vo: "To measure an overlap safely, both lists leave the building. The measurement creates the risk.",
    extra: 0.25 },

  // ---- why WebMCP is the right tool ----------------------------------------
  { cap: "WebMCP lets a page hand an agent a narrow set of verbs.",
    vo: "WebMCP changes that. A page hands an agent a narrow set of verbs, and the browser enforces which origins can see them.",
    extra: 0.2 },

  { cap: "So the question can travel instead of the data.",
    vo: "So the question travels to the data. The browser is the clean room.",
    extra: 0.2 },

  // ---- the product ---------------------------------------------------------
  { cap: "Airlock: two ordinary web apps, on two different origins.",
    vo: "This is Airlock. Two ordinary web apps on two different origins. An advertiser's workspace, and live on the right, the publisher's own console.",
    go: async p => { await p.click('nav a[data-view="analysis"]'); }, extra: 0.3 },

  { cap: "A marketer asks in plain language. Nothing is uploaded.",
    vo: "A marketer asks in plain language." },

  // ---- refusal one ---------------------------------------------------------
  { cap: "The tool that crosses the boundary is not registered yet.",
    vo: "It cannot. The tool that crosses the boundary is not registered, so it is not in the agent's tool list.",
    go: async (p, h) => { await h.chip("How much does high lifetime value overlap with sports fans?");
                          await p.waitForTimeout(1500); } },

  { cap: "Nothing to call — and no wording brings it into existence.",
    vo: "That is the whole idea. A permission check can be argued past. A tool that does not exist cannot.",
    extra: 0.25 },

  // ---- refusal two ---------------------------------------------------------
  { cap: "Asking for the records directly is refused outright.",
    vo: "Asking for the raw records is refused outright.",
    go: async (p, h) => { await h.chip("Export Meridian's customer records");
                          await p.waitForTimeout(1500); }, extra: 0.2 },

  // ---- approval ------------------------------------------------------------
  { cap: "Approval is a business decision. A person makes it on each side.",
    vo: "So it asks for approval. A person decides, on each side.",
    go: async (p, h) => { await h.chip("Request approval to measure incremental reach");
                          await p.waitForSelector("#veil.on"); await p.waitForTimeout(500); } },

  { cap: "The request crosses to the publisher's console as a tool call.",
    vo: "The request crosses to the publisher's console as a tool call, where their officer decides independently.",
    go: async (p, h) => { await p.click("#myes");
                          await h.partner.locator("#bveil.on").waitFor();
                          await p.waitForTimeout(600); }, extra: 0.25 },

  { cap: "Two approvals register the tool. Only now does it exist.",
    vo: "Two approvals, and only now is the tool registered. Consent creates the capability.",
    go: async (p, h) => { await h.partner.locator("#byes").click();
                          await p.waitForTimeout(1100); } },

  // ---- the answer ----------------------------------------------------------
  { cap: "2,178 shared. 13,057 more reachable. Zero records moved.",
    vo: "Same question, seconds later. Two thousand shared customers, thirteen thousand more reachable. Two counts crossed. Zero records moved.",
    go: async (p, h) => { await h.chip("How much does high lifetime value overlap with sports fans?");
                          await p.waitForTimeout(1700); }, extra: 0.5 },

  // ---- the injection -------------------------------------------------------
  { cap: "The publisher also returned free text — and it is an attack.",
    vo: "The publisher also returned a note. It is a prompt injection, telling the agent to export everything." },

  { cap: "Quarantined as text. Never followed as an instruction.",
    vo: "It is quarantined as text, never followed. And no tool over there can return a record anyway.",
    extra: 0.25 },

  // ---- k-anonymity ---------------------------------------------------------
  { cap: "Too few people matched. The number is withheld, not rounded.",
    vo: "Ask about a segment too thin to be safe, and the answer is withheld rather than rounded.",
    go: async (p, h) => { await h.chip("Check luxury auto intenders"); await p.waitForTimeout(1600); },
    extra: 0.2 },

  // ---- audit ---------------------------------------------------------------
  { cap: "Every crossing is on the record, for both companies.",
    vo: "Every crossing is on the record, on both sides.",
    go: async (p, h) => { await h.chip("Show me the audit trail"); await p.waitForTimeout(1400); } },

  // ---- mechanism -----------------------------------------------------------
  { cap: "The publisher publishes four capabilities here — and nothing else.",
    vo: "The publisher exposes four capabilities here and nothing else. A third origin would not get a denial. It would not learn they exist.",
    go: async p => { await p.click('nav a[data-view="partners"]'); await p.waitForTimeout(700); },
    extra: 0.2 },

  { cap: "registerTool with exposedTo. getTools. executeTool.",
    vo: "That is the whole implementation. Registered with exposedTo, discovered with getTools, invoked with executeTool. Any agent drives it. We ship no key and no backend.",
    go: async p => { await p.click('nav a[data-view="diag"]'); await p.waitForTimeout(700); },
    extra: 0.3 },

  // ---- revocation ----------------------------------------------------------
  { cap: "Withdraw approval and the capability is gone — not disabled.",
    vo: "And it is revocable. Withdraw approval and the tool is unregistered. Gone, not disabled.",
    go: async p => { await p.click('nav a[data-view="analysis"]'); await p.waitForTimeout(500);
                     await p.click("#btn-revoke"); await p.waitForTimeout(1200); } },

  // ---- close ---------------------------------------------------------------
  { cap: "A data clean room with no clean-room vendor in it.",
    vo: "Two companies answered a question about their shared customers. Neither saw the other's data, and no vendor sat in between. Airlock.",
    go: async p => { await p.click('nav a[data-view="overview"]'); await p.waitForTimeout(600); },
    extra: 0.9 }
];

// `node tools/capture.js --list-voices` prints the voices on your ElevenLabs account.
if (argv.includes("--list-voices")) {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) { console.error("set ELEVENLABS_API_KEY first"); process.exit(1); }
  const out = JSON.parse(execFileSync("curl",
    ["-s", "https://api.elevenlabs.io/v1/voices", "-H", `xi-api-key: ${key}`],
    { encoding: "utf8", maxBuffer: 1 << 24 }));
  for (const v of out.voices || []) {
    const labels = Object.values(v.labels || {}).filter(Boolean).join(", ");
    console.log(`${v.voice_id}  ${(v.name || "").padEnd(18)} ${labels}`);
  }
  console.log(`\nUse:  node tools/capture.js --tts eleven --voice-id <id>`);
  process.exit(0);
}

(async () => {
  // "file" mode reuses an existing vo/ directory, so don't wipe it
  if (TTS === "file") {
    const missing = SCRIPT.map((_, i) => path.join(VO, String(i).padStart(2, "0") + ".wav"))
      .filter(f => !fs.existsSync(f));
    if (missing.length) {
      console.error(`--tts file needs one wav per line in ${VO}\n`
        + `missing ${missing.length} of ${SCRIPT.length}: ${missing.slice(0, 3).map(f => path.basename(f)).join(", ")}…\n`
        + `Record one take of docs/NARRATION.md, then: node tools/split-vo.js <your-recording>`);
      process.exit(1);
    }
    for (const f of fs.readdirSync(OUT)) {
      if (f !== "vo") fs.rmSync(path.join(OUT, f), { recursive: true, force: true });
    }
  } else {
    fs.rmSync(OUT, { recursive: true, force: true });
  }
  fs.mkdirSync(VO, { recursive: true });

  // ── 1. synthesise the narration and measure it ──────────────────────────
  // Cloud Text-to-Speech sounds markedly better than macOS `say`, but needs a project
  // the caller can actually use. Synthesis is a separate phase from recording, so the
  // voice can be swapped without re-driving the browser.
  function synthGcp(text, wav) {
    const token = sh("gcloud", ["auth", "print-access-token"]).trim();
    const body = JSON.stringify({
      input: { text },
      voice: { languageCode: GCP_VOICE.slice(0, 5), name: GCP_VOICE },
      audioConfig: { audioEncoding: "LINEAR16", sampleRateHertz: 24000, speakingRate: 1.0 }
    });
    const args = ["-s", "-X", "POST", "https://texttospeech.googleapis.com/v1/text:synthesize",
      "-H", `Authorization: Bearer ${token}`, "-H", "Content-Type: application/json"];
    if (GCP_PROJECT) args.push("-H", `x-goog-user-project: ${GCP_PROJECT}`);
    args.push("-d", body);
    const out = JSON.parse(sh("curl", args));
    if (!out.audioContent) throw new Error("Cloud TTS: " + JSON.stringify(out.error || out).slice(0, 300));
    const raw = wav.replace(".wav", ".raw.wav");
    fs.writeFileSync(raw, Buffer.from(out.audioContent, "base64"));
    sh("ffmpeg", ["-y", "-loglevel", "error", "-i", raw, "-ar", "44100", "-ac", "2", wav]);
    fs.rmSync(raw);
  }

  // Gemini TTS. The key comes from the environment and is never printed or written to
  // disk -- it goes into a temp file only so it stays off the process list.
  function synthGemini(text, wav) {
    const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!key) throw new Error("set GEMINI_API_KEY to use --tts gemini");
    const req = path.join(VO, "req.json");
    fs.writeFileSync(req, JSON.stringify({
      contents: [{ role: "user", parts: [{ text }] }],
      generationConfig: { responseModalities: ["AUDIO"],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: GEMINI_VOICE } } } }
    }));
    const out = JSON.parse(sh("curl", ["-s", "-X", "POST",
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent",
      "-H", `x-goog-api-key: ${key}`, "-H", "Content-Type: application/json",
      "--data-binary", "@" + req]));
    fs.rmSync(req);
    const part = out.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    if (!part) throw new Error("Gemini TTS: " + JSON.stringify(out.error || out).slice(0, 300));
    // returns raw signed 16-bit PCM at 24 kHz, not a container
    const pcm = wav.replace(".wav", ".pcm");
    fs.writeFileSync(pcm, Buffer.from(part.data, "base64"));
    sh("ffmpeg", ["-y", "-loglevel", "error", "-f", "s16le", "-ar", "24000", "-ac", "1",
      "-i", pcm, "-ar", "44100", "-ac", "2", wav]);
    fs.rmSync(pcm);
  }

  // ElevenLabs, one request per line. Per-line synthesis means each clip is exactly one
  // beat, so nothing has to be split on silence afterwards.
  function synthEleven(text, wav) {
    const key = process.env.ELEVENLABS_API_KEY;
    if (!key) throw new Error("set ELEVENLABS_API_KEY to use --tts eleven");
    if (!EL_VOICE) throw new Error("pass --voice-id (list them with --list-voices)");
    const req = path.join(VO, "req.json");
    fs.writeFileSync(req, JSON.stringify({
      text, model_id: EL_MODEL,
      voice_settings: { stability: 0.45, similarity_boost: 0.75, style: 0.0, use_speaker_boost: true }
    }));
    const mp3 = wav.replace(".wav", ".mp3");
    execFileSync("curl", ["-s", "-X", "POST",
      `https://api.elevenlabs.io/v1/text-to-speech/${EL_VOICE}?output_format=mp3_44100_128`,
      "-H", `xi-api-key: ${key}`, "-H", "Content-Type: application/json",
      "--data-binary", "@" + req, "-o", mp3], { stdio: ["ignore", "pipe", "pipe"] });
    fs.rmSync(req);
    const head = fs.readFileSync(mp3).subarray(0, 200).toString("utf8");
    if (head.trimStart().startsWith("{")) throw new Error("ElevenLabs: " + head.slice(0, 240));
    sh("ffmpeg", ["-y", "-loglevel", "error", "-i", mp3, "-ar", "44100", "-ac", "2", wav]);
    fs.rmSync(mp3);
  }

  const clips = SCRIPT.map((b, i) => {
    if (NO_VOICE) return { len: 2.8 };
    const wav = path.join(VO, String(i).padStart(2, "0") + ".wav");
    if (TTS === "file") {
      return { file: wav, len: dur(wav) };          // your own voice, already recorded
    }
    if (TTS === "eleven") {
      synthEleven(b.vo, wav);
    } else if (TTS === "gcp") {
      synthGcp(b.vo, wav);
    } else if (TTS === "gemini") {
      synthGemini(b.vo, wav);
    } else {
      const aiff = wav.replace(".wav", ".aiff");
      sh("say", ["-v", VOICE, "-r", RATE, "-o", aiff, b.vo]);
      sh("ffmpeg", ["-y", "-loglevel", "error", "-i", aiff, "-ar", "44100", "-ac", "2", wav]);
      fs.rmSync(aiff);
    }
    return { file: wav, len: dur(wav) };
  });
  const spoken = clips.reduce((a, c) => a + c.len, 0);
  // Roughly what the picture adds on top of speech: per-beat pad, the `extra` holds, the
  // UI actions, and the head and tail. Checked before recording so a long read is caught
  // in a second rather than after a three-minute render.
  const overhead = SCRIPT.reduce((a, b) => a + 0.25 + (b.extra || 0), 0) + 17;
  const projected = spoken + overhead;
  const mmss = t => `${Math.floor(t / 60)}:${String(Math.round(t % 60)).padStart(2, "0")}`;
  console.log(`narration: ${clips.length} lines, ${mmss(spoken)} spoken `
    + (TTS === "eleven" ? `(ElevenLabs ${EL_MODEL})`
       : TTS === "gcp" ? `(Cloud TTS ${GCP_VOICE})`
       : TTS === "gemini" ? `(Gemini TTS ${GEMINI_VOICE})`
       : TTS === "file" ? "(your own recording)"
       : `(say ${VOICE} at ${RATE} wpm)`));
  console.log(`projected runtime ${mmss(projected)} (spoken ${mmss(spoken)} + ~${Math.round(overhead)}s of picture)`);
  if (projected > 172) {
    console.error(`\n*** ${mmss(projected)} is too close to the 3:00 ceiling. ***`);
    console.error(`Trim the narration, or lower the \`extra\` holds in tools/capture.js.`);
    if (!argv.includes("--force")) { console.error(`Pass --force to record anyway.\n`); process.exit(1); }
  }

  // ── 2. record, holding each caption for as long as its line takes ───────
  const ctx = await chromium.launchPersistentContext(profile(), {
    channel: "chrome", headless: true,
    viewport: { width: 1920, height: 1080 },
    args: ["--no-first-run", "--no-default-browser-check", "--disable-sync", "--hide-scrollbars"],
    recordVideo: { dir: OUT, size: { width: 1920, height: 1080 } }
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  await page.goto(A + "?v=" + Date.now(), { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await page.evaluate(() => {
    // The app is designed at 13px for a desktop user sitting close to the screen. On a
    // 1080p video watched in a small player that is unreadable, so zoom the root: the
    // page still fills the frame, but every element is ~1.35x larger.
    document.documentElement.style.zoom = "1.35";
    const bar = document.createElement("div");
    bar.id = "__cap";
    bar.style.cssText = `position:fixed;left:0;right:0;bottom:0;z-index:200;
      background:linear-gradient(transparent,rgba(9,17,15,.94) 45%);padding:52px 44px 28px;
      font:500 26px/1.35 "IBM Plex Sans",system-ui,sans-serif;color:#F2F5F4;
      letter-spacing:-.012em;transition:opacity .3s ease;opacity:0;pointer-events:none`;
    document.body.appendChild(bar);
    window.__cap = t => { bar.textContent = t; bar.style.opacity = t ? "1" : "0"; };
  });

  const helpers = {
    partner: page.frameLocator("#f"),
    chip: label => page.click(`.chips button:text-is("${label}")`)
  };
  const t0 = Date.now();
  const beats = [];
  for (let i = 0; i < SCRIPT.length; i++) {
    const b = SCRIPT[i];
    if (b.go) await b.go(page, helpers);
    const at = (Date.now() - t0) / 1000;
    beats.push({ i, at, cap: b.cap, vo: b.vo, len: clips[i].len });
    await page.evaluate(t => window.__cap(t), b.cap);
    console.log(`${at.toFixed(1).padStart(6)}s  ${b.cap}`);
    await page.waitForTimeout((clips[i].len + 0.25 + (b.extra || 0)) * 1000);
  }
  await page.evaluate(() => window.__cap(""));
  await page.waitForTimeout(1200);
  const vid = page.video();
  await ctx.close();
  const raw = await vid.path();
  fs.writeFileSync(path.join(OUT, "beats.json"), JSON.stringify(beats, null, 2));

  // ── 3. mix the voice onto the picture at the beat times recorded ────────
  const mp4 = path.join(OUT, "airlock-demo.mp4");
  if (NO_VOICE) {
    sh("ffmpeg", ["-y", "-loglevel", "error", "-i", raw, "-c:v", "libx264", "-preset", "slow",
      "-crf", "20", "-pix_fmt", "yuv420p", "-movflags", "+faststart", mp4]);
  } else {
    const inputs = [], filters = [];
    beats.forEach((b, n) => {
      inputs.push("-i", clips[n].file);
      filters.push(`[${n + 1}:a]adelay=${Math.round(b.at * 1000)}|${Math.round(b.at * 1000)}[a${n}]`);
    });
    const mixed = beats.map((_, n) => `[a${n}]`).join("");
    sh("ffmpeg", ["-y", "-loglevel", "error", "-i", raw, ...inputs,
      "-filter_complex", `${filters.join(";")};${mixed}amix=inputs=${beats.length}:normalize=0:dropout_transition=0[out]`,
      "-map", "0:v", "-map", "[out]",
      "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-pix_fmt", "yuv420p",
      "-c:a", "aac", "-b:a", "160k", "-shortest", "-movflags", "+faststart", mp4]);
  }
  fs.rmSync(raw);
  const total = dur(mp4);
  const mm = `${Math.floor(total / 60)}:${String(Math.round(total % 60)).padStart(2, "0")}`;
  console.log(`\n${mp4}\nruntime ${mm}  ${total > 175 ? "*** OVER 3:00 BUDGET ***" : "(limit 3:00)"}`);
})();
