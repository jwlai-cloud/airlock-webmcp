// Does a live model actually reach for request_partner_consent, or only the router?
// The recording assumed it did. It does not, and finding that out costs one prompt
// here instead of a whole render.
const { chromium } = require("playwright");
const path = require("path"), fs = require("fs");
const KEY = (fs.readFileSync(path.resolve(__dirname, "..", ".env"), "utf8")
              .match(/^GEMINI_API_KEY=(.+)$/m) || [])[1].trim();
const MODEL = process.argv[2] || "gemini-3.6-flash";
const BASE = process.argv[3] || "https://jwlai-cloud.github.io/airlock-webmcp/site-a/";
const PROMPT = process.argv[4] || "Request approval to measure incremental reach";

function profile() {
  const dir = path.resolve(__dirname, ".airlock-profile");
  fs.mkdirSync(path.join(dir, "Default"), { recursive: true });
  fs.writeFileSync(path.join(dir, "Local State"), JSON.stringify({
    browser: { enabled_labs_experiments: ["devtools-webmcp-support@1", "enable-webmcp-testing@1"] }
  }));
  return dir;
}

(async () => {
  const ctx = await chromium.launchPersistentContext(profile(), {
    channel: "chrome", headless: true, viewport: { width: 1440, height: 810 },
    args: ["--no-first-run", "--no-default-browser-check", "--disable-sync", "--hide-scrollbars"]
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  await page.addInitScript(([k, m]) => {
    try { localStorage.setItem("airlock.gemini.key", k);
          localStorage.setItem("airlock.gemini.model", m); } catch {}
  }, [KEY, MODEL]);
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.click('nav a[data-view="analysis"]').catch(() => {});
  await page.waitForTimeout(600);

  const chip = page.locator(`.chips button:text-is("${PROMPT}")`);
  if (await chip.count()) await chip.click();
  else { await page.fill("#ask", PROMPT); await page.click("#send"); }

  const modal = await page.waitForSelector("#veil.on", { timeout: 70000 })
                          .then(() => true).catch(() => false);
  await page.waitForTimeout(1500);
  const transcript = await page.evaluate(() => [...document.querySelectorAll("#chat .msg")]
    .map(e => (e.className.includes("u") ? "USER: " : "ASST: ") + e.textContent.trim())
    .join("\n---\n"));
  console.log(`MODEL ${MODEL}\nMODAL OPENED: ${modal}\n\n${transcript}`);
  await ctx.close();
})();
