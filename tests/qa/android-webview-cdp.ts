import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium, type Request } from "playwright";

const cdpUrl = process.env.BHUMI_ANDROID_CDP_URL || "http://127.0.0.1:9222";
const artifactDir = process.env.BHUMI_ANDROID_ARTIFACT_DIR;
if (!artifactDir) throw new Error("BHUMI_ANDROID_ARTIFACT_DIR is required");

const blockedHosts = new Set([
  "firestore.googleapis.com",
  "identitytoolkit.googleapis.com",
  "securetoken.googleapis.com",
  "cloudfunctions.net",
  "play.googleapis.com",
  "androidpublisher.googleapis.com",
]);

type RequestRecord = {
  url: string;
  method: string;
  resourceType: string;
  timestamp: string;
  status?: number;
  failureReason?: string;
};

function sanitizeUrl(raw: string): string {
  const url = new URL(raw);
  for (const key of [...url.searchParams.keys()]) url.searchParams.set(key, "<redacted>");
  url.hash = "";
  return url.toString();
}

async function main() {
  mkdirSync(artifactDir, { recursive: true });
  const browser = await chromium.connectOverCDP(cdpUrl);
  const page = browser.contexts().flatMap((context) => context.pages())[0];
  if (!page) throw new Error("No debuggable Android WebView page found");

  const requests: RequestRecord[] = [];
  const requestRecords = new WeakMap<Request, RequestRecord>();
  const consoleMessages: Array<{ type: string; text: string; timestamp: string }> = [];
  const pageErrors: Array<{ text: string; timestamp: string }> = [];

  page.on("request", (request) => {
    const record = {
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
    consoleMessages.push({ type: message.type(), text: message.text(), timestamp: new Date().toISOString() });
  });
  page.on("pageerror", (error) => {
    pageErrors.push({ text: error.message, timestamp: new Date().toISOString() });
  });

  await page.reload({ waitUntil: "domcontentloaded", timeout: 30_000 });
  await page.waitForTimeout(15_000);

  const dom = await page.evaluate(() => ({
    url: location.href,
    title: document.title,
    readyState: document.readyState,
    bodyText: document.body?.innerText?.slice(0, 2_000) ?? "",
    htmlLength: document.documentElement?.outerHTML?.length ?? 0,
    qaEmail: document.querySelectorAll("[data-testid=qa-emulator-email]").length,
    qaPassword: document.querySelectorAll("[data-testid=qa-emulator-password]").length,
    qaSubmit: document.querySelectorAll("[data-testid=qa-emulator-submit]").length,
  }));
  await page.screenshot({ path: join(artifactDir, "webview-cdp.png") });

  const productionRequests = requests.filter((request) => blockedHosts.has(new URL(request.url).hostname));
  const localAuth = requests.filter((request) => new URL(request.url).hostname === "10.0.2.2" && new URL(request.url).port === "9099");
  const localFirestore = requests.filter((request) => new URL(request.url).hostname === "10.0.2.2" && new URL(request.url).port === "8080");
  const localFunctions = requests.filter((request) => new URL(request.url).hostname === "10.0.2.2" && new URL(request.url).port === "5001");
  const googlePlay = requests.filter((request) => {
    const hostname = new URL(request.url).hostname;
    return hostname === "play.googleapis.com" || hostname === "androidpublisher.googleapis.com";
  });

  const report = {
    generatedAt: new Date().toISOString(),
    dom,
    summary: {
      totalRequests: requests.length,
      localAuthRequests: localAuth.length,
      localFirestoreRequests: localFirestore.length,
      localFunctionsRequests: localFunctions.length,
      productionFirebaseRequests: productionRequests.length,
      googlePlayRequests: googlePlay.length,
      consoleErrors: consoleMessages.filter((message) => message.type === "error").length,
      pageErrors: pageErrors.length,
    },
    productionRequests,
    googlePlayRequests: googlePlay,
    consoleMessages,
    pageErrors,
    requests,
  };
  writeFileSync(join(artifactDir, "webview-cdp-report.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ dom, summary: report.summary, pageErrors, productionRequests, googlePlay }, null, 2));
  process.exit(productionRequests.length || googlePlay.length ? 1 : 0);
}

main().catch((error) => {
  console.error("ANDROID WEBVIEW CDP FATAL:", error instanceof Error ? error.message : String(error));
  process.exit(1);
});
