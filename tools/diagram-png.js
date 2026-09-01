// Renders the delivered Archify HTML to PNG. The viewer has its own export, but a
// headless screenshot of the SVG keeps this scriptable and reproducible.
const { chromium } = require("playwright");
const path = require("path");
(async () => {
  const browser = await chromium.launch();
  for (const name of ["airlock-architecture", "airlock-sequence"]) {
    const page = await browser.newPage({ deviceScaleFactor: 2 });
    await page.goto("file://" + path.resolve(`docs/diagrams/${name}.html`),
                    { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);
    // The viewer's own chrome -- toolbar, toast, status rail, legend -- is for reading
    // the page, not for a submission asset. Hide it and shoot the diagram alone.
    await page.addStyleTag({ content: `
      .no-print, .toolbar, .archify-toast { display: none !important; }
      .container { padding: 0 !important; }
    ` });
    await page.waitForTimeout(400);
    const svg = page.locator("svg").first();
    await svg.waitFor({ timeout: 10000 });
    const out = `docs/diagrams/${name}.png`;
    await svg.screenshot({ path: out });
    console.log(out);
    await page.close();
  }
  await browser.close();
})();
