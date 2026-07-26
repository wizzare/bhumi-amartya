import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium, type Page, type Request } from "playwright";

const CDP_URL = process.env.BHUMI_ANDROID_CDP_URL || "http://127.0.0.1:9222";
const ARTIFACT_DIR = process.env.BHUMI_ANDROID_ARTIFACT_DIR;
if (!ARTIFACT_DIR) throw new Error("BHUMI_ANDROID_ARTIFACT_DIR is required");

const BASE = "http://localhost";
const BLOCKED_HOSTS = new Set([
  "firestore.googleapis.com",
  "identitytoolkit.googleapis.com",
  "securetoken.googleapis.com",
  "cloudfunctions.net",
  "play.googleapis.com",
  "androidpublisher.googleapis.com",
]);

type Account = {
  label: string;
  email: string;
  settingsText: string;
  premiumText: string;
  allowed: boolean;
};

const accounts: Account[] = [
  { label: "free", email: "free-user@bhumi.test", settingsText: "Akses Publik Bhumi", premiumText: "Akses gratis", allowed: false },
  { label: "trial-active", email: "trial-active@bhumi.test", settingsText: "Masa Uji Coba Premium", premiumText: "Masa percobaan aktif", allowed: true },
  { label: "trial-exhausted", email: "trial-exhausted@bhumi.test", settingsText: "Masa Uji Coba Berakhir", premiumText: "Akses kedaluwarsa", allowed: false },
  { label: "premium-active", email: "premium-active@bhumi.test", settingsText: "Paket Premium Aktif", premiumText: "Akses premium aktif", allowed: true },
  { label: "premium-expired", email: "premium-expired@bhumi.test", settingsText: "Masa Uji Coba Berakhir", premiumText: "Akses kedaluwarsa", allowed: false },
];

type RequestRecord = {
  url: string;
  method: string;
  resourceType: string;
  timestamp: string;
  status?: number;
  failureReason?: string;
};

const results: Array<{ label: string; passed: boolean; note?: string }> = [];
const requests: RequestRecord[] = [];
const requestRecords = new WeakMap<Request, RequestRecord>();
const consoleMessages: Array<{ type: string; text: string; timestamp: string }> = [];
const pageErrors: Array<{ text: string; timestamp: string }> = [];
let profileUnavailableObserved = false;

function fixturePassword(email: string) {
  const digest = createHash("sha256")
    .update(`bhumiamartya-fe85c:${email}`)
    .digest("base64url")
    .slice(0, 20);
  return `Qa-${digest}!`;
}

function sanitizeUrl(raw: string) {
  const url = new URL(raw);
  for (const key of [...url.searchParams.keys()]) url.searchParams.set(key, "<redacted>");
  url.hash = "";
  return url.toString();
}

function check(label: string, passed: boolean, note?: string) {
  results.push({ label, passed, note });
  console.log(`${passed ? "PASS" : "FAIL"}: ${label}${note ? ` (${note})` : ""}`);
}

function attachCapture(page: Page) {
  page.on("request", (request) => {
    const record: RequestRecord = {
      url: sanitizeUrl(request.url()),
      method: request.method(),
      resourceType: request.resourceType(),
      timestamp: new Date().toISOString(),
    };
    requests.push(record);
    requestRecords.set(request, record);
  });
  page.on("response", (response) => {
    const record = requestRecords.get(response.request());
    if (record) record.status = response.status();
  });
  page.on("requestfailed", (request) => {
    const record = requestRecords.get(request);
    if (record) record.failureReason = request.failure()?.errorText || "unknown";
  });
  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) {
      consoleMessages.push({ type: message.type(), text: message.text(), timestamp: new Date().toISOString() });
    }
  });
  page.on("pageerror", (error) => pageErrors.push({ text: error.message, timestamp: new Date().toISOString() }));
}

async function login(page: Page, account: Account) {
  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 30_000 });
  const emailInput = page.getByTestId("qa-emulator-email");
  const passwordInput = page.getByTestId("qa-emulator-password");
  const submit = page.getByTestId("qa-emulator-submit");
  if (!(await emailInput.isVisible())) {
    const existingAccountLink = page.getByText("Saya Sudah Punya Akun", { exact: true });
    await existingAccountLink.waitFor({ state: "visible", timeout: 15_000 });
    await existingAccountLink.click();
  }
  await emailInput.waitFor({ state: "visible", timeout: 15_000 });
  check(`${account.label}: Android QA selectors render`, await emailInput.isVisible() && await passwordInput.isVisible() && await submit.isVisible());
  await emailInput.fill(account.email);
  await passwordInput.fill(fixturePassword(account.email));
  await submit.click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 20_000 });
  if (new URL(page.url()).pathname === "/setup/") {
    await page.getByPlaceholder("Nama Lengkap", { exact: true }).fill(`QA ${account.label}`);
    await page.locator('input[type="date"]').fill("1990-01-01");
    await page.locator('input[type="time"]').fill("12:00");
    const cityInput = page.getByPlaceholder("Kota Kelahiran", { exact: true });
    await cityInput.fill("Jakarta");
    await page.getByRole("option").first().waitFor({ state: "visible", timeout: 20_000 });
    await cityInput.press("Enter");
    const continueToDashboard = page.getByRole("button", { name: "Lanjut ke Dashboard", exact: true });
    await continueToDashboard.waitFor({ state: "visible", timeout: 15_000 });
    check(`${account.label}: emulator-only minimum profile fixture completed`, await continueToDashboard.isEnabled());
    await continueToDashboard.click();
    await page.waitForURL((url) => url.pathname === "/dashboard/", { timeout: 20_000 });
  }
  await page.locator("[aria-label=Lainnya]").waitFor({ state: "visible", timeout: 60_000 });
  const dismissOptionalUpdate = page.getByRole("button", { name: "Nanti", exact: true });
  if (await dismissOptionalUpdate.count() && await dismissOptionalUpdate.isVisible()) {
    await dismissOptionalUpdate.click();
  }
  check(`${account.label}: rendered DOM login succeeds`, !new URL(page.url()).pathname.startsWith("/login"));
}

async function navigateWithinApp(page: Page, href: string) {
  let links = page.locator(`a[href="${href}"]:visible`);
  let count = await links.count();
  if (count === 0) {
    const moreButton = page.locator("[aria-label=Lainnya]");
    if (await moreButton.count()) await moreButton.click();
    links = page.locator(`a[href="${href}"]:visible`);
    count = await links.count();
  }
  if (count === 0 && href !== "/dashboard/") {
    const dashboardLinks = page.locator('a[href="/dashboard/"]:visible');
    const dashboardCount = await dashboardLinks.count();
    const dashboardButton = page.getByRole("button", { name: "Kembali ke Dashboard", exact: true });
    const dashboardButtonCount = await dashboardButton.count();
    if (dashboardCount || dashboardButtonCount) {
      if (dashboardCount) {
      await (dashboardCount === 1 ? dashboardLinks : dashboardLinks.first()).click();
      } else {
        await dashboardButton.click();
      }
      await page.waitForURL((url) => url.pathname === "/dashboard/", { timeout: 20_000 });
      await page.locator("[aria-label=Lainnya]").waitFor({ state: "visible", timeout: 20_000 });
      links = page.locator(`a[href="${href}"]:visible`);
      count = await links.count();
      if (count === 0) {
        await page.locator("[aria-label=Lainnya]").click();
        links = page.locator(`a[href="${href}"]:visible`);
        count = await links.count();
      }
    }
  }
  if (count === 0) throw new Error(`No rendered navigation link for ${href}`);
  const link = count === 1 ? links : links.first();
  await link.click();
  await page.waitForURL((url) => url.pathname === href, { timeout: 20_000 });
}

async function logout(page: Page, label: string) {
  await navigateWithinApp(page, "/settings/");
  const button = page.locator("button").filter({ hasText: /Keluar|Logout|Sign Out/i }).last();
  await button.waitFor({ state: "visible", timeout: 15_000 });
  page.once("dialog", (dialog) => dialog.accept());
  await button.click();
  await page.waitForURL((url) => url.pathname !== "/settings", { timeout: 20_000 });
  check(`${label}: logout succeeds`, new URL(page.url()).pathname !== "/settings");
}

async function inspectAccount(page: Page, account: Account, includeProfile: boolean) {
  await login(page, account);

  check(`${account.label}: client session remains authenticated`, !new URL(page.url()).pathname.startsWith("/login"));

  await navigateWithinApp(page, "/settings/");
  await page.getByText(`Email: ${account.email}`, { exact: false }).waitFor({ state: "visible", timeout: 15_000 });
  const settingsBody = await page.locator("body").innerText();
  check(`${account.label}: identity isolated`, settingsBody.includes(account.email));
  check(`${account.label}: settings entitlement`, settingsBody.includes(account.settingsText), account.settingsText);

  await navigateWithinApp(page, "/premium-bhumi/");
  await page.getByText("Status Akun", { exact: false }).waitFor({ state: "visible", timeout: 15_000 });
  const premiumBody = await page.locator("body").innerText();
  check(`${account.label}: premium label`, premiumBody.includes(account.premiumText), account.premiumText);

  await navigateWithinApp(page, "/wellness/");
  await page.waitForTimeout(4_000);
  const gateBody = await page.locator("body").innerText();
  const denied = /Perjalanan Berlanjut dari Dashboard|Akses Bhumi kamu perlu diperbarui/.test(gateBody);
  check(`${account.label}: real premium gate ${account.allowed ? "allows" : "denies"}`, account.allowed ? !denied : denied);

  if (includeProfile) {
    await navigateWithinApp(page, "/profile/");
    await page.waitForTimeout(5_000);
    const profileBody = await page.locator("body").innerText();
    check("profile: loading exits", !/Memuat profil|Loading/i.test(profileBody));
    profileUnavailableObserved = profileBody.includes("Arsip Akashi sedang disiapkan") && profileBody.includes("Catatan Hari Ini belum bisa disusun");
    check("profile: rendered state is stable", profileUnavailableObserved || profileBody.trim().length > 100, profileUnavailableObserved ? "valid unavailable state" : "alternate fixture state");
    await page.screenshot({ path: join(ARTIFACT_DIR, "profile-free.png"), fullPage: true });
    await page.waitForTimeout(15_000);
    const idleProfileBody = await page.locator("body").innerText();
    check("profile: 15-second idle remains stable", idleProfileBody.trim().length > 100 && !/Memuat profil|Loading/i.test(idleProfileBody));
  }

  await page.screenshot({ path: join(ARTIFACT_DIR, `${account.label}.png`), fullPage: true });
  await logout(page, account.label);
}

async function switchingScenario(page: Page, first: Account, second: Account, label: string) {
  await login(page, first);
  await logout(page, first.label);
  await login(page, second);
  await navigateWithinApp(page, "/premium-bhumi/");
  await page.getByText("Status Akun", { exact: false }).waitFor({ state: "visible", timeout: 15_000 });
  const body = await page.locator("body").innerText();
  check(label, body.includes(second.premiumText) && !body.includes(first.premiumText));
  await logout(page, second.label);
}

async function main() {
  mkdirSync(ARTIFACT_DIR, { recursive: true });
  const browser = await chromium.connectOverCDP(CDP_URL);
  const page = browser.contexts().flatMap((context) => context.pages())[0];
  if (!page) throw new Error("No debuggable Android WebView page found");
  attachCapture(page);

  const accountArg = process.argv.find((arg) => arg.startsWith("--accounts="));
  const selectedLabels = accountArg?.slice("--accounts=".length).split(",").filter(Boolean);
  const selectedAccounts = selectedLabels?.length ? accounts.filter((account) => selectedLabels.includes(account.label)) : accounts;
  for (const account of selectedAccounts) await inspectAccount(page, account, account.label === "free");

  if (process.argv.includes("--switching")) {
    await switchingScenario(page, accounts[3], accounts[0], "premium-active to free isolation");
    await switchingScenario(page, accounts[1], accounts[2], "trial-active to exhausted isolation");
  }

  if (process.argv.includes("--final-idle")) {
    await login(page, accounts[3]);
    await navigateWithinApp(page, "/premium-bhumi/");
    await page.waitForTimeout(15_000);
    check("premium-active: final 15-second idle stable", (await page.locator("body").innerText()).includes(accounts[3].premiumText));
  }

  const productionRequests = requests.filter((request) => BLOCKED_HOSTS.has(new URL(request.url).hostname));
  const localAuth = requests.filter((request) => new URL(request.url).hostname === "10.0.2.2" && new URL(request.url).port === "9099");
  const localFirestore = requests.filter((request) => new URL(request.url).hostname === "10.0.2.2" && new URL(request.url).port === "8080");
  const localFunctions = requests.filter((request) => new URL(request.url).hostname === "10.0.2.2" && new URL(request.url).port === "5001");
  const firebaseConsoleIssues = consoleMessages.filter((entry) => /firebase|firestore|auth emulator|hydration/i.test(entry.text));

  check("production Firebase and Google Play requests are zero", productionRequests.length === 0, String(productionRequests.length));
  check("Firebase routing and hydration console issues are zero", firebaseConsoleIssues.length === 0, String(firebaseConsoleIssues.length));
  check("page errors are zero", pageErrors.length === 0, String(pageErrors.length));

  const report = {
    generatedAt: new Date().toISOString(),
    results,
    summary: {
      passed: results.filter((result) => result.passed).length,
      failed: results.filter((result) => !result.passed).length,
      totalRequests: requests.length,
      localAuthRequests: localAuth.length,
      localFirestoreRequests: localFirestore.length,
      localFunctionsRequests: localFunctions.length,
      productionFirebaseAndGooglePlayRequests: productionRequests.length,
      consoleErrorsAndWarnings: consoleMessages.length,
      firebaseRoutingOrHydrationConsoleIssues: firebaseConsoleIssues.length,
      pageErrors: pageErrors.length,
      profileUnavailableObserved,
    },
    productionRequests,
    firebaseConsoleIssues,
    pageErrors,
    requests,
  };
  const runName = selectedLabels?.join("-") || (process.argv.includes("--switching") ? "switching" : "full");
  writeFileSync(join(ARTIFACT_DIR, `report-${runName}.json`), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report.summary, null, 2));
  process.exit(results.some((result) => !result.passed) ? 1 : 0);
}

main().catch((error) => {
  console.error("ANDROID BILLING RUNTIME FATAL:", error instanceof Error ? error.message : String(error));
  process.exit(1);
});
