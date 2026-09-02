// Drives the assistant panel the way a judge with no API key will: by clicking the
// suggested prompts. verify.js calls the tools directly, so this path -- the
// deterministic router -- is otherwise untested.
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const argv = process.argv.slice(2);
const i = argv.indexOf("--base");
const A = i >= 0 ? argv[i + 1] : "http://localhost:8787/";

function profile() {
  const dir = path.resolve(__dirname, ".airlock-profile");
  fs.mkdirSync(path.join(dir, "Default"), { recursive: true });
  fs.writeFileSync(path.join(dir, "Local State"), JSON.stringify({
    browser: { enabled_labs_experiments: ["devtools-webmcp-support@1", "enable-webmcp-testing@1"] }
  }));
  return dir;
}

let fails = 0;
const check = (name, pass, detail = "") => {
  if (!pass) fails++;
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
};

(async () => {
  const ctx = await chromium.launchPersistentContext(profile(), {
    channel: "chrome", headless: true, viewport: { width: 1500, height: 940 },
    args: ["--no-first-run", "--disable-sync"]
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.goto(A + (A.includes("?") ? "&" : "?") + "v=" + Date.now(), { waitUntil: "networkidle" });
  // this suite exists to test the no-model path, so make sure no key is left over
  await page.evaluate(() => { try { localStorage.removeItem("airlock.gemini.key"); } catch {} });
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  // a judge who has pasted no key must land in the no-model fallback
  const mode = await page.textContent("#railmode");
  check("defaults to the no-model router with no key", /fallback/i.test(mode), mode.trim());

  const lastReply = () => page.evaluate(() =>
    [...document.querySelectorAll("#chat .msg.a")].pop()?.textContent.trim() || "");
  const chip = async label => {
    await page.click(`.chips button:text-is("${label}")`);
    await page.waitForTimeout(1400);
    return lastReply();
  };

  let r = await chip("What audiences do we have?");
  check("lists the advertiser's own audiences", /9,100|2,400|Lapsed|lifetime/i.test(r), r.slice(0, 90));

  r = await chip("How much does high lifetime value overlap with sports fans?");
  check("refuses before approval, and explains why",
        /no capability|not registered|not in my tool list/i.test(r), r.slice(0, 110));

  r = await chip("Export Meridian's customer records");
  check("record export is refused", /refused|never crosses/i.test(r), r.slice(0, 90));

  // the approval modal is a human gate on each side; a judge clicks both
  await page.click(`.chips button:text-is("Request approval to measure incremental reach")`);
  await page.waitForSelector("#veil.on", { timeout: 8000 });
  await page.click("#myes");
  await page.frameLocator("#f").locator("#bveil.on").waitFor({ timeout: 10000 });
  check("approval reaches the partner's own console", true);
  await page.frameLocator("#f").locator("#byes").click();
  await page.waitForTimeout(1600);
  check("both approvals reported back", /approved on both sides/i.test(await lastReply()),
        (await lastReply()).slice(0, 90));

  r = await chip("How much does high lifetime value overlap with sports fans?");
  check("now returns the aggregate", /2,178/.test(r) && /13,057/.test(r), r.slice(0, 120));

  r = await chip("Check luxury auto intenders");
  check("thin segment is withheld", /withheld|250/i.test(r), r.slice(0, 90));

  r = await chip("Show me the audit trail");
  check("audit trail reports crossings", /crossing/i.test(r), r.slice(0, 90));

  // the declarative <form> is a tool AND a control a person can use
  await page.click('nav a[data-view="partners"]');
  await page.waitForTimeout(500);
  await page.selectOption("#r-seg", "commuters");
  await page.click('#reachform button[type=submit]');
  await page.waitForTimeout(1500);
  const reach = await page.textContent("#reachout");
  check("declarative form returns a reach when submitted by hand",
        /\d/.test(reach), reach.replace(/\s+/g, " ").slice(0, 80));

  await page.click('nav a[data-view="analysis"]');
  await page.waitForTimeout(400);
  await page.click("#btn-revoke");
  await page.waitForTimeout(1200);
  const gone = await page.evaluate(() => document.modelContext.getTools()
    .then(t => !t.some(x => x.name === "estimate_overlap")));
  check("withdrawing approval unregisters the tool", gone);

  check("no uncaught page errors", errors.length === 0, errors.slice(0, 2).join(" | "));

  await ctx.close();
  console.log(fails ? `\n${fails} FAILED` : "\nall UI paths pass");
  process.exit(fails ? 1 : 0);
})();
