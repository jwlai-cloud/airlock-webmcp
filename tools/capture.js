// Records the Airlock demo by driving the live page with the same WebMCP calls an
// agent makes. Captions are injected as a lower third so the cut reads with sound off;
// narration goes over the top later.
const { chromium } = require("playwright");
const path = require("path");
// Chrome exposes WebMCP only behind chrome://flags/#enable-webmcp-testing. Rather than
// guess the Chromium feature name, replicate the enabled lab experiments into a
// throwaway profile — Chrome applies them at startup exactly as it would for a human.
const fs = require("fs");
function profile() {
  const dir = path.resolve(__dirname, ".airlock-profile");
  fs.mkdirSync(path.join(dir, "Default"), { recursive: true });
  fs.writeFileSync(path.join(dir, "Local State"), JSON.stringify({
    browser: { enabled_labs_experiments: ["devtools-webmcp-support@1", "enable-webmcp-testing@1"] }
  }));
  return dir;
}

const VIDEO_DIR = path.resolve(__dirname, "../.airlock-video");

const beats = [];                       // [{t, text}] for the narration script
let t0;

(async () => {
  const ctx = await chromium.launchPersistentContext(profile(), {
    channel: "chrome", headless: true,
    viewport: { width: 1500, height: 900 },
    args: ["--no-first-run", "--no-default-browser-check", "--disable-sync", "--hide-scrollbars"],
    recordVideo: { dir: VIDEO_DIR, size: { width: 1500, height: 900 } }
  });
  const page = ctx.pages()[0] || await ctx.newPage();

  const cap = async (text, hold = 2600) => {
    const at = ((Date.now() - t0) / 1000).toFixed(1);
    beats.push({ t: at, text });
    console.log(`${String(at).padStart(6)}s  ${text}`);
    await page.evaluate(t => { window.__cap(t); }, text);
    await page.waitForTimeout(hold);
  };
  const agent = (fn, arg) => page.evaluate(fn, arg);

  await page.goto("http://localhost:8787/?v=" + Date.now(), { waitUntil: "networkidle" });
  await page.waitForTimeout(1400);

  // caption furniture
  await page.evaluate(() => {
    const bar = document.createElement("div");
    bar.id = "__cap";
    bar.style.cssText = `position:fixed;left:0;right:0;bottom:0;z-index:80;
      background:linear-gradient(transparent,rgba(1,4,9,.92) 42%);padding:44px 40px 26px;
      font:500 26px/1.35 ui-monospace,SFMono-Regular,monospace;color:#e6edf3;
      letter-spacing:-.01em;transition:opacity .35s ease;opacity:0;pointer-events:none`;
    document.body.appendChild(bar);
    window.__cap = t => { bar.textContent = t; bar.style.opacity = t ? "1" : "0"; };
  });
  t0 = Date.now();

  // ── hook ────────────────────────────────────────────────────────
  await cap("Two companies. One question about the customers they share.", 3400);
  await cap("Neither is allowed to see the other's data.", 3000);
  await cap("Today that means a third-party clean room. Airlock does it in the browser.", 3600);

  // ── the tool list ───────────────────────────────────────────────
  await cap("Origin A publishes 4 tools to the agent.", 2600);
  await agent(() => document.querySelector("#log").scrollTo(0, 999));
  await cap("The tool that crosses the boundary is not among them.", 3000);

  // ── refusal 1: the tool does not exist ──────────────────────────
  await cap('Agent: "Estimate the overlap between high-ltv and sports-fans."', 3000);
  await agent(async () => {
    const t = (await document.modelContext.getTools()).find(x => x.name === "estimate_overlap");
    window.__log = t ? "called" : "no such tool";
  });
  await cap("estimate_overlap is not registered. There is nothing to call.", 3400);

  // ── refusal 2: rows ─────────────────────────────────────────────
  await cap('Agent: "Then just export the publisher\'s rows."', 2800);
  await agent(async o => {
    const t = (await document.modelContext.getTools({ fromOrigins: [o] }))
      .find(x => x.name === "publisher_export_rows");
    await document.modelContext.executeTool(t, JSON.stringify({ segment: "sports-fans" }));
  }, "http://localhost:8788");
  await cap("Refused. Row-level data never crosses the airlock.", 3400);

  // ── consent ─────────────────────────────────────────────────────
  await cap("Authority comes from consent, not from asking nicely.", 2800);
  await page.evaluate(() => {
    const b = document.createElement("button");
    b.id = "__drive";
    b.style.cssText = "position:fixed;right:2px;top:2px;width:8px;height:8px;opacity:0;z-index:99";
    b.onclick = async () => {
      const t = (await document.modelContext.getTools())
        .find(x => x.name === "request_partner_consent");
      await document.modelContext.executeTool(t,
        JSON.stringify({ purpose: "Incremental reach measurement for Q4 campaign planning" }));
    };
    document.body.appendChild(b);
  });
  await page.click("#__drive");
  await page.waitForSelector("#veil.on");
  await cap("Both operators approve a stated purpose.", 3600);
  await page.click("#myes");
  await page.waitForTimeout(700);
  await cap("Consent registers the tool. It now exists — and toolchange fires.", 3600);

  // ── the crossing ────────────────────────────────────────────────
  await cap("Now the same question the agent could not ask 40 seconds ago.", 3000);
  await agent(async () => {
    const t = (await document.modelContext.getTools()).find(x => x.name === "estimate_overlap");
    await document.modelContext.executeTool(t,
      JSON.stringify({ cohortId: "2", segment: "sports-fans" }));
  });
  await page.waitForTimeout(900);
  await cap("2,178 of 2,400 matched. Two aggregates crossed. Zero rows moved.", 4000);

  // ── quarantine ──────────────────────────────────────────────────
  await cap("The publisher also returned free text — and it is an attack.", 3600);
  await cap("Quarantined, rendered as text, never followed as instructions.", 3800);

  // ── k-anonymity ─────────────────────────────────────────────────
  await cap('Agent: "Same thing for luxury-auto-intenders."', 2800);
  await agent(async () => {
    const t = (await document.modelContext.getTools()).find(x => x.name === "estimate_overlap");
    await document.modelContext.executeTool(t,
      JSON.stringify({ cohortId: "2", segment: "luxury-auto-intenders" }));
  });
  await page.waitForTimeout(900);
  await cap("Too thin. Suppressed below k = 250 — the number never leaves origin B.", 4000);

  // ── revoke ──────────────────────────────────────────────────────
  await cap("And consent is revocable.", 2400);
  await agent(async () => {
    const t = (await document.modelContext.getTools()).find(x => x.name === "revoke_partner_consent");
    await document.modelContext.executeTool(t, JSON.stringify({}));
  });
  await page.waitForTimeout(900);
  await cap("The capability is gone. Not disabled — unregistered.", 3600);

  // ── close ───────────────────────────────────────────────────────
  await cap("Authority enforced by tool existence, not by a permission check.", 3600);
  await cap("Airlock — a browser-native data clean room.  github.com/jwlai-cloud/airlock-webmcp", 4200);
  await page.evaluate(() => window.__cap(""));
  await page.waitForTimeout(1000);

  await page.evaluate(() => { document.getElementById("__drive")?.remove(); });
  const vid = page.video();
  await ctx.close();
  const out = await vid.path();
  console.log("\nraw capture:", out);
  console.log("runtime:", ((Date.now() - t0) / 1000).toFixed(1) + "s");
  require("fs").writeFileSync(path.resolve(VIDEO_DIR, "beats.json"), JSON.stringify(beats, null, 2));
})();
