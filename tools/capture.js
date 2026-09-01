// Records the Airlock demo by driving the real product through the same WebMCP calls
// an agent makes. Captions are burned in as a lower third so the cut reads with sound
// off; narration goes over the top. Re-run to fix a single beat -- no re-shoot.
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

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

const VIDEO_DIR = path.resolve(__dirname, "../.airlock-video");
const A = "http://localhost:8787/";
const beats = [];
let t0;

(async () => {
  fs.mkdirSync(VIDEO_DIR, { recursive: true });
  const ctx = await chromium.launchPersistentContext(profile(), {
    channel: "chrome", headless: true,
    viewport: { width: 1560, height: 940 },
    args: ["--no-first-run", "--no-default-browser-check", "--disable-sync", "--hide-scrollbars"],
    recordVideo: { dir: VIDEO_DIR, size: { width: 1560, height: 940 } }
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
  t0 = Date.now();

  const cap = async (text, hold = 2800) => {
    const at = +((Date.now() - t0) / 1000).toFixed(1);
    beats.push({ at, text });
    console.log(String(at).padStart(6) + "s  " + text);
    await page.evaluate(t => window.__cap(t), text);
    await page.waitForTimeout(hold);
  };
  const chip = label => page.click(`.chips button:text-is("${label}")`);

  // ── 1. the problem ────────────────────────────────────────────────
  await cap("Two companies want to know how many customers they share.", 3300);
  await cap("Neither is allowed to see the other's customer records.", 3000);
  await cap("Today that means a clean-room vendor, a contract, and six figures.", 3400);

  // ── 2. the product ────────────────────────────────────────────────
  await page.click('nav a[data-view="analysis"]');
  await cap("Airlock is two ordinary web apps on two different origins.", 3000);
  await cap("A marketer asks in plain language. Nothing is uploaded anywhere.", 3200);

  // ── 3. refusal one: the capability does not exist ─────────────────
  await chip("How much does high lifetime value overlap with sports fans?");
  await page.waitForTimeout(1500);
  await cap("The tool that crosses the boundary is not registered yet —", 2600);
  await cap("so the agent has nothing to call, and no wording can change that.", 3600);

  // ── 4. refusal two: records ───────────────────────────────────────
  await chip("Export Meridian's customer records");
  await page.waitForTimeout(1900);
  await cap("Asking for the records directly is refused by the publisher.", 3400);

  // ── 5. two-sided approval ─────────────────────────────────────────
  await chip("Request approval to measure incremental reach");
  await page.waitForSelector("#veil.on");
  await page.waitForTimeout(500);
  await cap("Approval is a business decision, taken by a person on each side.", 3600);
  await page.click("#myes");
  const partner = page.frameLocator("#f");
  await partner.locator("#bveil.on").waitFor();
  await page.waitForTimeout(600);
  await cap("The request crosses to the publisher's own console as a tool call.", 3600);
  await partner.locator("#byes").click();
  await page.waitForTimeout(1100);
  await cap("Both approvals register the capability. Now it exists.", 3400);

  // ── 6. the answer ─────────────────────────────────────────────────
  await chip("How much does high lifetime value overlap with sports fans?");
  await page.waitForTimeout(2100);
  await cap("2,178 shared customers. 13,057 more reachable. Zero records moved.", 4200);

  // ── 7. the injection ──────────────────────────────────────────────
  await cap("The publisher also returned free text — and it is an attack.", 3400);
  await cap("Quarantined as text, never followed as an instruction.", 3600);

  // ── 8. k-anonymity ────────────────────────────────────────────────
  await chip("Check luxury auto intenders");
  await page.waitForTimeout(2000);
  await cap("Too few people matched, so the number is withheld, not rounded.", 3800);

  // ── 9. the audit trail ────────────────────────────────────────────
  await chip("Show me the audit trail");
  await page.waitForTimeout(1800);
  await cap("Every crossing is on the record, for both companies.", 3400);

  // ── 9b. the mechanism itself ──────────────────────────────────────
  await page.click('nav a[data-view="partners"]');
  await page.waitForTimeout(700);
  await cap("The publisher publishes four capabilities to this origin — and nothing else.", 3800);
  await page.click('nav a[data-view="diag"]');
  await page.waitForTimeout(700);
  await cap("Registered with exposedTo. Discovered with getTools. Invoked with executeTool.", 4000);
  await cap("The browser mediates every call. There is no server in the path.", 3600);

  // ── 10. revocation ────────────────────────────────────────────────
  await page.click('nav a[data-view="analysis"]');
  await page.waitForTimeout(500);
  await page.click("#btn-revoke");
  await page.waitForTimeout(1200);
  await cap("Withdraw approval and the capability is gone — not disabled.", 3600);

  // ── 11. close ─────────────────────────────────────────────────────
  await page.click('nav a[data-view="overview"]');
  await page.waitForTimeout(600);
  await cap("Authority comes from whether a tool exists, not from a permission check.", 3800);
  await cap("Airlock — a data clean room with no clean-room vendor in it.", 4000);
  await page.evaluate(() => window.__cap(""));
  await page.waitForTimeout(1200);

  const vid = page.video();
  await ctx.close();
  console.log("\nraw:", await vid.path());
  console.log("runtime:", ((Date.now() - t0) / 1000).toFixed(1) + "s");
  fs.writeFileSync(path.join(VIDEO_DIR, "beats.json"), JSON.stringify(beats, null, 2));
})();
