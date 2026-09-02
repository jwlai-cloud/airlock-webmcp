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


// Defaults to the local pair; pass --base to check a deployed one, in which case the
// partner origin is whatever that page is actually configured to talk to.
const argv = process.argv.slice(2);
const baseArg = argv.indexOf("--base");
const A = baseArg >= 0 ? argv[baseArg + 1] : "http://localhost:8787/";
let B_ORIGIN = "http://localhost:8788";
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

  await page.goto(A + (A.includes("?") ? "&" : "?") + "v=" + Date.now(),
                  { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  B_ORIGIN = await page.evaluate(() => window.B_ORIGIN
    || new URL(document.getElementById("f").src).origin);
  console.log(`      checking ${A}\n      partner ${B_ORIGIN}\n`);

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
  check("A exposes 5 tools before consent", own.length === 5, own.join(", "));
  check("estimate_overlap is NOT registered before consent",
        !own.includes("estimate_overlap"));

  // the <form> carries toolname/tooldescription; the browser synthesises the schema
  const decl = await page.evaluate(async () => {
    const t = (await document.modelContext.getTools()).find(x => x.name === "check_segment_reach");
    if (!t) return null;
    const schema = typeof t.inputSchema === "string" ? JSON.parse(t.inputSchema) : t.inputSchema;
    return { desc: t.description, props: Object.keys(schema?.properties || {}) };
  });
  check("declarative form tool is published by the browser", !!decl,
        decl ? decl.props.join(", ") : "check_segment_reach absent");

  // the BYO-key path hands the model whatever declare() produces; a declarative
  // tool's schema arrives as a JSON string, so this is where that bites
  const decls = await page.evaluate(async () => {
    const ts = await document.modelContext.getTools();
    return ts.map(t => ({ name: t.name, params: Object.keys(declare(t).parameters?.properties || {}) }));
  });
  const form = decls.find(d => d.name === "check_segment_reach");
  const consentDecl = decls.find(d => d.name === "request_partner_consent");
  check("declare() keeps parameters for the declarative tool",
        !!form && form.params.includes("segment"), form ? form.params.join(",") : "absent");
  // the browser's schema for a <select> carries anyOf/const, which Gemini rejects outright
  const clean = await page.evaluate(async () => {
    const t = (await document.modelContext.getTools()).find(x => x.name === "check_segment_reach");
    const j = JSON.stringify(declare(t));
    return { hasBanned: /"(anyOf|const|title)"/.test(j), enumOk: /"enum"/.test(j) };
  });
  check("declare() strips schema keywords a model API rejects", !clean.hasBanned);
  check("declare() keeps the enum a <select> becomes", clean.enumOk);

  check("declare() keeps parameters for an imperative tool",
        !!consentDecl && consentDecl.params.includes("purpose"),
        consentDecl ? consentDecl.params.join(",") : "absent");
  check("browser synthesised its schema from the markup",
        !!decl && decl.props.includes("segment"));

  // ── cross-origin discovery ───────────────────────────────────────
  const disco = await page.evaluate(async o => {
    const all = await document.modelContext.getTools({ fromOrigins: [o] });
    return { total: all.length,
             fromB: all.filter(t => t.origin === o).map(t => t.name).sort(),
             keys: all[0] ? Object.keys(all[0]).sort() : [] };
  }, B_ORIGIN);
  check("B's 4 capabilities discoverable across the origin boundary",
        disco.fromB.length === 4, disco.fromB.join(", "));
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
  await page.waitForSelector("#veil.on", { timeout: 5000 });    // this side's operator
  await page.click("#myes");
  const partnerFrame = page.frameLocator("#f");                 // the partner's own console
  await partnerFrame.locator("#bveil.on").waitFor({ timeout: 8000 });
  check("approval request crossed to the partner's console", true);
  await partnerFrame.locator("#byes").click();                  // their governance officer
  await page.waitForFunction(() => window.__consent !== undefined, null, { timeout: 8000 })
    .catch(() => {});
  const consent = await page.evaluate(() => window.__consent);
  check("approval granted by BOTH operators", consent?.granted === true,
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
  check("estimate_overlap returns an aggregate", est.overlap > 0,
        `overlap=${est.overlap} reach=${est.publisherReach} records=${est.records}`);
  check("no records are transferred", est.records === "never transferred");
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
