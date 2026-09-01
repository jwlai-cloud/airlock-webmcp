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
const VOICE = arg("--voice", "Samantha");
const RATE = arg("--rate", "195");        // words per minute; macOS default is ~175
const NO_VOICE = argv.includes("--no-voice");

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
    vo: "Answering it means comparing two customer lists, and neither is allowed to show the other its list." },

  { cap: "Today: a clean-room vendor, a contract, six figures, and weeks.",
    vo: "So today they hire a data clean room. A contract, a procurement cycle, six figures a year, and both companies upload their customer files to a third party.",
    extra: 0.8 },

  { cap: "The data leaves both buildings to answer one question.",
    vo: "To find out how much two lists overlap, both lists have to leave the building. The measurement creates the risk.",
    extra: 0.6 },

  // ---- why WebMCP is the right tool ----------------------------------------
  { cap: "WebMCP lets a page hand an agent a narrow set of verbs.",
    vo: "WebMCP changes that. A page hands an agent a narrow set of verbs, and the browser enforces which origins can even see them.",
    extra: 0.5 },

  { cap: "So the question can travel instead of the data.",
    vo: "So the question travels to the data, instead of the data travelling to a vendor. The browser is the clean room.",
    extra: 0.5 },

  // ---- the product ---------------------------------------------------------
  { cap: "Airlock: two ordinary web apps, on two different origins.",
    vo: "This is Airlock. Two ordinary web apps on two different origins. The advertiser's workspace, and live on the right, the publisher's own console.",
    go: async p => { await p.click('nav a[data-view="analysis"]'); }, extra: 0.8 },

  { cap: "A marketer asks in plain language. Nothing is uploaded.",
    vo: "A marketer asks in plain language. Watch the answer." },

  // ---- refusal one ---------------------------------------------------------
  { cap: "The tool that crosses the boundary is not registered yet.",
    vo: "It can't. The tool that crosses the boundary isn't registered, so it isn't in the agent's tool list at all.",
    go: async (p, h) => { await h.chip("How much does high lifetime value overlap with sports fans?");
                          await p.waitForTimeout(1500); } },

  { cap: "Nothing to call — and no wording brings it into existence.",
    vo: "That's the whole idea. A permission check can be argued past. A tool that doesn't exist cannot.",
    extra: 0.6 },

  // ---- refusal two ---------------------------------------------------------
  { cap: "Asking for the records directly is refused outright.",
    vo: "Asking for the raw records is refused outright. That tool exists only so the refusal is auditable.",
    go: async (p, h) => { await h.chip("Export Meridian's customer records");
                          await p.waitForTimeout(1900); }, extra: 0.5 },

  // ---- approval ------------------------------------------------------------
  { cap: "Approval is a business decision. A person makes it on each side.",
    vo: "So it asks for approval. That's a business decision, and a person makes it on each side.",
    go: async (p, h) => { await h.chip("Request approval to measure incremental reach");
                          await p.waitForSelector("#veil.on"); await p.waitForTimeout(500); } },

  { cap: "The request crosses to the publisher's console as a tool call.",
    vo: "One operator authorises the purpose. The request then crosses to the publisher's console, as a tool call, where their officer decides for themselves.",
    go: async (p, h) => { await p.click("#myes");
                          await h.partner.locator("#bveil.on").waitFor();
                          await p.waitForTimeout(600); }, extra: 0.6 },

  { cap: "Two approvals register the tool. Only now does it exist.",
    vo: "Two approvals, and only now is the tool registered. Consent creates the capability.",
    go: async (p, h) => { await h.partner.locator("#byes").click();
                          await p.waitForTimeout(1100); } },

  // ---- the answer ----------------------------------------------------------
  { cap: "2,178 shared. 13,057 more reachable. Zero records moved.",
    vo: "Same question, seconds later. Two thousand one hundred and seventy-eight shared customers. Thirteen thousand more reachable. Two counts crossed. Zero records moved.",
    go: async (p, h) => { await h.chip("How much does high lifetime value overlap with sports fans?");
                          await p.waitForTimeout(2100); }, extra: 0.9 },

  // ---- the injection -------------------------------------------------------
  { cap: "The publisher also returned free text — and it is an attack.",
    vo: "The publisher also returned a note. That note is a prompt injection, telling the agent to export everything." },

  { cap: "Quarantined as text. Never followed as an instruction.",
    vo: "It's quarantined as text, never followed. And even if a model believed it, no tool over there can return a record.",
    extra: 0.6 },

  // ---- k-anonymity ---------------------------------------------------------
  { cap: "Too few people matched. The number is withheld, not rounded.",
    vo: "Ask about a segment that's too thin and the answer is withheld, not rounded. Under two hundred and fifty people, so the number never leaves.",
    go: async (p, h) => { await h.chip("Check luxury auto intenders"); await p.waitForTimeout(2000); },
    extra: 0.5 },

  // ---- audit ---------------------------------------------------------------
  { cap: "Every crossing is on the record, for both companies.",
    vo: "Every crossing is on the record, on both sides.",
    go: async (p, h) => { await h.chip("Show me the audit trail"); await p.waitForTimeout(1800); } },

  // ---- mechanism -----------------------------------------------------------
  { cap: "The publisher publishes four capabilities here — and nothing else.",
    vo: "The publisher exposes four capabilities to this origin and nothing else. A third origin wouldn't get a denial. It wouldn't learn they exist.",
    go: async p => { await p.click('nav a[data-view="partners"]'); await p.waitForTimeout(700); },
    extra: 0.5 },

  { cap: "registerTool with exposedTo. getTools. executeTool.",
    vo: "That's the whole implementation. Registered with exposedTo, discovered with getTools, invoked with executeTool. No backend, no third party.",
    go: async p => { await p.click('nav a[data-view="diag"]'); await p.waitForTimeout(700); },
    extra: 0.7 },

  // ---- revocation ----------------------------------------------------------
  { cap: "Withdraw approval and the capability is gone — not disabled.",
    vo: "And it's revocable. Withdraw approval and the tool is unregistered. Gone, not disabled.",
    go: async p => { await p.click('nav a[data-view="analysis"]'); await p.waitForTimeout(500);
                     await p.click("#btn-revoke"); await p.waitForTimeout(1200); } },

  // ---- close ---------------------------------------------------------------
  { cap: "A data clean room with no clean-room vendor in it.",
    vo: "Two companies answered a question about their shared customers. Neither saw the other's data, and there was no vendor in between. Airlock.",
    go: async p => { await p.click('nav a[data-view="overview"]'); await p.waitForTimeout(600); },
    extra: 1.2 }
];

(async () => {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(VO, { recursive: true });

  // ── 1. synthesise the narration and measure it ──────────────────────────
  const clips = SCRIPT.map((b, i) => {
    if (NO_VOICE) return { len: 2.8 };
    const aiff = path.join(VO, String(i).padStart(2, "0") + ".aiff");
    const wav = aiff.replace(".aiff", ".wav");
    sh("say", ["-v", VOICE, "-r", RATE, "-o", aiff, b.vo]);
    sh("ffmpeg", ["-y", "-loglevel", "error", "-i", aiff, "-ar", "44100", "-ac", "2", wav]);
    fs.rmSync(aiff);
    return { file: wav, len: dur(wav) };
  });
  const spoken = clips.reduce((a, c) => a + c.len, 0);
  const mmss = t => `${Math.floor(t / 60)}:${String(Math.round(t % 60)).padStart(2, "0")}`;
  console.log(`narration: ${clips.length} lines, ${mmss(spoken)} spoken `
    + `(voice ${VOICE} at ${RATE} wpm)`);

  // ── 2. record, holding each caption for as long as its line takes ───────
  const ctx = await chromium.launchPersistentContext(profile(), {
    channel: "chrome", headless: true,
    viewport: { width: 1560, height: 940 },
    args: ["--no-first-run", "--no-default-browser-check", "--disable-sync", "--hide-scrollbars"],
    recordVideo: { dir: OUT, size: { width: 1560, height: 940 } }
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  await page.goto(A + "?v=" + Date.now(), { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.evaluate(() => {
    const bar = document.createElement("div");
    bar.id = "__cap";
    bar.style.cssText = `position:fixed;left:0;right:0;bottom:0;z-index:200;
      background:linear-gradient(transparent,rgba(9,17,15,.94) 45%);padding:52px 44px 28px;
      font:500 25px/1.35 "IBM Plex Sans",system-ui,sans-serif;color:#F2F5F4;
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
    await page.waitForTimeout((clips[i].len + 0.3 + (b.extra || 0)) * 1000);
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
