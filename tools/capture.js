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
const SCRIPT = [
  // ---- COLD OPEN: the product working, and the whole argument, inside 15s ----
  { cap: "A marketer asks an agent about a partner's audience.",
    vo: "A marketer asks an agent how their customers overlap with a partner's audience.",
    go: async p => { await p.click('nav a[data-view="analysis"]'); await p.waitForTimeout(500); } },

  { cap: "It can't. That tool is not registered — getTools() never returns it.",
    vo: "It cannot answer. The tool that crosses the boundary is not registered, so it is not in the agent's tool list at all.",
    go: async (p, h) => { await h.chip("How much does high lifetime value overlap with sports fans?"); }, extra: 0.2 },

  { cap: "A permission check can be argued past. A missing tool cannot.",
    vo: "That is Airlock, and that is the whole idea. A permission check is something a model can be argued past. A tool that does not exist is not.",
    extra: 0.3 },

  // ---- why anyone needs this ----
  { cap: "Two companies. One question neither can answer.",
    vo: "Two companies share customers and neither can say how many. Answering it means comparing two customer lists, and neither may show the other its list." },

  { cap: "Today: a clean-room vendor, six figures, both files uploaded.",
    vo: "Today that means a data clean room. Six figures a year, and both companies upload their customer files to a third party. The measurement creates the risk." },

  // ---- it is an ordinary app with declared actions ----
  { cap: "Airlock is two ordinary web apps, on two different origins.",
    vo: "Airlock is two ordinary web apps on two different origins. An advertiser's workspace, and live on the right, the publisher's own console.",
    go: async p => { await p.click('nav a[data-view="overview"]'); await p.waitForTimeout(600); },
    extra: 0.2 },

  { cap: "WebMCP: each app declares what it can do.",
    vo: "WebMCP lets each app write down what it can do. List audiences. Request approval. Measure overlap. Each is the same function the buttons already call.",
    go: async p => { await p.click('nav a[data-view="diag"]'); await p.waitForTimeout(700); },
    extra: 0.2 },

  // ---- refusal two ----
  { cap: "Asking for the records directly is refused outright.",
    vo: "Asking the publisher for the raw records is refused outright.",
    go: async (p, h) => { await p.click('nav a[data-view="analysis"]'); await p.waitForTimeout(400);
                          await h.chip("Export Meridian's customer records"); } },

  // ---- approval ----
  { cap: "Approval is a business decision. A person makes it on each side.",
    vo: "So it asks for approval. A person decides, on each side.",
    go: async (p, h) => { await h.chip("Request approval to measure incremental reach");
                          await p.waitForSelector("#veil.on"); await p.waitForTimeout(500); } },

  { cap: "The request crosses to the publisher's console as a tool call.",
    vo: "The request crosses to the publisher's console as a tool call. Their officer decides independently.",
    go: async (p, h) => { await p.click("#myes");
                          await h.partner.locator("#bveil.on").waitFor();
                          await p.waitForTimeout(600); }, extra: 0.2 },

  { cap: "Two approvals → registerTool(). Watch the tool list.",
    vo: "Two approvals, and only now is the tool registered. Consent creates the capability.",
    go: async (p, h) => { await h.partner.locator("#byes").click();
                          await p.waitForTimeout(700);
                          await p.click('nav a[data-view="diag"]');
                          await p.waitForTimeout(900); } },

  // ---- the answer ----
  { cap: "2,178 shared. 13,057 more reachable. Zero records moved.",
    vo: "Same question, seconds later. Two thousand shared customers, thirteen thousand more reachable. Two counts crossed. Zero records moved.",
    go: async (p, h) => { await h.chip("How much does high lifetime value overlap with sports fans?"); }, extra: 0.4 },

  // ---- injection ----
  { cap: "The publisher also returned free text — and it is an attack.",
    vo: "The publisher also returned a note. It is a prompt injection, telling the agent to export everything." },

  { cap: "Quarantined as text. Never followed as an instruction.",
    vo: "It is quarantined as text, never followed. And no tool over there can return a record anyway.",
    extra: 0.2 },

  // ---- k-anonymity ----
  { cap: "Too few people matched. The number is withheld, not rounded.",
    vo: "Ask about a segment too thin to be safe, and the answer is withheld, not rounded.",
    go: async (p, h) => { await h.chip("Check luxury auto intenders"); await p.waitForTimeout(1600); },
    extra: 0.15 },

  // ---- audit + exposedTo ----
  { cap: "Every crossing is on the record, for both companies.",
    vo: "Every crossing is on the record, on both sides.",
    go: async (p, h) => { await h.chip("Show me the audit trail"); await p.waitForTimeout(1400); } },

  { cap: "exposedTo: four capabilities to this origin, nothing else.",
    vo: "The publisher exposes four capabilities here and nothing else. A third origin would not get a denial — it would not learn they exist.",
    go: async p => { await p.click('nav a[data-view="partners"]'); await p.waitForTimeout(700); },
    extra: 0.15 },

  { cap: "All of it: registerTool · exposedTo · getTools · executeTool.",
    vo: "That is the whole implementation. Registered with exposedTo, discovered with getTools, invoked with executeTool. Any agent drives it, and we ship no key.",
    go: async (p, h) => { await h.showDiagram("airlock-architecture.png"); },
    extra: 0.4 },

  // ---- revocation ----
  { cap: "Withdraw approval → the signal aborts → the tool is gone.",
    vo: "And it is revocable. Withdraw approval and the tool is unregistered. Gone, not disabled.",
    go: async (p, h) => { await h.hideDiagram(); await p.waitForTimeout(450);
                     await p.click('nav a[data-view="analysis"]'); await p.waitForTimeout(400);
                     await p.click("#btn-revoke"); await p.waitForTimeout(600);
                     await p.click('nav a[data-view="diag"]'); await p.waitForTimeout(800); } },

  // ---- close ----
  { cap: "A permission check can be argued past. A tool that does not exist cannot.\ngithub.com/jwlai-cloud/airlock-webmcp",
    vo: "Two companies answered a question about their shared customers. Neither saw the other's data. No vendor sat in between. Airlock.",
    go: async p => { await p.click('nav a[data-view="overview"]'); await p.waitForTimeout(600); },
    extra: 0.7 }
];

// `node tools/capture.js --estimate` prints what a render will cost before spending it.
// ElevenLabs bills per character of the request body's text, so rendering line by line
// through the API costs strictly less than pasting the script with <break> tags into the
// web UI -- the tags are billed too, and nineteen of them is several hundred characters.
if (argv.includes("--estimate")) {
  const chars = SCRIPT.reduce((n, b) => n + b.vo.length, 0);
  const words = SCRIPT.reduce((n, b) => n + b.vo.split(/\s+/).length, 0);
  const tagged = chars + (SCRIPT.length - 1) * '<break time="1.2s" />\n\n'.length;
  console.log(`${SCRIPT.length} lines, ${words} words`);
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
  const overhead = SCRIPT.reduce((a, b) => a + 0.15 + (b.extra || 0), 0) + 17;
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
    viewport: { width: 1440, height: 810 },   // upscaled to 1080p at mux time
    args: ["--no-first-run", "--no-default-browser-check", "--disable-sync", "--hide-scrollbars"],
    recordVideo: { dir: OUT, size: { width: 1440, height: 810 } }
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  await page.goto(A + (A.includes("?") ? "&" : "?") + "v=" + Date.now(),
                  { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
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
    const b64 = fs.readFileSync(path.resolve(__dirname, "../docs/diagrams", file)).toString("base64");
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
    await page.waitForTimeout(500);
  }
  const hideDiagram = () => page.evaluate(() => {
    const el = document.getElementById("__diag");
    if (el) el.style.opacity = "0";
  });

  // Recording against the deployed pair means every partner call is a real network
  // round trip, so a fixed delay after a click is a race: the next beat can fire while
  // the previous answer is still in flight. Wait for the assistant's reply instead.
  async function chip(label, settle = 350) {
    const before = await page.evaluate(() => document.querySelectorAll("#chat .msg.a").length);
    await page.click(`.chips button:text-is("${label}")`);
    await page.waitForFunction(
      n => document.querySelectorAll("#chat .msg.a").length > n, before, { timeout: 20000 }
    ).catch(() => {});                 // a beat that never answers still gets filmed
    await page.waitForTimeout(settle);
  }

  const helpers = { partner: page.frameLocator("#f"), chip, showDiagram, hideDiagram };
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
  await page.waitForTimeout(1200);
  const vid = page.video();
  await ctx.close();
  const raw = await vid.path();
  fs.writeFileSync(path.join(OUT, "beats.json"), JSON.stringify(beats, null, 2));

  // ── 3. mix the voice onto the picture at the beat times recorded ────────
  const mp4 = path.join(OUT, "airlock-demo.mp4");
  if (NO_VOICE) {
    sh("ffmpeg", ["-y", "-loglevel", "error", "-i", raw,
      "-vf", "scale=1920:1080:flags=lanczos",
      "-c:v", "libx264", "-preset", "slow",
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
      "-vf", "scale=1920:1080:flags=lanczos",
      "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-pix_fmt", "yuv420p",
      "-c:a", "aac", "-b:a", "160k", "-shortest", "-movflags", "+faststart", mp4]);
  }
  fs.rmSync(raw);
  const total = dur(mp4);
  const mm = `${Math.floor(total / 60)}:${String(Math.round(total % 60)).padStart(2, "0")}`;
  console.log(`\n${mp4}\nruntime ${mm}  ${total > 175 ? "*** OVER 3:00 BUDGET ***" : "(limit 3:00)"}`);
})();
