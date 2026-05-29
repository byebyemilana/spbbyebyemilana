import { chromium } from "playwright";

const browser = await chromium.launch({
  headless: true,
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});

const mobile = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 1,
  isMobile: true,
});

await mobile.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
await mobile.screenshot({ path: "/private/tmp/spb-guide-mobile.png", fullPage: false });

const mobileTitle = await mobile.locator("h1").innerText();
const mobileImages = await mobile.locator("img").count();

await mobile.getByRole("button", { name: "категория поесть" }).click();
await mobile.getByRole("button", { name: "ветка синяя" }).click();
const blueFoodCount = await mobile.locator("#places article").count();

await mobile.getByRole("button", { name: "категория все" }).click();
await mobile.getByRole("button", { name: "ветка все ветки" }).click();
await mobile.locator("#place-search").fill("Елагин");
const elaginCount = await mobile.locator("#places article").count();
await mobile.locator("#places").scrollIntoViewIfNeeded();
await mobile.screenshot({ path: "/private/tmp/spb-guide-mobile-places.png", fullPage: false });

const desktop = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1,
});

await desktop.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
await desktop.screenshot({ path: "/private/tmp/spb-guide-desktop.png", fullPage: false });

await desktop.getByRole("button", { name: "ветка фиолетовая" }).click();
const purpleCount = await desktop.locator("#places article").count();
const hasMetroSections = await desktop.locator("text=metro line").count();
await desktop.locator("#places").scrollIntoViewIfNeeded();
await desktop.screenshot({ path: "/private/tmp/spb-guide-desktop-places.png", fullPage: false });

await browser.close();

console.log(
  JSON.stringify(
    {
      mobileTitle,
      mobileImages,
      blueFoodCount,
      elaginCount,
      purpleCount,
      hasMetroSections,
    },
    null,
    2,
  ),
);
