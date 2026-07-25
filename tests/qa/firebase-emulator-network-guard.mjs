import { chromium } from "playwright";

const baseUrl = process.env.BHUMI_QA_BASE_URL || "http://127.0.0.1:3001";
const blockedHosts = [
  "firestore.googleapis.com",
  "identitytoolkit.googleapis.com",
  "securetoken.googleapis.com",
  "cloudfunctions.net",
];
const productionRequests = [];

function isProductionFirebaseRequest(url) {
  const hostname = new URL(url).hostname;
  return blockedHosts.some((host) => hostname === host || hostname.endsWith(`.${host}`));
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();

page.on("request", (request) => {
  const url = request.url();
  if (isProductionFirebaseRequest(url)) productionRequests.push(url);
});

try {
  await page.goto(`${baseUrl}/login`, { waitUntil: "domcontentloaded", timeout: 20_000 });
  await page.locator('[data-testid="qa-emulator-email"]').fill("free-user@bhumi.test");
  await page.locator('[data-testid="qa-emulator-password"]').fill("free-pass-1");
  await page.locator('[data-testid="qa-emulator-submit"]').click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 15_000 });
  await page.goto(`${baseUrl}/profile`, { waitUntil: "domcontentloaded", timeout: 20_000 });
  await page.reload({ waitUntil: "domcontentloaded", timeout: 20_000 });
  await page.waitForTimeout(15_000);

  if (productionRequests.length > 0) {
    throw new Error(`Production Firebase requests detected: ${productionRequests.join(", ")}`);
  }

  console.log("PASS: authenticated /profile produced zero production Firebase requests");
} finally {
  await browser.close();
}
