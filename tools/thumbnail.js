// Builds the Devpost gallery thumbnail from the real app, at the moment the claim is
// visible: the tool list showing estimate_overlap registered after both approvals.
// A screenshot of the working product is more credible than an illustration.
const { chromium } = require("playwright");
const path = require("path"), fs = require("fs");

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

(async () => {
  // Devpost shows gallery images at roughly 3:2. Below 1200px the layout hides the agent
  // rail, which is the half that shows an agent using the tools.
  const ctx = await chromium.launchPersistentContext(profile(), {
    channel: "chrome", headless: true,
    viewport: { width: 1440, height: 960 }, deviceScaleFactor: 2,   // >1200 keeps the rail visible
    args: ["--no-first-run", "--disable-sync", "--hide-scrollbars"]
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  await page.goto(A + (A.includes("?") ? "&" : "?") + "v=" + Date.now(), { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  // run the whole approval so the shot shows a real, earned result
  await page.click(`.chips button:text-is("Request approval to measure incremental reach")`);
  await page.waitForSelector("#veil.on");
  await page.click("#myes");
  await page.frameLocator("#f").locator("#bveil.on").waitFor();
  await page.frameLocator("#f").locator("#byes").click();
  await page.waitForTimeout(900);
  await page.click(`.chips button:text-is("How much does high lifetime value overlap with sports fans?")`);
  await page.waitForTimeout(2200);

  await page.screenshot({ path: "docs/diagrams/airlock-thumbnail.png" });
  console.log("docs/diagrams/airlock-thumbnail.png");
  await ctx.close();
})();
