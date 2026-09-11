// Screenshot a local page for design comparison.
// Usage: node screenshot.mjs http://localhost:3000 [label] [--mobile]
// Saves to ./temporary screenshots/screenshot-N[-label].png (auto-incremented)
import puppeteer from "puppeteer";
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2).filter((a) => a !== "--mobile");
const mobile = process.argv.includes("--mobile");
const url = args[0];
const label = args[1];

if (!url) {
  console.error("Usage: node screenshot.mjs <url> [label] [--mobile]");
  process.exit(1);
}
if (url.startsWith("file://")) {
  console.error("Refusing file:// URL — serve the project with `node serve.mjs` and screenshot from localhost instead.");
  process.exit(1);
}

const OUT_DIR = path.join(process.cwd(), "temporary screenshots");
fs.mkdirSync(OUT_DIR, { recursive: true });

const existing = fs
  .readdirSync(OUT_DIR)
  .map((f) => f.match(/^screenshot-(\d+)/))
  .filter(Boolean)
  .map((m) => parseInt(m[1], 10));
const next = existing.length ? Math.max(...existing) + 1 : 1;

const fileName = `screenshot-${next}${label ? `-${label}` : ""}${mobile ? "-mobile" : ""}.png`;
const outPath = path.join(OUT_DIR, fileName);

const browser = await puppeteer.launch();
try {
  const page = await browser.newPage();
  if (mobile) {
    await page.setViewport({ width: 390, height: 844, isMobile: true, deviceScaleFactor: 2 });
  } else {
    await page.setViewport({ width: 1440, height: 900 });
  }
  await page.goto(url, { waitUntil: "networkidle0" });

  // Scroll through the full page first so lazy-loaded images/sections trigger
  // before the screenshot is taken (fullPage screenshots don't scroll on their own).
  await page.evaluate(async () => {
    const step = window.innerHeight;
    let y = 0;
    const max = document.body.scrollHeight;
    while (y < max) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 400));
      y += step;
    }
    await new Promise((r) => setTimeout(r, 500));
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 300));
  });

  // img.complete can be true before the pixel data has actually finished
  // decoding (esp. AVIF), so give the compositor extra time before capture.
  await new Promise((r) => setTimeout(r, 2500));

  await page.screenshot({ path: outPath, fullPage: true });
  console.log(`Saved ${outPath}`);
} finally {
  await browser.close();
}
