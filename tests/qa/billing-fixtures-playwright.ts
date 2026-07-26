import { chromium, type BrowserContext, type Page, type Request } from "playwright";
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = "http://localhost:3001";
const ARTIFACT_DIR = join("qa-artifacts", "billing-runtime", "20260726-fixture-realignment");
const BLOCKED_HOSTS = [
  "firestore.googleapis.com",
  "identitytoolkit.googleapis.com",
  "securetoken.googleapis.com",
  "cloudfunctions.net",
  "play.googleapis.com",
  "androidpublisher.googleapis.com",
];
const LOCAL_FIREBASE_PORTS = new Set(["8080", "9099", "5001"]);

function getFixturePassword(email: string) {
  const digest = createHash("sha256")
    .update(`bhumiamartya-fe85c:${email}`)
    .digest("base64url")
    .slice(0, 20);
  return `Qa-${digest}!`;
}

const accounts = [
  { label: "free", email: "free-user@bhumi.test", settingsText: "Akses Publik Bhumi", premiumText: "Akses gratis", allowed: false },
  { label: "trial-active", email: "trial-active@bhumi.test", settingsText: "Masa Uji Coba Premium", premiumText: "Masa percobaan aktif", allowed: true },
  { label: "trial-exhausted", email: "trial-exhausted@bhumi.test", settingsText: "Masa Uji Coba Berakhir", premiumText: "Akses kedaluwarsa", allowed: false },
  { label: "premium-active", email: "premium-active@bhumi.test", settingsText: "Paket Premium Aktif", premiumText: "Akses premium aktif", allowed: true },
  { label: "premium-expired", email: "premium-expired@bhumi.test", settingsText: "Masa Uji Coba Berakhir", premiumText: "Akses kedaluwarsa", allowed: false },
].map((account) => ({ ...account, password: getFixturePassword(account.email) }));

type Result = { label: string; pass: boolean; note?: string };
type RequestRecord = {
  url: string;
  method: string;
  resourceType: string;
  initiator: string;
  timestamp: string;
  status?: number;
  failureReason?: string;
};

const results: Result[] = [];
const requests: RequestRecord[] = [];
const consoles: Array<{ type: string; text: string; timestamp: string }> = [];
const storageKeyNames: Record<string, string[]> = {};
const requestRecords = new WeakMap<Request, RequestRecord>();

function check(label: string, pass: boolean, note?: string) {
  results.push({ label, pass, note });
  console.log(`  ${pass ? "PASS" : "FAIL"}: ${label}${note ? ` (${note})` : ""}`);
}

function sanitizeUrl(raw: string) {
  const url = new URL(raw);
  for (const key of [...url.searchParams.keys()]) url.searchParams.set(key, "<redacted>");
  return url.toString();
}

function hostnameMatches(hostname: string, blocked: string) {
  return hostname === blocked || hostname.endsWith(`.${blocked}`);
}

function attachCapture(context: BrowserContext, page: Page) {
  context.on("request", (request) => {
    const record: RequestRecord = {
      url: sanitizeUrl(request.url()),
      method: request.method(),
      resourceType: request.resourceType(),
      initiator: request.resourceType(),
      timestamp: new Date().toISOString(),
    };
    requests.push(record);
    requestRecords.set(request, record);
  });
  context.on("response", (response) => {
    const record = requestRecords.get(response.request());
    if (record) record.status = response.status();
  });
  context.on("requestfailed", (request) => {
    const record = requestRecords.get(request);
    if (record) record.failureReason = request.failure()?.errorText || "unknown";
  });
  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) {
      consoles.push({ type: message.type(), text: message.text(), timestamp: new Date().toISOString() });
    }
  });
}

async function newSession(browser: Awaited<ReturnType<typeof chromium.launch>>) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  attachCapture(context, page);
  return { context, page };
}

async function login(page: Page, email: string, password: string) {
  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded", timeout: 30_000 });
  const emailInput = page.getByTestId("qa-emulator-email");
  await emailInput.waitFor({ state: "visible", timeout: 15_000 });
  await emailInput.fill(email);
  await page.getByTestId("qa-emulator-password").fill(password);
  await page.getByTestId("qa-emulator-submit").click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 20_000 });
}

async function logout(page: Page) {
  await page.goto(`${BASE}/settings`, { waitUntil: "domcontentloaded", timeout: 30_000 });
  const button = page.locator("button").filter({ hasText: /Keluar|Logout|Sign Out/i }).last();
  await button.waitFor({ state: "visible", timeout: 15_000 });
  page.once("dialog", (dialog) => dialog.accept());
  await button.click();
  await page.waitForURL((url) => url.origin === BASE && url.pathname !== "/settings", { timeout: 20_000 });
}

async function inspectStorageKeys(page: Page, label: string) {
  storageKeyNames[label] = await page.evaluate(() => Object.keys(localStorage).sort()).then((keys) =>
    keys.map((key) => key.startsWith("firebase:authUser:") ? "firebase:authUser:<redacted>:[DEFAULT]" : key),
  );
}

async function inspectAccount(browser: Awaited<ReturnType<typeof chromium.launch>>, account: typeof accounts[number]) {
  const { context, page } = await newSession(browser);
  console.log(`\n--- ${account.label} ---`);
  try {
    await login(page, account.email, account.password);

    await page.goto(`${BASE}/settings`, { waitUntil: "domcontentloaded", timeout: 30_000 });
    await page.getByText(`Email: ${account.email}`, { exact: false }).waitFor({ state: "visible", timeout: 15_000 });
    const settingsBody = await page.locator("body").innerText();
    check(`${account.label}: identity confirmed`, settingsBody.includes(account.email));
    check(`${account.label}: settings state rendered`, settingsBody.includes(account.settingsText), account.settingsText);
    await inspectStorageKeys(page, `${account.label}:settings`);

    await page.goto(`${BASE}/premium-bhumi`, { waitUntil: "domcontentloaded", timeout: 30_000 });
    await page.getByText("Status Akun", { exact: false }).waitFor({ state: "visible", timeout: 15_000 });
    let premiumBody = await page.locator("body").innerText();
    check(`${account.label}: premium label rendered`, premiumBody.includes(account.premiumText), account.premiumText);
    if (!account.allowed) {
      check(`${account.label}: upgrade CTA rendered`, /Langganan Sekarang|Tingkatkan ke Premium/.test(premiumBody));
    }
    await page.reload({ waitUntil: "domcontentloaded", timeout: 30_000 });
    await page.getByText("Status Akun", { exact: false }).waitFor({ state: "visible", timeout: 15_000 });
    premiumBody = await page.locator("body").innerText();
    check(`${account.label}: refresh preserves label`, premiumBody.includes(account.premiumText), account.premiumText);

    await page.goto(`${BASE}/wellness`, { waitUntil: "domcontentloaded", timeout: 30_000 });
    await page.waitForTimeout(4_000);
    let gateBody = await page.locator("body").innerText();
    const denied = /Perjalanan Berlanjut dari Dashboard|Akses Bhumi kamu perlu diperbarui/.test(gateBody);
    check(`${account.label}: premium feature ${account.allowed ? "allowed" : "denied"}`, account.allowed ? !denied : denied);
    await page.reload({ waitUntil: "domcontentloaded", timeout: 30_000 });
    await page.waitForTimeout(4_000);
    gateBody = await page.locator("body").innerText();
    const deniedAfterRefresh = /Perjalanan Berlanjut dari Dashboard|Akses Bhumi kamu perlu diperbarui/.test(gateBody);
    check(`${account.label}: feature refresh preserved`, account.allowed ? !deniedAfterRefresh : deniedAfterRefresh);
    await page.screenshot({ path: join(ARTIFACT_DIR, `${account.label}.png`), fullPage: true });
    await inspectStorageKeys(page, `${account.label}:wellness`);

    if (account.label === "premium-active") await page.waitForTimeout(15_000);
    if (account.label === "trial-exhausted") {
      await logout(page);
      await login(page, account.email, account.password);
      await page.goto(`${BASE}/wellness`, { waitUntil: "domcontentloaded", timeout: 30_000 });
      await page.waitForTimeout(4_000);
      const reloginBody = await page.locator("body").innerText();
      check("trial-exhausted: relogin does not restart trial", /Perjalanan Berlanjut from Dashboard|Perjalanan Berlanjut dari Dashboard|Akses Bhumi kamu perlu diperbarui/.test(reloginBody));
    }
  } catch (error) {
    check(`${account.label}: runtime completed`, false, error instanceof Error ? error.message : String(error));
  } finally {
    await context.close();
  }
}

async function switchingScenario(
  browser: Awaited<ReturnType<typeof chromium.launch>>,
  first: typeof accounts[number],
  second: typeof accounts[number],
  label: string,
) {
  const { context, page } = await newSession(browser);
  try {
    await login(page, first.email, first.password);
    await page.goto(`${BASE}/wellness`, { waitUntil: "domcontentloaded", timeout: 30_000 });
    await page.waitForTimeout(4_000);
    await logout(page);
    await inspectStorageKeys(page, `${label}:after-logout`);
    await login(page, second.email, second.password);
    await page.goto(`${BASE}/wellness`, { waitUntil: "domcontentloaded", timeout: 30_000 });
    await page.waitForTimeout(4_000);
    await page.reload({ waitUntil: "domcontentloaded", timeout: 30_000 });
    await page.waitForTimeout(4_000);
    const body = await page.locator("body").innerText();
    const denied = /Perjalanan Berlanjut dari Dashboard|Akses Bhumi kamu perlu diperbarui/.test(body);
    check(label, denied);
    await inspectStorageKeys(page, `${label}:second-account`);
  } catch (error) {
    check(label, false, error instanceof Error ? error.message : String(error));
  } finally {
    await context.close();
  }
}

async function exhaustedReloginScenario(browser: Awaited<ReturnType<typeof chromium.launch>>) {
  const account = accounts[2];
  const { context, page } = await newSession(browser);
  try {
    await login(page, account.email, account.password);
    await page.goto(`${BASE}/wellness`, { waitUntil: "domcontentloaded", timeout: 30_000 });
    await page.waitForTimeout(4_000);
    await logout(page);
    await login(page, account.email, account.password);
    await page.goto(`${BASE}/wellness`, { waitUntil: "domcontentloaded", timeout: 30_000 });
    await page.waitForTimeout(4_000);
    const body = await page.locator("body").innerText();
    check("trial-exhausted relogin remains exhausted", /Perjalanan Berlanjut dari Dashboard|Akses Bhumi kamu perlu diperbarui/.test(body));
  } catch (error) {
    check("trial-exhausted relogin remains exhausted", false, error instanceof Error ? error.message : String(error));
  } finally {
    await context.close();
  }
}

async function main() {
  mkdirSync(ARTIFACT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
  const switchingOnly = process.argv.includes("--switch-only");
  if (!switchingOnly) for (const account of accounts) await inspectAccount(browser, account);
  await exhaustedReloginScenario(browser);
  await switchingScenario(browser, accounts[3], accounts[0], "premium-active to free isolation");
  await switchingScenario(browser, accounts[1], accounts[2], "trial-active to exhausted isolation");
  await browser.close();

  const productionFirebase = requests.filter((request) => {
    const hostname = new URL(request.url).hostname;
    return BLOCKED_HOSTS.some((blocked) => hostnameMatches(hostname, blocked));
  });
  const googlePlay = requests.filter((request) => {
    const hostname = new URL(request.url).hostname;
    return hostnameMatches(hostname, "play.googleapis.com") || hostnameMatches(hostname, "androidpublisher.googleapis.com");
  });
  const localFirebase = requests.filter((request) => {
    const url = new URL(request.url);
    return ["127.0.0.1", "localhost"].includes(url.hostname) && LOCAL_FIREBASE_PORTS.has(url.port);
  });
  const firebaseConsole = consoles.filter((entry) => /firebase|firestore|auth emulator|hydration/i.test(entry.text));

  check("production Firebase requests are zero", productionFirebase.length === 0, String(productionFirebase.length));
  check("Google Play requests are zero", googlePlay.length === 0, String(googlePlay.length));
  check("Firebase routing or hydration console issues are zero", firebaseConsole.length === 0, String(firebaseConsole.length));

  const report = {
    generatedAt: new Date().toISOString(),
    results,
    summary: {
      totalRequests: requests.length,
      localFirebaseRequests: localFirebase.length,
      productionFirebaseRequests: productionFirebase.length,
      googlePlayRequests: googlePlay.length,
      consoleErrorsAndWarnings: consoles.length,
      firebaseRoutingOrHydrationConsoleIssues: firebaseConsole.length,
    },
    productionFirebaseRequests: productionFirebase,
    googlePlayRequests: googlePlay,
    storageKeyNames,
    consoleErrorsAndWarnings: consoles,
    requests,
  };
  writeFileSync(join(ARTIFACT_DIR, switchingOnly ? "report-switch-only.json" : "report.json"), JSON.stringify(report, null, 2));

  const failed = results.filter((result) => !result.pass);
  console.log(`\n${results.length} assertions, ${results.length - failed.length} passed, ${failed.length} failed`);
  console.log(`TOTAL_REQUESTS=${requests.length}`);
  console.log(`LOCAL_FIREBASE_REQUESTS=${localFirebase.length}`);
  console.log(`PRODUCTION_FIREBASE_REQUESTS=${productionFirebase.length}`);
  console.log(`GOOGLE_PLAY_REQUESTS=${googlePlay.length}`);
  process.exit(failed.length ? 1 : 0);
}

main().catch((error) => {
  console.error("BILLING RUNTIME FATAL:", error instanceof Error ? error.message : String(error));
  process.exit(1);
});
