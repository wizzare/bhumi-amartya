import { chromium, type BrowserContext, type Page, type Request } from "playwright";
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = "http://localhost:3001";
const PROJECT_ID = "bhumiamartya-fe85c";
const ARTIFACT_DIR = join("output", "playwright", "profile-auth-runtime-20260726");
const BLOCKED_HOSTS = [
  "firestore.googleapis.com",
  "identitytoolkit.googleapis.com",
  "securetoken.googleapis.com",
  "cloudfunctions.net",
  "play.googleapis.com",
  "androidpublisher.googleapis.com",
];
const LOCAL_FIREBASE_PORTS = new Set(["8080", "9099", "5001"]);

type Assertion = { label: string; pass: boolean; detail?: string };
type RequestRecord = {
  url: string;
  method: string;
  resourceType: string;
  timestamp: string;
  status?: number;
  failureReason?: string;
};

const assertions: Assertion[] = [];
const requests: RequestRecord[] = [];
const consoles: Array<{ type: string; text: string; timestamp: string }> = [];
const pageErrors: Array<{ text: string; timestamp: string }> = [];
const requestRecords = new WeakMap<Request, RequestRecord>();

function check(label: string, pass: boolean, detail?: string) {
  assertions.push({ label, pass, detail });
  console.log(`  ${pass ? "PASS" : "FAIL"}: ${label}${detail ? ` (${detail})` : ""}`);
}

function getFixturePassword(email: string) {
  const digest = createHash("sha256")
    .update(`${PROJECT_ID}:${email}`)
    .digest("base64url")
    .slice(0, 20);
  return `Qa-${digest}!`;
}

function sanitizeUrl(raw: string) {
  const url = new URL(raw);
  for (const key of [...url.searchParams.keys()]) url.searchParams.set(key, "<redacted>");
  return url.toString();
}

function attachCapture(context: BrowserContext, page: Page) {
  context.on("request", (request) => {
    const record: RequestRecord = {
      url: sanitizeUrl(request.url()),
      method: request.method(),
      resourceType: request.resourceType(),
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
    consoles.push({ type: message.type(), text: message.text(), timestamp: new Date().toISOString() });
  });
  page.on("pageerror", (error) => {
    pageErrors.push({ text: error.message, timestamp: new Date().toISOString() });
  });
}

async function login(page: Page, email: string) {
  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded", timeout: 30_000 });
  const emailInput = page.getByTestId("qa-emulator-email");
  const passwordInput = page.getByTestId("qa-emulator-password");
  const submit = page.getByTestId("qa-emulator-submit");
  await emailInput.waitFor({ state: "visible", timeout: 15_000 });
  check("production-facing Google login remains visible", await page.getByText("Lanjutkan dengan Google", { exact: false }).isVisible());
  check("QA email starts empty", await emailInput.inputValue() === "");
  check("QA password starts empty", await passwordInput.inputValue() === "");
  await emailInput.fill(email);
  await passwordInput.fill(getFixturePassword(email));
  await submit.click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 20_000 });
}

async function logout(page: Page) {
  await page.goto(`${BASE}/settings`, { waitUntil: "domcontentloaded", timeout: 30_000 });
  const candidates = page.getByRole("button", { name: "Keluar", exact: true });
  await candidates.waitFor({ state: "visible", timeout: 15_000 });
  const count = await candidates.count();
  if (count !== 1) throw new Error(`Expected one logout button, found ${count}`);
  page.once("dialog", (dialog) => dialog.accept());
  await candidates.click();
  await page.waitForURL((url) => url.origin === BASE && url.pathname !== "/settings", { timeout: 20_000 });
}

async function assertUnavailableProfile(page: Page, expectedName: string, screenshotName: string) {
  const response = await page.goto(`${BASE}/profile`, { waitUntil: "domcontentloaded", timeout: 30_000 });
  check(`${expectedName}: profile HTTP usable`, response?.status() === 200, String(response?.status()));
  await page.getByText(
    "Arsip Akashi sedang disiapkan. Bagian profil lainnya tetap dapat kamu jelajahi.",
    { exact: true },
  ).waitFor({ state: "visible", timeout: 20_000 });
  await page.getByText(
    "Catatan Hari Ini belum bisa disusun karena data minimum profil dan Arsip Akashi belum tersedia.",
    { exact: true },
  ).waitFor({ state: "visible", timeout: 20_000 });
  await page.getByRole("heading", { name: expectedName, exact: true }).waitFor({ state: "visible", timeout: 15_000 });

  check(`${expectedName}: profile loading exits`, await page.getByText("Membuka profilmu...", { exact: true }).count() === 0);
  check(`${expectedName}: Daily Note loading exits`, await page.getByText("Catatanmu sedang dirapikan sebentar...", { exact: true }).count() === 0);
  check(`${expectedName}: valid unavailable state renders`, true);
  const visibleBoundary = page.getByText(/Application error|Internal Server Error|Something went wrong/i);
  check(`${expectedName}: no visible runtime error boundary`, await visibleBoundary.count() === 0);
  await page.screenshot({ path: join(ARTIFACT_DIR, screenshotName), fullPage: true });
}

async function main() {
  mkdirSync(ARTIFACT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  attachCapture(context, page);

  try {
    console.log("\n--- first synthetic account ---");
    await login(page, "premium-active@bhumi.test");
    await assertUnavailableProfile(page, "PREMIUM", "premium-profile.png");

    await page.reload({ waitUntil: "domcontentloaded", timeout: 30_000 });
    await page.getByText(
      "Arsip Akashi sedang disiapkan. Bagian profil lainnya tetap dapat kamu jelajahi.",
      { exact: true },
    ).waitFor({ state: "visible", timeout: 20_000 });
    await page.waitForTimeout(15_000);
    check("hard reload preserves unavailable state", await page.getByText(
      "Catatan Hari Ini belum bisa disusun karena data minimum profil dan Arsip Akashi belum tersedia.",
      { exact: true },
    ).isVisible());
    check("15-second idle does not restore loading", await page.getByText("Catatanmu sedang dirapikan sebentar...", { exact: true }).count() === 0);
    await page.screenshot({ path: join(ARTIFACT_DIR, "premium-profile-after-reload.png"), fullPage: true });

    await logout(page);

    console.log("\n--- second synthetic account ---");
    await login(page, "trial-active@bhumi.test");
    await assertUnavailableProfile(page, "TRIAL", "trial-profile.png");
    check("account switch does not retain UID A heading", await page.getByRole("heading", { name: "PREMIUM", exact: true }).count() === 0);

    const targetedConsoleFailures = consoles.filter((entry) =>
      /Profile loading timed out|unhandled rejection|Firestore\$1|custom Firestore object|hydration|Firebase operation timeout/i.test(entry.text));
    const storageTimeouts = consoles.filter((entry) => /\[STORAGE PROVIDER\] Firebase operation timeout/i.test(entry.text));
    const storageSuccesses = consoles.filter((entry) => /\[STORAGE PROVIDER\] Firebase operation success/i.test(entry.text));
    check("AuthContext timeout error absent", !targetedConsoleFailures.some((entry) => /Profile loading timed out/i.test(entry.text)));
    check("unhandled rejections absent", pageErrors.length === 0 && !targetedConsoleFailures.some((entry) => /unhandled rejection/i.test(entry.text)));
    check("Firestore custom-object error absent", !targetedConsoleFailures.some((entry) => /Firestore\$1|custom Firestore object/i.test(entry.text)));
    check("hydration warnings absent", !targetedConsoleFailures.some((entry) => /hydration/i.test(entry.text)));
    check("storage timeout loop absent", storageTimeouts.length === 0, String(storageTimeouts.length));
    check("storage operations settle successfully", storageSuccesses.length > 0, String(storageSuccesses.length));
  } catch (error) {
    check("Playwright profile runtime completed", false, error instanceof Error ? error.message : String(error));
  } finally {
    await context.close();
    await browser.close();
  }

  const productionRequests = requests.filter((record) => {
    const hostname = new URL(record.url).hostname;
    return BLOCKED_HOSTS.some((blocked) => hostname === blocked || hostname.endsWith(`.${blocked}`));
  });
  const localAuth = requests.filter((record) => new URL(record.url).port === "9099");
  const localFirestore = requests.filter((record) => new URL(record.url).port === "8080");
  const localFunctions = requests.filter((record) => new URL(record.url).port === "5001");
  const localFirebase = requests.filter((record) => {
    const url = new URL(record.url);
    return ["127.0.0.1", "localhost"].includes(url.hostname) && LOCAL_FIREBASE_PORTS.has(url.port);
  });
  const googlePlay = productionRequests.filter((record) =>
    /play\.googleapis\.com|androidpublisher\.googleapis\.com/.test(new URL(record.url).hostname));
  const localFirestoreWrites = localFirestore.filter((record) => record.method !== "GET");

  check("local Auth requests observed", localAuth.length > 0, String(localAuth.length));
  check("local Firestore requests observed", localFirestore.length > 0, String(localFirestore.length));
  check("Activity/local Firestore writes observed", localFirestoreWrites.length > 0, String(localFirestoreWrites.length));
  check("production Firebase requests are zero", productionRequests.length === 0, String(productionRequests.length));
  check("Google Play requests are zero", googlePlay.length === 0, String(googlePlay.length));

  const report = {
    generatedAt: new Date().toISOString(),
    assertions,
    summary: {
      totalRequests: requests.length,
      localFirebaseRequests: localFirebase.length,
      localAuthRequests: localAuth.length,
      localFirestoreRequests: localFirestore.length,
      localFunctionsRequests: localFunctions.length,
      productionFirebaseRequests: productionRequests.length,
      googlePlayRequests: googlePlay.length,
      consoleMessages: consoles.length,
      pageErrors: pageErrors.length,
    },
    productionRequests,
    consoleMessages: consoles,
    pageErrors,
    requests,
  };
  writeFileSync(join(ARTIFACT_DIR, "report.json"), JSON.stringify(report, null, 2));

  const failed = assertions.filter((assertion) => !assertion.pass);
  console.log(`\n${assertions.length} assertions, ${assertions.length - failed.length} passed, ${failed.length} failed`);
  console.log(`LOCAL_AUTH_REQUESTS=${localAuth.length}`);
  console.log(`LOCAL_FIRESTORE_REQUESTS=${localFirestore.length}`);
  console.log(`LOCAL_FUNCTIONS_REQUESTS=${localFunctions.length}`);
  console.log(`PRODUCTION_FIREBASE_REQUESTS=${productionRequests.length}`);
  console.log(`GOOGLE_PLAY_REQUESTS=${googlePlay.length}`);
  process.exit(failed.length ? 1 : 0);
}

main().catch((error) => {
  console.error("PROFILE RUNTIME FATAL:", error instanceof Error ? error.message : String(error));
  process.exit(1);
});
