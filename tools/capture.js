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

// --with-key records the demo with a real model driving the tools instead of the
// deterministic router. The key is read from the environment or a gitignored .env,
// injected straight into localStorage before the page script runs, and never typed
// into the UI -- so it cannot appear on camera even for a frame.
const WITH_KEY = argv.includes("--with-key");
const TEMPO = parseFloat(arg("--tempo", "1"));   // atempo preserves pitch; 1.05-1.10 is inaudible
function readEnvKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY.trim();
  const envFile = path.resolve(__dirname, "../.env");
  if (!fs.existsSync(envFile)) return "";
  const m = fs.readFileSync(envFile, "utf8").match(/^\s*GEMINI_API_KEY\s*=\s*(.+)$/m);
  return m ? m[1].trim().replace(/^["']|["']$/g, "") : "";
}
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
// Recording against the deployed pair puts two real origins on camera. Two localhost
// ports are genuinely different origins, but they do not look like two companies.
const A = arg("--base", "http://localhost:8787/");

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
const FULL_SCRIPT = [
  // ---- COLD OPEN: a real model, calling real tools, hitting the boundary ----
  { cap: "A marketer asks an agent about a partner's audience.",
    vo: "How much do our customers overlap with a partner's?",
    go: async (p, h) => { await p.click('nav a[data-view="analysis"]');
                          await p.waitForTimeout(200);
                          if (WITH_KEY) h.startPasteKey(); } },

  { liveOnly: true,
    cap: "Bring your own model — the key stays in your browser.",
    vo: "Any agent can drive it. Paste a Gemini key and a real model takes over.",
    go: async (p, h) => { await h.awaitPaste(); await h.setModel(false);
                          h.startAsk("What audiences do we hold?"); }, extra: 0.2 },

  { liveOnly: true,
    cap: "Real Gemini. getTools() to discover, executeTool() to call.",
    vo: "Now a real model. getTools to see what the page offers, executeTool to invoke one.",
    go: async (p, h) => { await h.awaitAsk();          // started under the previous beat
                          await h.setModel(true);      // live model hits the boundary next
                          h.startAsk("How much does high lifetime value overlap with Meridian's sports fans?",
                                     { allowModal: true }); } },

  { cap: "estimate_overlap was never registered. Nothing to call.",
    vo: "But it cannot measure the overlap. That tool was never registered, so getTools never returned it.",
    go: async (p, h) => { await h.awaitAsk(); }, extra: 0.2 },

  { cap: "A permission check can be argued past. A missing tool cannot.",
    vo: "That is the idea. A permission check can be argued past. A missing tool cannot.",
    extra: 0.3 },

  // ---- why it matters ----
  { cap: "Two companies. Neither may see the other's list.",
    vo: "Two companies share customers and cannot say how many. Today that means a clean room, and both upload their files.",
    go: async (p, h) => { await h.dismissModal();
                          await p.click('nav a[data-view="overview"]');
                          await p.waitForTimeout(300); }, extra: 0.2 },

  // ---- SLIDE: the API, explained while it is on screen ----
  { cap: "Two origins. Aggregates cross; records never do.",
    vo: "Two ordinary web apps on two origins, and everything between them is WebMCP.",
    go: async (p, h) => { await h.showDiagram("airlock-architecture.png"); }, extra: 0.35 },

  { cap: "WebMCP: a page declares what it can do.",
    vo: "A page calls registerTool to declare what it can do, and the browser decides who sees it.",
    go: async (p, h) => { await h.showDiagram("webmcp-surface.png"); }, extra: 0.4 },

  { cap: "exposedTo names one origin. A third gets no denial.",
    vo: "The publisher registers with exposedTo, naming one origin. A third gets no denial — it never learns they exist.",
    extra: 0.4 },

  { cap: "allow=\"tools\" — the frame is how the crossing is permitted at all.",
    vo: "Its console runs in a frame carrying allow equals tools — the Permissions Policy that lets either side reach the other.",
    extra: 0.4 },

  { cap: "getTools({fromOrigins}) · executeTool() · browser-mediated.",
    vo: "The advertiser reaches them with getTools and fromOrigins, then executeTool — each running in the publisher's page, over records that never move.",
    extra: 0.4 },

  { cap: "The description is prompt, not documentation.",
    vo: "A tool's description is not a comment. It is the whole basis on which a model decides to call it. Ours says the export tool always refuses, so the model reports that instead of retrying.",
    extra: 0.3 },

  { cap: "One tool is a <form>. The browser writes its schema.",
    vo: "One tool is not JavaScript — a form with toolname, and the browser writes its schema.",
    extra: 0.3 },

  // ---- refusal ----
  { cap: "Three published facts about this API were wrong.",
    vo: "Building it disproved three things the documentation says. requestUserInteraction does not exist in Chrome at all. fromOrigins is additive, not a filter. And executeTool needs a JSON string — an object throws.",
    extra: 0.4 },

  { cap: "Asking for the records is refused outright.",
    vo: "Ask for the raw records and it refuses.",
    go: async (p, h) => { await h.hideDiagram(); await h.setModel(true);   // live model all the way
                          await p.waitForTimeout(250);
                          await p.click('nav a[data-view="analysis"]'); await p.waitForTimeout(200);
                          await h.chip("Export Meridian's customer records"); } },

  // ---- approval ----
  { cap: "Approval is a business decision — one on each side.",
    vo: "So it asks for approval. A person decides on each side.",
    go: async (p, h) => { await h.chip("Request approval to measure incremental reach",
                                       { waitFor: "modal" }); await p.waitForTimeout(250); } },

  { cap: "It crosses to the publisher's console as a WebMCP tool call.",
    vo: "That crosses to their console as a WebMCP tool call. Their officer decides.",
    go: async (p, h) => { if (!await p.isVisible("#veil.on").catch(() => false)) {
                            console.log("  !! approval modal never opened -- the model did not "
                                      + "call request_partner_consent (quota, or it answered in prose)");
                            return;                     // film the miss, do not kill the render
                          }
                          await p.click("#myes");
                          await h.partner.locator("#bveil.on").waitFor();
                          await p.waitForTimeout(300); } },

  { cap: "registerTool({signal}) · toolchange fires · watch the list.",
    vo: "Two approvals, and only now does registerTool run, bound to an AbortController.",
    go: async (p, h) => { if (await h.partner.locator("#bveil.on").isVisible().catch(() => false))
                            await h.partner.locator("#byes").click();
                          await p.waitForTimeout(500);
                          await p.click('nav a[data-view="diag"]');
                          await p.waitForTimeout(700); }, extra: 0.2 },

  // ---- the answer ----
  { liveOnly: true,
    cap: "Live model — 2,178 shared, 13,057 reachable, 0 moved.",
    vo: "The model is back, and now it can answer. Two thousand shared, thirteen thousand more reachable. Zero records moved.",
    go: async (p, h) => { await p.click('nav a[data-view="analysis"]'); await p.waitForTimeout(250);
                          await h.setModel(true);
                          h.startAsk("Now measure the overlap between high lifetime value and sports fans.");
                          await h.awaitAsk(); },
    extra: 0.4 },

  // ---- injection ----
  { cap: "untrustedContentHint — but a hint enforces nothing.",
    vo: "It also returned a prompt injection. The tool carries untrustedContentHint — but a hint enforces nothing.",
    extra: 0.3 },

  { cap: "Too few people matched. Withheld, not rounded.",
    vo: "A segment too thin to be safe is withheld, not rounded.",
    go: async (p, h) => { await h.setModel(true);
                          await h.chip("Check luxury auto intenders"); } },

  // ---- SLIDE: the defence ----
  { cap: "25 automated checks, against the deployed pair.",
    vo: "All of it is checked by a Playwright suite that drives the same calls an agent makes — twenty-five of them, run against the live pair rather than a local copy.",
    extra: 0.35 },

  { cap: "Three gates. None of them trusts the model.",
    vo: "Three gates. Not one depends on the model behaving well.",
    go: async (p, h) => { await h.showDiagram("airlock-defence.png"); }, extra: 0.3 },

  // ---- revocation + close ----
  { cap: "Abort the signal → the tool is unregistered → gone.",
    vo: "And it is revocable. Abort the signal, the tool is unregistered. Gone, not disabled.",
    go: async (p, h) => { await h.hideDiagram(); await p.waitForTimeout(200);
                     await p.click('nav a[data-view="analysis"]'); await p.waitForTimeout(180);
                     await p.click("#btn-revoke"); await p.waitForTimeout(300);
                     await p.click('nav a[data-view="diag"]'); await p.waitForTimeout(400); } },

  { cap: "A permission check can be argued past. A tool that does not exist cannot.\ngithub.com/jwlai-cloud/airlock-webmcp",
    vo: "Two companies answered a question about their shared customers. Neither saw the other's data. Airlock.",
    go: async p => { await p.click('nav a[data-view="overview"]'); await p.waitForTimeout(400); },
    extra: 0.6 }
];

// `node tools/capture.js --estimate` prints what a render will cost before spending it.
// ElevenLabs bills per character of the request body's text, so rendering line by line
// through the API costs strictly less than pasting the script with <break> tags into the
// web UI -- the tags are billed too, and nineteen of them is several hundred characters.
if (argv.includes("--estimate")) {
  const chars = SCRIPT.reduce((n, b) => n + b.vo.length, 0);
  const words = SCRIPT.reduce((n, b) => n + b.vo.split(/\s+/).length, 0);
  const WPM = 137;   // measured from the recorded narration, not a generic estimate
  const tagged = chars + (SCRIPT.length - 1) * '<break time="1.2s" />\n\n'.length;
  console.log(`${SCRIPT.length} lines, ${words} words · ~${Math.floor(words/WPM)}:${String(Math.round(words/WPM%1*60)).padStart(2,"0")} spoken at ${WPM} wpm`);
  console.log(`  API, line by line   ${chars} characters`);
  console.log(`  web UI with breaks  ${tagged} characters  (+${tagged - chars} of markup)`);
  console.log(`\nElevenLabs bills roughly 1 credit per character on the v2 models and`);
  console.log(`about half that on the turbo and flash models:`);
  console.log(`  eleven_multilingual_v2  ~${chars} credits`);
  console.log(`  eleven_flash_v2_5       ~${Math.round(chars / 2)} credits`);
  process.exit(0);
}

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

// Some lines assert that a live model is driving. Without --with-key the rail badge
// reads "fallback router - no model", so those lines would be contradicted by the very
// frame they play over. Drop them rather than narrate something the picture denies.
// vo/NN.wav is named by position in FULL_SCRIPT, so each surviving beat carries the
// index its clip was recorded under.
// A dropped beat still owns work the rest of the take depends on -- it is the beat that
// asks the first question. Losing the line must not lose the action, so a dropped go()
// runs at the head of the next surviving beat instead.
const SCRIPT = (() => {
  const out = [];
  let pending = [];
  FULL_SCRIPT.forEach((b, i) => {
    if (!WITH_KEY && b.liveOnly) { if (b.go) pending.push(b.go); return; }
    const carried = pending; pending = [];
    const own = b.go;
    out.push({ ...b, voIdx: i,
      go: (carried.length || own)
        ? async (p, h) => { for (const g of carried) await g(p, h); if (own) await own(p, h); }
        : undefined });
  });
  if (pending.length) {                       // trailing drops: nothing left to carry onto
    const last = out[out.length - 1], own = last.go;
    last.go = async (p, h) => { if (own) await own(p, h); for (const g of pending) await g(p, h); };
  }
  return out;
})();
if (SCRIPT.length !== FULL_SCRIPT.length)
  console.log(`keyless take: dropping ${FULL_SCRIPT.length - SCRIPT.length} beats that claim a live model`);

(async () => {
  // Hold the last finished cut across the wipe below.
  const prevCut = path.join(OUT, "airlock-demo.mp4");
  const stash = fs.existsSync(prevCut) ? fs.readFileSync(prevCut) : null;

  // "file" mode reuses an existing vo/ directory, so don't wipe it
  if (TTS === "file") {
    const missing = SCRIPT.map(b => path.join(VO, String(b.voIdx).padStart(2, "0") + ".wav"))
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

  // A render that fails part way leaves nothing behind, and it has already wiped the
  // previous cut. Keep the last good one: re-recording costs four minutes, and losing
  // the only finished video the day before a deadline costs rather more.
  if (stash) {
    const keepDir = path.resolve(__dirname, "../.airlock-cuts");
    fs.mkdirSync(keepDir, { recursive: true });
    fs.writeFileSync(path.join(keepDir, `cut-${Date.now()}.mp4`), stash);
  }

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
    const wav = path.join(VO, String(b.voIdx).padStart(2, "0") + ".wav");
    if (TTS === "file") {
      if (TEMPO !== 1) {
        const fast = wav.replace(".wav", ".fast.wav");
        sh("ffmpeg", ["-y", "-loglevel", "error", "-i", wav,
                      "-filter:a", `atempo=${TEMPO}`, "-ar", "44100", "-ac", "2", fast]);
        return { file: fast, len: dur(fast) };
      }
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
  const overhead = SCRIPT.reduce((a, b) => a + 0.15 + (b.extra || 0), 0) + (A.startsWith('http://localhost') ? 10 : 16) + (WITH_KEY ? 6 : 0);   // deployed pairs, and live models, pay real latency
  const projected = spoken + overhead;
  const mmss = t => `${Math.floor(t / 60)}:${String(Math.round(t % 60)).padStart(2, "0")}`;
  console.log(`narration: ${clips.length} lines, ${mmss(spoken)} spoken `
    + (TTS === "eleven" ? `(ElevenLabs ${EL_MODEL})`
       : TTS === "gcp" ? `(Cloud TTS ${GCP_VOICE})`
       : TTS === "gemini" ? `(Gemini TTS ${GEMINI_VOICE})`
       : TTS === "file" ? "(your own recording)"
       : `(say ${VOICE} at ${RATE} wpm)`));
  console.log(`projected runtime ${mmss(projected)} (spoken ${mmss(spoken)} + ~${Math.round(overhead)}s of picture)`);
  if (projected > 176) {
    console.error(`\n*** ${mmss(projected)} projected, too close to the 3:00 ceiling. ***`);
    console.error(`The projection runs a few seconds pessimistic; the real figure is printed`);
    console.error(`at the end of a render, and that is the one to trust.`);
    console.error(`Trim the narration, or lower the \`extra\` holds in tools/capture.js.`);
    if (!argv.includes("--force")) { console.error(`Pass --force to record anyway.\n`); process.exit(1); }
  }

  // ── 2. record, holding each caption for as long as its line takes ───────
  const ctx = await chromium.launchPersistentContext(profile(), {
    channel: "chrome", headless: true,
    viewport: { width: 1440, height: 810 },   // upscaled to 1080p at mux time
    args: ["--no-first-run", "--no-default-browser-check", "--disable-sync", "--hide-scrollbars"],
    recordVideo: { dir: OUT, size: { width: 1440, height: 810 } }
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  // The profile is shared with the test harnesses and verify-llm.js leaves a Gemini key
  // in localStorage. By default clear it, so a recording is deterministic rather than
  // dependent on someone else's server. With --with-key, set it instead -- written
  // directly to storage before the page script runs, so it never reaches the DOM.
  if (WITH_KEY) {
    const key = readEnvKey();
    if (!key) {
      console.error("--with-key needs GEMINI_API_KEY in the environment or in .env");
      process.exit(1);
    }
    await page.addInitScript(k => {
      try {
        localStorage.setItem("airlock.gemini.key", k);
        localStorage.removeItem("airlock.gemini.model");   // fall through to the page default
      } catch {}
    }, key);
    console.log("recording with a live model (key never rendered to the page)");
  } else {
    await page.addInitScript(() => {
    try {
      localStorage.removeItem("airlock.gemini.key");
      localStorage.removeItem("airlock.gemini.model");   // a stored model beats the page default
    } catch {}
  });
  }
  await page.goto(A + (A.includes("?") ? "&" : "?") + "v=" + Date.now(),
                  { waitUntil: "networkidle" });
  await page.waitForTimeout(350);
  await page.evaluate(() => {
    const bar = document.createElement("div");
    bar.id = "__cap";
    bar.style.cssText = `position:fixed;left:0;right:0;bottom:0;z-index:200;
      background:linear-gradient(transparent,rgba(9,17,15,.94) 45%);padding:44px 36px 24px;
      font:500 21px/1.35 "IBM Plex Sans",system-ui,sans-serif;color:#F2F5F4;
      letter-spacing:-.012em;white-space:pre-line;transition:opacity .3s ease;opacity:0;pointer-events:none`;
    document.body.appendChild(bar);
    window.__cap = t => { bar.textContent = t; bar.style.opacity = t ? "1" : "0"; };
  });

  // A diagram cut for the beats that describe the mechanism rather than show it. The
  // PNG is injected as a data URI because the page is served over http and cannot read
  // file://. The caption bar sits above it, so the lower third keeps working.
  async function showDiagram(file) {
    const roots = ["../docs/diagrams", "../docs/slides"];
    const found = roots.map(r => path.resolve(__dirname, r, file)).find(fs.existsSync);
    if (!found) throw new Error("no such slide or diagram: " + file);
    const b64 = fs.readFileSync(found).toString("base64");
    await page.evaluate(src => {
      let el = document.getElementById("__diag");
      if (!el) {
        el = document.createElement("div");
        el.id = "__diag";
        // pointer-events:none, or the overlay keeps swallowing clicks after it fades
        el.style.cssText = `position:fixed;inset:0;z-index:150;background:#F2F5F4;
          display:grid;place-items:center;padding:2.5vh 2.5vw;opacity:0;
          pointer-events:none;transition:opacity .45s ease`;
        const img = document.createElement("img");
        img.id = "__diagimg";
        img.style.cssText = "max-width:100%;max-height:100%;object-fit:contain";
        el.appendChild(img);
        document.body.appendChild(el);
      }
      document.getElementById("__diagimg").src = src;
      requestAnimationFrame(() => { el.style.opacity = "1"; });
    }, "data:image/png;base64," + b64);
    await page.waitForTimeout(300);
  }
  const hideDiagram = () => page.evaluate(() => {
    const el = document.getElementById("__diag");
    if (el) el.style.opacity = "0";
  });

  // Recording against the deployed pair means every partner call is a real network
  // round trip, so a fixed delay after a click is a race: the next beat can fire while
  // the previous answer is still in flight. Wait for the assistant's reply instead.
  // `waitFor` picks what "done" means. Most prompts end in an assistant reply, but the
  // approval prompt deliberately blocks on a dialog and produces no reply until someone
  // decides -- waiting for one there burns the whole timeout as dead air on camera.
  async function chip(label, { waitFor = "reply", settle = 150 } = {}) {
    const budget = WITH_KEY ? 60000 : 20000;   // a model turn is slower than a function call
    await pace();                              // no-op unless this beat is model-driven
    const before = await page.evaluate(() => document.querySelectorAll("#chat .msg.a").length);
    await page.click(`.chips button:text-is("${label}")`);
    if (waitFor === "modal") {
      await page.waitForSelector("#veil.on", { timeout: budget }).catch(() => {});
    } else {
      await page.waitForFunction(
        n => document.querySelectorAll("#chat .msg.a").length > n, before, { timeout: budget }
      ).catch(() => {});               // a beat that never answers still gets filmed
    }
    await page.waitForTimeout(settle);
    await dropRetryNotices();
  }

  // ask() types a real question, the way someone using the product would
  async function ask(q, { allowModal = false } = {}) {
    const before = await page.evaluate(() => document.querySelectorAll("#chat .msg.a").length);
    await page.fill("#ask", q);
    await page.click("#send");
    const done = page.waitForFunction(
      n => document.querySelectorAll("#chat .msg.a").length > n, before,
      { timeout: WITH_KEY ? 60000 : 20000 });
    if (allowModal) {
      // a capable model may reach for approval on its own, which blocks on a dialog
      await Promise.race([done.catch(() => {}),
        page.waitForSelector("#veil.on", { timeout: 60000 }).catch(() => {})]);
    } else { await done.catch(() => {}); }
    await page.waitForTimeout(200);
  }
  // Toggle the model mid-recording. The rail badge updates, so which one is driving is
  // always visible: a live model for the discovery beats, the deterministic router for
  // the scripted approval sequence a model cannot be relied on to follow.
  // Paste the key through the dialog a judge would use, on camera. The field is a
  // password input, so the key shows as dots and never appears in a frame.
  let pasting = null;
  function startPasteKey() {
    const key = readEnvKey();
    if (!key) throw new Error("--with-key needs GEMINI_API_KEY in the environment or .env");
    // deliberately not awaited: it animates while the previous beat's narration plays,
    // instead of running in silence before its own
    pasting = (async () => {
      await page.click("#usekey");
      await page.waitForSelector("#kveil", { state: "visible" });
      await page.waitForTimeout(300);
      await page.type("#kkey", key.slice(0, 14), { delay: 22 });   // typed, then filled
      await page.fill("#kkey", key);
      await page.waitForTimeout(250);
      await page.click("#kyes");
      await page.waitForTimeout(250);
    })();
  }
  const awaitPaste = async () => { if (pasting) { await pasting; pasting = null; } };

  async function setModel(on) {
    if (!WITH_KEY) on = false;   // --with-key is the switch; the script cannot override it
    await page.evaluate(([enable, k]) => {
      try {
        localStorage.removeItem("airlock.gemini.model");
        if (enable && k) localStorage.setItem("airlock.gemini.key", k);
        else localStorage.removeItem("airlock.gemini.key");
      } catch {}
      if (typeof syncKeyUI === "function") syncKeyUI();
    }, [on, on ? readEnvKey() : ""]);
    await page.waitForTimeout(150);
  }

  // Free-tier quota is per model and per minute (5 rpm), and one prompt is not one
  // request: a tool-calling turn is a loop of four or five. So a single question can
  // exhaust its own model's window. Pacing between questions -- the obvious lever --
  // does nothing about that. What works is one question per model per window: pick the
  // least recently used model, and wait only until *its* minute is clear.
  // Each model name is its own quota bucket -- 5 rpm and 20 requests a day apiece --
  // so the pool is the budget. Flash-lite names are deliberately absent: they 404 when
  // the request carries tools, which is every request this demo makes.
  const MODELS = ["gemini-3.8-flash", "gemini-3.7-flash", "gemini-3.6-flash",
                  "gemini-3.5-flash", "gemini-3-flash-preview", "gemini-2.5-flash"];
  const WINDOW = 64000;
  const lastUse = new Map(MODELS.map(m => [m, 0]));

  // Every model-driven beat goes through here, typed question and suggestion chip
  // alike. The earlier version only paced startAsk(), so the chips in between ran
  // unpaced on whatever model was last set -- which is exactly where the 429s landed.
  async function pace() {
    if (!WITH_KEY) return null;
    if (!await page.evaluate(() => { try { return !!localStorage.getItem("airlock.gemini.key"); } catch { return false; } }))
      return null;                              // router beat, no request to pace
    const m = MODELS.reduce((a, b) => lastUse.get(a) <= lastUse.get(b) ? a : b);
    const wait = lastUse.get(m) + WINDOW - Date.now();
    if (wait > 0) {
      console.log(`  waiting ${Math.ceil(wait / 1000)}s for ${m}'s rate window`);
      await new Promise(r => setTimeout(r, wait));
    }
    lastUse.set(m, Date.now());
    await page.evaluate(n => {
      try { localStorage.setItem("airlock.gemini.model", n); } catch {}
      if (typeof syncKeyUI === "function") syncKeyUI();
    }, m);
    return m;
  }
  const nextModel = pace;

  // A retry notice is infrastructure, not an answer: the reply that follows it comes
  // from the same live model. Drop it from the transcript so a 15-second quota blip
  // does not sit on screen for the rest of the recording.
  let retriesSeen = 0;
  const dropRetryNotices = async () => {
    const n = await page.evaluate(() => {
      let k = 0;
      document.querySelectorAll("#chat .msg.a").forEach(el => {
        if (/^Rate limited by the model API/.test(el.textContent || "")) { el.remove(); k++; }
      });
      return k;
    });
    if (n) { retriesSeen += n; console.log(`  (dropped ${n} retry notice${n > 1 ? "s" : ""})`); }
  };

  let asking = null;
  function startAsk(q, opts) {
    asking = (async () => {
      await pace();
      const r = await ask(q, opts);
      await dropRetryNotices();
      return r;
    })();
  }
  const awaitAsk = async () => { if (asking) { await asking; asking = null; } };

  const dismissModal = async () => {
    if (await page.isVisible("#veil.on").catch(() => false)) await page.click("#mno");
  };

  const helpers = { partner: page.frameLocator("#f"), chip, ask, dismissModal,
                    showDiagram, hideDiagram, setModel, startPasteKey, awaitPaste,
                    startAsk, awaitAsk, nextModel };
  const t0 = Date.now();
  const beats = [];
  for (let i = 0; i < SCRIPT.length; i++) {
    const b = SCRIPT[i];
    if (b.go) await b.go(page, helpers);
    const at = (Date.now() - t0) / 1000;
    beats.push({ i, at, cap: b.cap, vo: b.vo, len: clips[i].len });
    await page.evaluate(t => window.__cap(t), b.cap);
    console.log(`${at.toFixed(1).padStart(6)}s  ${b.cap}`);
    await page.waitForTimeout((clips[i].len + 0.15 + (b.extra || 0)) * 1000);
  }
  await page.evaluate(() => window.__cap(""));
  await page.waitForTimeout(800);
  const vid = page.video();
  await ctx.close();
  const raw = await vid.path();
  fs.writeFileSync(path.join(OUT, "beats.json"), JSON.stringify(beats, null, 2));

  // ── 2b. cut the dead time ───────────────────────────────────────────────
  // A beat's UI work runs before its narration, so a slow model call shows as silence.
  // Rather than fight the latency, excise it: for every gap between one line ending and
  // the next beginning, drop all but a beat of it from the picture and pull every later
  // line forward by the same amount. This is the cut a human editor makes.
  const KEEP = 0.55;                       // breathing room left at each seam
  const cuts = [];                         // [from, to] in the recorded timeline
  let shift = 0;
  const timeline = beats.map((b, i) => {
    const endOfAudio = b.at + clips[i].len;
    const nextAt = i + 1 < beats.length ? beats[i + 1].at : null;
    const placed = { at: b.at - shift, cap: b.cap, vo: b.vo, len: clips[i].len };
    if (nextAt !== null) {
      const gap = nextAt - endOfAudio;
      if (gap > KEEP + 0.4) {
        cuts.push([endOfAudio + KEEP / 2, nextAt - KEEP / 2]);
        shift += gap - KEEP;
      }
    }
    return placed;
  });
  const removed = cuts.reduce((a, [f, t]) => a + (t - f), 0);
  if (cuts.length) console.log(`cutting ${cuts.length} dead stretches, ${removed.toFixed(1)}s total`);

  // keep the spans between the cuts
  const keeps = [];
  let cursor = 0;
  for (const [f, t] of cuts) { if (f > cursor) keeps.push([cursor, f]); cursor = t; }
  keeps.push([cursor, 1e6]);

  // ── 3. mix the voice onto the picture at the beat times recorded ────────
  const mp4 = path.join(OUT, "airlock-demo.mp4");
  if (NO_VOICE) {
    sh("ffmpeg", ["-y", "-loglevel", "error", "-i", raw,
      "-vf", "scale=1920:1080:flags=lanczos",
      "-c:v", "libx264", "-preset", "slow",
      "-crf", "20", "-pix_fmt", "yuv420p", "-movflags", "+faststart", mp4]);
  } else {
    const inputs = [], filters = [];
    timeline.forEach((b, n) => {
      inputs.push("-i", clips[n].file);
      filters.push(`[${n + 1}:a]adelay=${Math.round(b.at * 1000)}|${Math.round(b.at * 1000)}[a${n}]`);
    });
    const mixed = timeline.map((_, n) => `[a${n}]`).join("");
    // trim the picture to the kept spans, then concatenate them back together
    const vparts = keeps.map(([f, t], i) =>
      `[0:v]trim=start=${f.toFixed(3)}${t < 1e5 ? `:end=${t.toFixed(3)}` : ""},setpts=PTS-STARTPTS[v${i}]`);
    const vcat = keeps.map((_, i) => `[v${i}]`).join("") + `concat=n=${keeps.length}:v=1:a=0[vc]`;
    sh("ffmpeg", ["-y", "-loglevel", "error", "-i", raw, ...inputs,
      "-filter_complex",
      `${vparts.join(";")};${vcat};[vc]scale=1920:1080:flags=lanczos[vout];`
      + `${filters.join(";")};${mixed}amix=inputs=${timeline.length}:normalize=0:dropout_transition=0[out]`,
      "-map", "[vout]", "-map", "[out]",
      "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-pix_fmt", "yuv420p",
      "-c:a", "aac", "-b:a", "160k", "-shortest", "-movflags", "+faststart", mp4]);
  }
  const total = dur(mp4);
  const mm = `${Math.floor(total / 60)}:${String(Math.round(total % 60)).padStart(2, "0")}`;
  console.log(`\n${mp4}\nruntime ${mm}  ${total > 175 ? "*** OVER 3:00 BUDGET ***" : "(limit 3:00)"}`);
  if (WITH_KEY) console.log(retriesSeen
    ? `${retriesSeen} rate-limit retries hit during the take (notices removed from the transcript)`
    : "no rate limiting during the take");
})();
