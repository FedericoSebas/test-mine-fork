import express from "express";
import { chromium } from 'playwright-core'
import chromiumBinary from '@sparticuz/chromium'

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate=1');
  let browser;
    console.log("Starting Chromium...");
    browser = await chromium.launch({
      args: [
    ...chromiumBinary.args,
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "--disable-setuid-sandbox",
    "--no-sandbox",
    "--disable-webgl",
    "--disable-extensions",
    "--disable-background-networking",
    "--disable-background-timer-throttling",
    "--disable-breakpad",
    "--disable-default-apps",
    "--disable-sync",
    "--disable-translate",
    "--disable-features=site-per-process",
  ],
      executablePath: await chromiumBinary.executablePath(),
      headless: true,
    });

    const context = await browser.newContext();
    const page = await context.newPage();
await page.goto("https://coinmarketcap.com/currencies/meowcoin/", {
  waitUntil: "domcontentloaded",
  timeout: 45000,
});

// 2. Live selector
const selector = 'span[data-test="text-cdp-price-display"]';

// 3. Wait until the element exists
await page.waitForSelector(selector, { timeout: 15000 });

// 4. Get initial (stale) price
let initial = (await page.textContent(selector)).trim();
initial = initial.replace(/^\$/, "");
console.log("Initial stale price:", initial);

// 5. Wait for price to change
let updated = initial;
const maxWait = 10000; // 30 seconds
const step = 500; // check every 500ms
let waited = 0;

while (waited < maxWait) {
  await page.waitForTimeout(step);
  waited += step;

  let current = (await page.textContent(selector)).trim();
  current = current.replace(/^\$/, "");

  // STRICT condition:
  if (current !== initial) {
    updated = current;
    break;
  }
}
console.log("Updated real price:", updated);


    return res.json({ updated });
  
}