// Integration check for Airlock. Drives the same WebMCP calls an agent makes:
// getTools({fromOrigins}) + executeTool(). Runs real Chrome with the WebMCP flags
// replicated into a throwaway profile.
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


const A = "http://localhost:8787/";
const B_ORIGIN = "http://localhost:8788";
const PROFILE = profile();
const HEADED = process.argv.includes("--headed");
const VIDEO = process.argv.includes("--video");

const results = [];
const check = (name, pass, detail = "") => {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
};

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE, {
    channel: "chrome",
    headless: !HEADED,
    viewport: { width: 1500, height: 940 },
    args: ["--no-first-run", "--no-default-browser-check", "--disable-sync"],
    ...(VIDEO ? { recordVideo: { dir: path.resolve(__dirname, "../.airlock-video"),
                                 size: { width: 1500, height: 940 } } } : {})
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  page.on("dialog", d => d.accept());
  page.on("pageerror", e => check("no uncaught page error", false, e.message));

  await page.goto(A + "?v=" + Date.now(), { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);

  // ── the API exists ───────────────────────────────────────────────
  const api = await page.evaluate(() => ({
    doc: "modelContext" in document,
    nav: "modelContext" in navigator,
    rui: typeof document.modelContext?.requestUserInteraction
  }));
  check("document.modelContext present", api.doc);
  check("navigator.modelContext absent (entry point is document)", !api.nav);
  console.log(`      note: modelContext.requestUserInteraction = ${api.rui}`);

  // ── origin A's own tools, estimate_overlap withheld ──────────────
  const own = await page.evaluate(() => document.modelContext.getTools()
    .then(ts => ts.map(t => t.name).sort()));
  check("A exposes 4 tools before consent", own.length === 4, own.join(", "));
  check("estimate_overlap is NOT registered before consent",
        !own.includes("estimate_overlap"));

  // ── cross-origin discovery ───────────────────────────────────────
  const disco = await page.evaluate(async o => {
    const all = await document.modelContext.getTools({ fromOrigins: [o] });
    return { total: all.length,
             fromB: all.filter(t => t.origin === o).map(t => t.name).sort(),
             keys: all[0] ? Object.keys(all[0]).sort() : [] };
  }, B_ORIGIN);
  check("B's 3 tools discoverable across the origin boundary",
        disco.fromB.length === 3, disco.fromB.join(", "));
  console.log(`      note: fromOrigins is additive — returned ${disco.total} total`);
  console.log(`      note: RegisteredTool keys = {${disco.keys.join(", ")}}`);

  // ── executeTool input shape ──────────────────────────────────────
  const shape = await page.evaluate(async o => {
    const t = (await document.modelContext.getTools({ fromOrigins: [o] }))
      .find(x => x.name === "publisher_segment_reach");
    const out = {};
    try {
      const raw = await document.modelContext.executeTool(t, JSON.stringify({ segment: "sports-fans" }));
      out.strType = typeof raw;
      out.parsed = JSON.parse(JSON.parse(raw).content[0].text);
    } catch (e) { out.strErr = e.name + ": " + e.message; }
    try {
      await document.modelContext.executeTool(t, { segment: "sports-fans" });
      out.objOk = true;
    } catch (e) { out.objErr = e.name + ": " + e.message; }
    return out;
  }, B_ORIGIN);
  check("executeTool accepts a JSON string", shape.strType === "string", shape.strErr || "");
  check("executeTool returns a JSON string", shape.strType === "string");
  check("executeTool REJECTS a plain object", !shape.objOk, shape.objErr || "it was accepted");
  check("aggregate came back", shape.parsed?.reach > 0, JSON.stringify(shape.parsed));

  // ── refusal: row export ──────────────────────────────────────────
  const exp = await page.evaluate(async o => {
    const t = (await document.modelContext.getTools({ fromOrigins: [o] }))
      .find(x => x.name === "publisher_export_rows");
    const raw = await document.modelContext.executeTool(t, JSON.stringify({ segment: "sports-fans" }));
    return JSON.parse(JSON.parse(raw).content[0].text);
  }, B_ORIGIN);
  check("publisher_export_rows refuses", exp.refused === true, exp.reason);

  // ── refusal: k-anonymity ─────────────────────────────────────────
  const sup = await page.evaluate(async o => {
    const t = (await document.modelContext.getTools({ fromOrigins: [o] }))
      .find(x => x.name === "publisher_overlap_count");
    const thin = await document.modelContext.executeTool(t,
      JSON.stringify({ segment: "luxury-auto-intenders", cohortId: "2" }));
    const fat = await document.modelContext.executeTool(t,
      JSON.stringify({ segment: "sports-fans", cohortId: "2" }));
    return { thin: JSON.parse(JSON.parse(thin).content[0].text),
             fat:  JSON.parse(JSON.parse(fat).content[0].text) };
  }, B_ORIGIN);
  check("thin segment is suppressed below k=250", sup.thin.suppressed === true, sup.thin.reason);
  check("fat segment returns a count", sup.fat.count >= 250, "count=" + sup.fat.count);

  // ── consent gate. A click gives transient activation, which
  //    requestUserInteraction is likely to require. ────────────────
  await page.evaluate(() => {
    const b = document.createElement("button");
    b.id = "__drive";
    b.style.cssText = "position:fixed;bottom:8px;left:8px;z-index:99";
    b.textContent = "agent: request consent";
    b.onclick = async () => {
      const t = (await document.modelContext.getTools())
        .find(x => x.name === "request_partner_consent");
      const raw = await document.modelContext.executeTool(t,
        JSON.stringify({ purpose: "incremental reach measurement for Q4 planning" }));
      window.__consent = JSON.parse(JSON.parse(raw).content[0].text);
    };
    document.body.appendChild(b);
  });
  await page.click("#__drive");
  await page.waitForSelector("#veil.on", { timeout: 5000 });   // operator modal is visible
  await page.click("#myes");                                    // operator approves
  await page.waitForFunction(() => window.__consent !== undefined, null, { timeout: 8000 })
    .catch(() => {});
  const consent = await page.evaluate(() => window.__consent);
  check("consent granted through requestUserInteraction", consent?.granted === true,
        JSON.stringify(consent));

  const after = await page.evaluate(() => document.modelContext.getTools()
    .then(ts => ts.map(t => t.name).sort()));
  check("estimate_overlap EXISTS after consent", after.includes("estimate_overlap"),
        `${after.length} tools`);

  // ── the whole point: a cross-boundary aggregate ──────────────────
  const est = await page.evaluate(async () => {
    const t = (await document.modelContext.getTools()).find(x => x.name === "estimate_overlap");
    if (!t) return { missing: true };
    const raw = await document.modelContext.executeTool(t,
      JSON.stringify({ cohortId: "2", segment: "sports-fans" }));
    return JSON.parse(JSON.parse(raw).content[0].text);
  });
  check("estimate_overlap returns an aggregate", est.overlap > 0, JSON.stringify(est));
  check("partner note is tagged untrusted", /untrusted/.test(est.partnerNoteTrust || ""));

  // ── revocation ───────────────────────────────────────────────────
  await page.evaluate(async () => {
    const t = (await document.modelContext.getTools()).find(x => x.name === "revoke_partner_consent");
    await document.modelContext.executeTool(t, JSON.stringify({}));
  });
  await page.waitForTimeout(400);
  const revoked = await page.evaluate(() => document.modelContext.getTools()
    .then(ts => ts.map(t => t.name)));
  check("estimate_overlap is GONE after revoke", !revoked.includes("estimate_overlap"),
        `${revoked.length} tools`);

  await page.evaluate(() => document.getElementById("__drive")?.remove());
  await page.waitForTimeout(600);
  await ctx.close();

  const failed = results.filter(r => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})();
