// Renders the slide decks to PNG at 1080p so they can be cut straight into the demo.
const { chromium } = require("playwright");
const path = require("path"), fs = require("fs");
(async () => {
  const dir = path.resolve("docs/slides");
  const browser = await chromium.launch();
  for (const f of fs.readdirSync(dir).filter(n => n.endsWith(".html"))) {
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
    await page.goto("file://" + path.join(dir, f), { waitUntil: "networkidle" });
    await page.waitForTimeout(700);
    const out = path.join(dir, f.replace(".html", ".png"));
    await page.screenshot({ path: out });
    console.log(out);
    await page.close();
  }
  await browser.close();
})();
