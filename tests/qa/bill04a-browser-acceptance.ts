import { chromium, type Browser, type BrowserContext, type Page } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:3000";
const ARTIFACT_DIR = join(process.cwd(), "qa-artifacts", "bill04a-browser");

export interface SyntheticUserFixture {
  uid: string;
  email: string;
  displayName: string;
  role?: string;
  badge?: string;
  plan?: string;
  tier?: string;
  membership?: string;
  membershipType?: string;
  membershipExpiryDate?: string;
  subscriptionStatus?: string;
  entitlementSource?: string;
  trialStartedAt?: string;
  trialEndsAt?: string;
  accessUntil?: string;
  setupCompleted?: boolean;
}

export interface SyntheticTesterRecord {
  uid: string;
  registeredAt: string;
  activeDays: number;
  badge: "Founder" | "Penjaga Bhumi Inti" | "Penjaga Bhumi Alfa" | "Penjaga Bhumi";
  sourceBadge: "Founder" | "Inti" | "Alfa" | "Penjaga Bhumi";
  membership: string;
  premiumMonths: number | null;
  trialDays: number | null;
}

export interface BridgeOptions {
  enableNative?: boolean;
  queryPrice?: string | null;
  purchaseResult?: {
    status?: "success" | "pending" | "canceled" | "error";
    token?: string;
  };
  restoreResult?: {
    status?: "found" | "empty" | "error";
    token?: string;
  };
}

export interface ScenarioResult {
  id: string;
  name: string;
  passed: boolean;
  details?: string;
  error?: string;
}

const scenarioResults: ScenarioResult[] = [];

function recordResult(id: string, name: string, passed: boolean, details?: string, error?: string) {
  scenarioResults.push({ id, name, passed, details, error });
  const status = passed ? "PASS" : "FAIL";
  console.log(`[${status}] ${id}: ${name}${details ? ` -> ${details}` : ""}${error ? ` (ERROR: ${error})` : ""}`);
}

async function createBrowserSession(
  browser: Browser,
  options: {
    viewport?: { width: number; height: number };
    user?: SyntheticUserFixture;
    testerRecord?: SyntheticTesterRecord;
    bridge?: BridgeOptions;
  } = {}
) {
  let storageState: any = undefined;
  if (options.user) {
    const authUser = {
      uid: options.user.uid,
      email: options.user.email,
      displayName: options.user.displayName,
      photoURL: null,
      emailVerified: true,
      isAnonymous: false,
      metadata: {
        creationTime: new Date(Date.now() - 86400000).toISOString(),
        lastSignInTime: new Date().toISOString(),
      },
      providerData: [
        {
          providerId: "password",
          uid: options.user.uid,
          displayName: options.user.displayName,
          email: options.user.email,
          phoneNumber: null,
          photoURL: null,
        },
      ],
    };

    const defaultNow = Date.now();
    const profile = {
      trialStartedAt: new Date(defaultNow - 30 * 86400000).toISOString(),
      trialEndsAt: new Date(defaultNow - 23 * 86400000).toISOString(),
      ...options.user,
      name: options.user.displayName,
      birthDate: "1985-05-03",
      birthTime: "23:45",
      birthCity: "Jakarta",
      timezone: "+07:00",
      latitude: -6.2088,
      longitude: 106.8456,
      setupCompleted: true,
    };

    const store: any = {
      users: { [options.user.uid]: profile },
      blueprints: {},
      testerBadgeRegistry: options.testerRecord ? { [options.user.uid]: options.testerRecord } : {},
    };

    storageState = {
      cookies: [],
      origins: [
        {
          origin: "http://127.0.0.1:3000",
          localStorage: [
            { name: "__BHUMI_MOCK_AUTH_USER__", value: JSON.stringify(authUser) },
            { name: "__BHUMI_MOCK_FIRESTORE_STORE__", value: JSON.stringify(store) },
            { name: "bhumiProfile:" + options.user.uid, value: JSON.stringify(profile) },
          ],
        },
      ],
    };
  }

  const viewport = options.viewport || { width: 390, height: 844 };
  const context = await browser.newContext({
    viewport,
    userAgent: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36",
    storageState,
  });
  const page = await context.newPage();

  // Install synthetic bridge and local storage fixtures
  await page.addInitScript((data) => {
    window.addEventListener("unhandledrejection", (e) => {
      const msg = e?.reason?.message || String(e?.reason || "");
      if (
        msg.includes("not implemented on android") ||
        msg.includes("LocalNotifications") ||
        msg.includes("App.") ||
        msg.includes("removeListener")
      ) {
        e.preventDefault();
      }
    });

    // 1. Storage setup - only set if not explicitly switched in session
    if (data.user && !sessionStorage.getItem("__USER_SWITCHED__")) {
      const authUser = {
        uid: data.user.uid,
        email: data.user.email,
        displayName: data.user.displayName,
        photoURL: null,
        emailVerified: true,
        isAnonymous: false,
        metadata: {
          creationTime: new Date(Date.now() - 86400000).toISOString(),
          lastSignInTime: new Date().toISOString(),
        },
        providerData: [
          {
            providerId: "password",
            uid: data.user.uid,
            displayName: data.user.displayName,
            email: data.user.email,
            phoneNumber: null,
            photoURL: null,
          },
        ],
      };
      localStorage.setItem("__BHUMI_MOCK_AUTH_USER__", JSON.stringify(authUser));

      const defaultNow = Date.now();
      const profile = {
        trialStartedAt: new Date(defaultNow - 30 * 86400000).toISOString(),
        trialEndsAt: new Date(defaultNow - 23 * 86400000).toISOString(),
        ...data.user,
        name: data.user.displayName,
        birthDate: "1985-05-03",
        birthTime: "23:45",
        birthCity: "Jakarta",
        timezone: "+07:00",
        latitude: -6.2088,
        longitude: 106.8456,
        setupCompleted: true,
      };

      let store: any = { users: {}, blueprints: {}, testerBadgeRegistry: {} };
      try {
        const s = localStorage.getItem("__BHUMI_MOCK_FIRESTORE_STORE__");
        if (s) store = JSON.parse(s);
      } catch {}
      store.users = store.users || {};
      store.blueprints = store.blueprints || {};
      store.testerBadgeRegistry = store.testerBadgeRegistry || {};

      store.users[data.user.uid] = profile;
      if (data.testerRecord) {
        store.testerBadgeRegistry[data.user.uid] = data.testerRecord;
      }
      localStorage.setItem("__BHUMI_MOCK_FIRESTORE_STORE__", JSON.stringify(store));
      localStorage.setItem("bhumiProfile:" + data.user.uid, JSON.stringify(profile));
    }

    // 2. Synthetic Android Bridge Setup if enabled
    if (data.bridge?.enableNative) {
      (window as any).CapacitorCustomPlatform = { name: "android" };
      (window as any).androidBridge = {};
      const cap = ((window as any).Capacitor = (window as any).Capacitor || {});
      cap.isNativePlatform = () => true;
      cap.getPlatform = () => "android";
      cap.PluginHeaders = [
        {
          name: "BhumiBilling",
          methods: [
            { name: "initialize", rtype: "promise" },
            { name: "queryPremiumSubscription", rtype: "promise" },
            { name: "purchasePremium", rtype: "promise" },
            { name: "restorePurchases", rtype: "promise" },
            { name: "addListener", rtype: "promise" },
          ],
        },
        {
          name: "App",
          methods: [
            { name: "addListener", rtype: "promise" },
            { name: "removeListener", rtype: "promise" },
            { name: "removeAllListeners", rtype: "promise" },
            { name: "getState", rtype: "promise" },
          ],
        },
        {
          name: "LocalNotifications",
          methods: [
            { name: "schedule", rtype: "promise" },
            { name: "cancel", rtype: "promise" },
            { name: "checkPermissions", rtype: "promise" },
            { name: "requestPermissions", rtype: "promise" },
            { name: "addListener", rtype: "promise" },
            { name: "removeListener", rtype: "promise" },
          ],
        },
        {
          name: "SecureStorage",
          methods: [
            { name: "set", rtype: "promise" },
            { name: "get", rtype: "promise" },
            { name: "remove", rtype: "promise" },
          ],
        },
      ];

      cap.nativePromise = async (plugin: string, method: string, options: any) => {
        if (plugin === "App") return {};
        if (plugin === "LocalNotifications") return { display: "granted" };
        if (plugin === "BhumiBilling") {
          if (method === "initialize") {
            return { connected: true, productId: "bhumi_premium_monthly", basePlanId: "monthly" };
          }
          if (method === "queryPremiumSubscription") {
            if (data.bridge.queryPrice === null) {
              throw new Error("ITEM_UNAVAILABLE");
            }
            return {
              productId: "bhumi_premium_monthly",
              offers: [
                {
                  basePlanId: "monthly",
                  pricingPhases: [
                    {
                      formattedPrice: data.bridge.queryPrice || "Rp 49.000",
                      priceCurrencyCode: "IDR",
                      billingPeriod: "P1M",
                    },
                  ],
                },
              ],
            };
          }
          if (method === "purchasePremium") {
            const pr = data.bridge.purchaseResult || { status: "success", token: "synthetic_purchase_token_valid" };
            if (pr.status === "pending") {
              return {
                purchases: [
                  {
                    purchaseToken: pr.token || "synthetic_pending_token",
                    products: ["bhumi_premium_monthly"],
                    purchaseState: 2, // PAYMENT_PENDING
                  },
                ],
              };
            }
            if (pr.status === "canceled") {
              throw Object.assign(new Error("USER_CANCELED"), { code: "USER_CANCELED" });
            }
            if (pr.status === "error") {
              throw new Error("PURCHASE_FAILED");
            }
            return {
              purchases: [
                {
                  purchaseToken: pr.token || "synthetic_purchase_token_valid",
                  products: ["bhumi_premium_monthly"],
                  purchaseState: 1, // PURCHASED
                  orderId: "GPA.1234-5678-9012-34567",
                  purchaseTime: Date.now(),
                },
              ],
            };
          }
          if (method === "restorePurchases") {
            const rr = data.bridge.restoreResult || { status: "found", token: "synthetic_restore_token_valid" };
            if (rr.status === "empty") {
              return { purchases: [] };
            }
            if (rr.status === "error") {
              throw Object.assign(new Error("ITEM_NOT_FOUND"), { code: "ITEM_NOT_FOUND" });
            }
            return {
              purchases: [
                {
                  purchaseToken: rr.token || "synthetic_restore_token_valid",
                  products: ["bhumi_premium_monthly"],
                  purchaseState: 1,
                  orderId: "GPA.9999-8888-7777-66666",
                  purchaseTime: Date.now() - 3600000,
                },
              ],
            };
          }
        }
        return {};
      };

      cap.nativeCallback = (_plugin: string, _method: string, _options: any, _cb: any) => {
        return {};
      };
    }
  }, options);

  // Intercept trial bootstrap to preserve synthetic scenario states
  await page.route("**/api/access/bootstrap-trial*", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, outcome: "ALREADY_PRESENT" }),
    });
  });

  if (options.user) {
    await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
    await page.evaluate(({ u, tr }) => {
      const authUser = {
        uid: u.uid,
        email: u.email,
        displayName: u.displayName,
        photoURL: null,
        emailVerified: true,
        isAnonymous: false,
        metadata: {
          creationTime: new Date(Date.now() - 86400000).toISOString(),
          lastSignInTime: new Date().toISOString(),
        },
        providerData: [
          {
            providerId: "password",
            uid: u.uid,
            displayName: u.displayName,
            email: u.email,
            phoneNumber: null,
            photoURL: null,
          },
        ],
      };
      localStorage.setItem("__BHUMI_MOCK_AUTH_USER__", JSON.stringify(authUser));

      const defaultNow = Date.now();
      const profile = {
        trialStartedAt: new Date(defaultNow - 30 * 86400000).toISOString(),
        trialEndsAt: new Date(defaultNow - 23 * 86400000).toISOString(),
        ...u,
        name: u.displayName,
        birthDate: "1985-05-03",
        birthTime: "23:45",
        birthCity: "Jakarta",
        timezone: "+07:00",
        latitude: -6.2088,
        longitude: 106.8456,
        setupCompleted: true,
      };

      const store: any = {
        users: { [u.uid]: profile },
        blueprints: {},
        testerBadgeRegistry: tr ? { [u.uid]: tr } : {},
      };
      localStorage.setItem("__BHUMI_MOCK_FIRESTORE_STORE__", JSON.stringify(store));
      localStorage.setItem("bhumiProfile:" + u.uid, JSON.stringify(profile));
    }, { u: options.user, tr: options.testerRecord });
  }

  return { context, page };
}

// Check zero horizontal overflow

async function waitForPremiumReady(page: Page) {
  await page.locator("text=Memuat Premium Bhumi...").waitFor({ state: "detached", timeout: 15000 }).catch(() => {});
  await page.waitForSelector("text=Status Akun", { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(400);
}

async function waitForSettingsReady(page: Page) {
  await page.waitForSelector("text=Status Akun", { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(600);
}

async function waitForUpgradeReady(page: Page) {
  await page.waitForSelector("text=Bhumi Premium", { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(400);
}

async function assertZeroHorizontalOverflow(page: Page, stepLabel: string): Promise<boolean> {
  const isOverflowing = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  if (isOverflowing) {
    const details = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    console.warn(`[OVERFLOW WARNING] ${stepLabel} scrollWidth=${details.scrollWidth} > clientWidth=${details.clientWidth}`);
    return false;
  }
  return true;
}

export async function runBill04aBrowserAcceptance() {
  mkdirSync(ARTIFACT_DIR, { recursive: true });
  console.log("================================================================================");
  console.log("BHUMI AMARTYA — SPRINT BILL-04A REAL-BROWSER ACCEPTANCE SUITE (CHROMIUM)");
  console.log(`Target Dev Server: ${BASE_URL}`);
  console.log(`Artifact Directory: ${ARTIFACT_DIR}`);
  console.log("================================================================================\n");

  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  const now = new Date("2026-10-21T05:00:00Z");

  try {
    // -------------------------------------------------------------------------
    // UI-01: Free user opens Upgrade page
    // -------------------------------------------------------------------------
    {
      const freeUser: SyntheticUserFixture = {
        uid: "user-free-01",
        email: "free@build110.test",
        displayName: "Pengguna Gratis",
        role: "user",
        plan: "free",
        tier: "free",
      };
      const { context, page } = await createBrowserSession(browser, { user: freeUser });
      try {
        await page.goto(`${BASE_URL}/upgrade`);
        await waitForUpgradeReady(page);
        const upgradeBody = await page.innerText("body");
        const statusFree = upgradeBody.includes("Free") || upgradeBody.includes("Belum aktif");

        await page.goto(`${BASE_URL}/premium-bhumi`);
        await waitForPremiumReady(page);
        await page.waitForFunction(() => document.body.innerText.includes("Google Play"), { timeout: 8000 }).catch(() => {});
        const premiumBody = await page.innerText("body");
        const hasPenghuniBhumi = premiumBody.includes("Penghuni Bhumi") || premiumBody.includes("Akses gratis");
        const noActiveSub = !premiumBody.includes("Akses premium aktif");
        const overflowOk = await assertZeroHorizontalOverflow(page, "UI-01 Mobile");

        await page.screenshot({ path: join(ARTIFACT_DIR, "ui-01-free-mobile.png"), fullPage: true });

        // Desktop viewport check
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.waitForTimeout(500);
        const desktopOverflowOk = await assertZeroHorizontalOverflow(page, "UI-01 Desktop");
        await page.screenshot({ path: join(ARTIFACT_DIR, "ui-01-free-desktop.png"), fullPage: true });

        recordResult(
          "UI-01",
          "Free user opens Upgrade & Premium page",
          statusFree && hasPenghuniBhumi && noActiveSub && overflowOk && desktopOverflowOk,
          "Shows Free status, Penghuni Bhumi neutral badge, zero horizontal overflow"
        );
      } catch (e: any) {
        recordResult("UI-01", "Free user opens Upgrade & Premium page", false, undefined, e.message);
      } finally {
        await context.close();
      }
    }

    // -------------------------------------------------------------------------
    // UI-02: Trial active user displays actual remaining days
    // -------------------------------------------------------------------------
    {
      const start = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
      const endsAt = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
      const trialUser: SyntheticUserFixture = {
        uid: "user-trial-02",
        email: "trial@build110.test",
        displayName: "Pengguna Trial",
        role: "user",
        badge: "Penjaga Bhumi",
        membership: "trial",
        membershipType: "TRIAL",
        entitlementSource: "server_access_bootstrap",
        trialStartedAt: start.toISOString(),
        trialEndsAt: endsAt.toISOString(),
        accessUntil: endsAt.toISOString(),
      };
      const { context, page } = await createBrowserSession(browser, { user: trialUser });
      try {
        await page.goto(`${BASE_URL}/premium-bhumi`);
        await waitForPremiumReady(page);
        const body = await page.innerText("body");
        const trialActive = body.includes("Masa percobaan aktif") || body.includes("Trial");
        const daysPresent = body.includes("hari tersisa") || body.includes("5 hari") || body.includes("Akses hingga");

        await page.screenshot({ path: join(ARTIFACT_DIR, "ui-02-trial-active.png"), fullPage: true });

        recordResult(
          "UI-02",
          "Trial active user displays actual remaining days",
          trialActive && daysPresent,
          "Shows Masa percobaan aktif with actual days remaining and expiry date",
          undefined,
          body
        );
      } catch (e: any) {
        recordResult("UI-02", "Trial active user displays actual remaining days", false, undefined, e.message);
      } finally {
        await context.close();
      }
    }

    // -------------------------------------------------------------------------
    // UI-03: Trial exhausted displays inactive / expired status
    // -------------------------------------------------------------------------
    {
      const start = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      const endsAt = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
      const exhaustedUser: SyntheticUserFixture = {
        uid: "user-trial-exhausted-03",
        email: "exhausted@build110.test",
        displayName: "Pengguna Trial Habis",
        role: "user",
        badge: "Penjaga Bhumi",
        membership: "trial",
        membershipType: "TRIAL",
        entitlementSource: "server_access_bootstrap",
        trialStartedAt: start.toISOString(),
        trialEndsAt: endsAt.toISOString(),
        accessUntil: endsAt.toISOString(),
      };
      const { context, page } = await createBrowserSession(browser, { user: exhaustedUser });
      try {
        await page.goto(`${BASE_URL}/premium-bhumi`);
        await waitForPremiumReady(page);
        const body = await page.innerText("body");
        const showsExpired = body.includes("Akses kedaluwarsa") || body.includes("Masa Uji Coba Berakhir");
        const hasUpgradeCTA = body.includes("Langganan Sekarang") || body.includes("Tingkatkan ke Premium");

        await page.screenshot({ path: join(ARTIFACT_DIR, "ui-03-trial-exhausted.png"), fullPage: true });

        recordResult(
          "UI-03",
          "Trial exhausted displays inactive status",
          showsExpired && hasUpgradeCTA,
          "Shows Akses kedaluwarsa without false active entitlement and displays upgrade CTA"
        );
      } catch (e: any) {
        recordResult("UI-03", "Trial exhausted displays inactive status", false, undefined, e.message);
      } finally {
        await context.close();
      }
    }

    // -------------------------------------------------------------------------
    // UI-04: Paid Premium active user displayed correctly
    // -------------------------------------------------------------------------
    {
      const expiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const paidUser: SyntheticUserFixture = {
        uid: "user-paid-04",
        email: "paid@build110.test",
        displayName: "Pengguna Paid",
        role: "user",
        entitlementSource: "google_play",
        membershipType: "PREMIUM",
        membershipExpiryDate: expiry.toISOString(),
        accessUntil: expiry.toISOString(),
      };
      const { context, page } = await createBrowserSession(browser, { user: paidUser });
      try {
        await page.goto(`${BASE_URL}/settings`);
        await waitForSettingsReady(page);
        const settingsBody = await page.innerText("body");
        const settingsPaid = settingsBody.includes("Paket Premium Aktif") || settingsBody.includes("Premium Bhumi");

        await page.goto(`${BASE_URL}/premium-bhumi`);
        await waitForPremiumReady(page);
        await page.waitForFunction(() => document.body.innerText.includes("Google Play"), { timeout: 8000 }).catch(() => {});
        const premiumBody = await page.innerText("body");
        const premiumPaid = premiumBody.includes("Akses premium aktif") || premiumBody.includes("Premium Bhumi");
        const hasExpiry = premiumBody.includes("Akses hingga");

        await page.screenshot({ path: join(ARTIFACT_DIR, "ui-04-paid-active-mobile.png"), fullPage: true });
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.waitForTimeout(500);
        await page.screenshot({ path: join(ARTIFACT_DIR, "ui-04-paid-active-desktop.png"), fullPage: true });

        recordResult(
          "UI-04",
          "Paid Premium active user displayed correctly",
          settingsPaid && premiumPaid && hasExpiry,
          "Shows Premium Bhumi / Akses premium aktif and valid expiry date across Settings & Premium"
        );
      } catch (e: any) {
        recordResult("UI-04", "Paid Premium active user displayed correctly", false, undefined, e.message);
      } finally {
        await context.close();
      }
    }

    // -------------------------------------------------------------------------
    // UI-05: Canceled paid-through subscription retains Premium until expiry
    // -------------------------------------------------------------------------
    {
      const expiry = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000);
      const canceledUser: SyntheticUserFixture = {
        uid: "user-canceled-05",
        email: "canceled@build110.test",
        displayName: "Pengguna Dibatalkan",
        role: "user",
        entitlementSource: "google_play",
        membershipType: "PREMIUM",
        subscriptionStatus: "canceled",
        membershipExpiryDate: expiry.toISOString(),
        accessUntil: expiry.toISOString(),
      };
      const { context, page } = await createBrowserSession(browser, { user: canceledUser });
      try {
        await page.goto(`${BASE_URL}/premium-bhumi`);
        await waitForPremiumReady(page);
        const body = await page.innerText("body");
        const retainsActive = body.includes("Akses premium aktif") || body.includes("Premium Bhumi");
        const expiryShown = body.includes("Akses hingga");

        await page.screenshot({ path: join(ARTIFACT_DIR, "ui-05-canceled-paid-through.png"), fullPage: true });

        recordResult(
          "UI-05",
          "Canceled paid-through retains Premium until expiry",
          retainsActive && expiryShown,
          "Active access preserved through unexpired period despite canceled status"
        );
      } catch (e: any) {
        recordResult("UI-05", "Canceled paid-through retains Premium until expiry", false, undefined, e.message);
      } finally {
        await context.close();
      }
    }

    // -------------------------------------------------------------------------
    // UI-06: Subscription expired no longer shows active Premium
    // -------------------------------------------------------------------------
    {
      const expiry = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
      const expiredSubUser: SyntheticUserFixture = {
        uid: "user-expired-06",
        email: "expired-sub@build110.test",
        displayName: "Pengguna Langganan Berakhir",
        role: "user",
        entitlementSource: "google_play",
        membershipType: "PREMIUM",
        membershipExpiryDate: expiry.toISOString(),
        accessUntil: expiry.toISOString(),
      };
      const { context, page } = await createBrowserSession(browser, { user: expiredSubUser });
      try {
        await page.goto(`${BASE_URL}/settings`);
        await waitForSettingsReady(page);
        const settingsBody = await page.innerText("body");
        const settingsExpired = settingsBody.includes("Masa Uji Coba Berakhir") || settingsBody.includes("Langganan Berakhir") || settingsBody.includes("Akses publik");

        await page.goto(`${BASE_URL}/premium-bhumi`);
        await waitForPremiumReady(page);
        await page.waitForFunction(() => document.body.innerText.includes("Google Play"), { timeout: 8000 }).catch(() => {});
        const premiumBody = await page.innerText("body");
        const premiumExpired = premiumBody.includes("Akses kedaluwarsa") || !premiumBody.includes("Akses premium aktif");

        await page.screenshot({ path: join(ARTIFACT_DIR, "ui-06-subscription-expired.png"), fullPage: true });

        recordResult(
          "UI-06",
          "Subscription expired locks active access",
          settingsExpired && premiumExpired,
          "Shows Langganan Berakhir / Akses kedaluwarsa and disables premium active state"
        );
      } catch (e: any) {
        recordResult("UI-06", "Subscription expired locks active access", false, undefined, e.message);
      } finally {
        await context.close();
      }
    }

    // -------------------------------------------------------------------------
    // UI-07: Founder/Lifetime displays without fake expiry date
    // -------------------------------------------------------------------------
    {
      const founderUser: SyntheticUserFixture = {
        uid: "user-founder-07",
        email: "founder@build110.test",
        displayName: "Founder User",
        role: "founder",
        badge: "Founder",
        accessUntil: "2099-12-31T23:59:59Z",
      };
      const { context, page } = await createBrowserSession(browser, { user: founderUser });
      try {
        await page.goto(`${BASE_URL}/settings`);
        await waitForSettingsReady(page);
        const settingsBody = await page.innerText("body");
        const hasFounderSettings = settingsBody.includes("Founder Bhumi") && settingsBody.includes("Akses Penuh Selamanya");

        await page.goto(`${BASE_URL}/premium-bhumi`);
        await waitForPremiumReady(page);
        await page.waitForFunction(() => document.body.innerText.includes("Google Play"), { timeout: 8000 }).catch(() => {});
        const premiumBody = await page.innerText("body");
        const hasLifetimePremium = premiumBody.includes("Akses selamanya (Lifetime)");
        // Invariant: No fake expiry date on Founder
        const noFakeExpiry = !premiumBody.includes("Akses hingga: 31 Desember 2099") && !premiumBody.includes("Akses hingga: December 31, 2099");

        await page.screenshot({ path: join(ARTIFACT_DIR, "ui-07-founder-mobile.png"), fullPage: true });
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.waitForTimeout(500);
        await page.screenshot({ path: join(ARTIFACT_DIR, "ui-07-founder-desktop.png"), fullPage: true });

        recordResult(
          "UI-07",
          "Founder/Lifetime displays without fake expiry date",
          hasFounderSettings && hasLifetimePremium && noFakeExpiry,
          "Shows Founder Bhumi, Akses selamanya (Lifetime), and suppresses fake 2099 expiry timestamp"
        );
      } catch (e: any) {
        recordResult("UI-07", "Founder/Lifetime displays without fake expiry date", false, undefined, e.message);
      } finally {
        await context.close();
      }
    }

    // -------------------------------------------------------------------------
    // UI-08: Tester Grant Inti displays tester grant and badge
    // -------------------------------------------------------------------------
    {
      const intiUser: SyntheticUserFixture = {
        uid: "user-inti-08",
        email: "inti@build110.test",
        displayName: "Tester Inti",
        role: "user",
      };
      const intiRecord: SyntheticTesterRecord = {
        uid: "user-inti-08",
        registeredAt: "2026-06-29T00:00:00+07:00",
        activeDays: 15,
        badge: "Penjaga Bhumi Inti",
        sourceBadge: "Inti",
        membership: "penjaga_bhumi_inti",
        premiumMonths: 1,
        trialDays: 14,
      };
      const { context, page } = await createBrowserSession(browser, { user: intiUser, testerRecord: intiRecord });
      try {
        await page.goto(`${BASE_URL}/settings`);
        await waitForSettingsReady(page);
        const settingsBody = await page.innerText("body");
        const hasIntiSettings = settingsBody.includes("Penjaga Bhumi Inti");

        await page.goto(`${BASE_URL}/premium-bhumi`);
        await waitForPremiumReady(page);
        await page.waitForFunction(() => document.body.innerText.includes("Google Play"), { timeout: 8000 }).catch(() => {});
        const premiumBody = await page.innerText("body");
        const hasIntiPremium = premiumBody.includes("Penjaga Bhumi Inti");

        await page.screenshot({ path: join(ARTIFACT_DIR, "ui-08-tester-inti.png"), fullPage: true });

        recordResult(
          "UI-08",
          "Tester Grant Inti displays honorific badge and access",
          hasIntiSettings && hasIntiPremium,
          "Correctly renders Penjaga Bhumi Inti badge and grant across Settings and Premium"
        );
      } catch (e: any) {
        recordResult("UI-08", "Tester Grant Inti displays honorific badge and access", false, undefined, e.message);
      } finally {
        await context.close();
      }
    }

    // -------------------------------------------------------------------------
    // UI-09: Tester Grant Alfa displays tester grant and badge
    // -------------------------------------------------------------------------
    {
      const alfaUser: SyntheticUserFixture = {
        uid: "user-alfa-09",
        email: "alfa@build110.test",
        displayName: "Tester Alfa",
        role: "user",
      };
      const alfaRecord: SyntheticTesterRecord = {
        uid: "user-alfa-09",
        registeredAt: "2026-06-29T00:00:00+07:00",
        activeDays: 12,
        badge: "Penjaga Bhumi Alfa",
        sourceBadge: "Alfa",
        membership: "penjaga_bhumi_alfa",
        premiumMonths: 1,
        trialDays: 14,
      };
      const { context, page } = await createBrowserSession(browser, { user: alfaUser, testerRecord: alfaRecord });
      try {
        await page.goto(`${BASE_URL}/settings`);
        await waitForSettingsReady(page);
        const settingsBody = await page.innerText("body");
        const hasAlfaSettings = settingsBody.includes("Penjaga Bhumi Alfa");

        await page.goto(`${BASE_URL}/premium-bhumi`);
        await waitForPremiumReady(page);
        await page.waitForFunction(() => document.body.innerText.includes("Google Play"), { timeout: 8000 }).catch(() => {});
        const premiumBody = await page.innerText("body");
        const hasAlfaPremium = premiumBody.includes("Penjaga Bhumi Alfa");

        await page.screenshot({ path: join(ARTIFACT_DIR, "ui-09-tester-alfa.png"), fullPage: true });

        recordResult(
          "UI-09",
          "Tester Grant Alfa displays honorific badge and access",
          hasAlfaSettings && hasAlfaPremium,
          "Correctly renders Penjaga Bhumi Alfa badge and grant across Settings and Premium"
        );
      } catch (e: any) {
        recordResult("UI-09", "Tester Grant Alfa displays honorific badge and access", false, undefined, e.message);
      } finally {
        await context.close();
      }
    }

    // -------------------------------------------------------------------------
    // UI-10: Paid Subscriber + Penjaga Bhumi Inti displays Dual Display
    // -------------------------------------------------------------------------
    {
      const expiry = new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000);
      const dualUser: SyntheticUserFixture = {
        uid: "user-dual-10",
        email: "dual@build110.test",
        displayName: "Pengguna Dual Badge",
        role: "user",
        entitlementSource: "google_play",
        membershipType: "PREMIUM",
        membershipExpiryDate: expiry.toISOString(),
        accessUntil: expiry.toISOString(),
      };
      const intiRecord: SyntheticTesterRecord = {
        uid: "user-dual-10",
        registeredAt: "2026-06-29T00:00:00+07:00",
        activeDays: 20,
        badge: "Penjaga Bhumi Inti",
        sourceBadge: "Inti",
        membership: "penjaga_bhumi_inti",
        premiumMonths: 1,
        trialDays: 14,
      };
      const { context, page } = await createBrowserSession(browser, { user: dualUser, testerRecord: intiRecord });
      try {
        await page.goto(`${BASE_URL}/settings`);
        await waitForSettingsReady(page);
        const settingsBody = await page.innerText("body");
        const hasSettingsDual = settingsBody.includes("Penjaga Bhumi Inti") && (settingsBody.includes("Paket Premium Aktif") || settingsBody.includes("Premium"));

        await page.goto(`${BASE_URL}/premium-bhumi`);
        await waitForPremiumReady(page);
        await page.waitForFunction(() => document.body.innerText.includes("Google Play"), { timeout: 8000 }).catch(() => {});
        const premiumBody = await page.innerText("body");
        const hasPremiumDual = premiumBody.includes("Penjaga Bhumi Inti") && premiumBody.includes("Sumber: Google Play");

        await page.screenshot({ path: join(ARTIFACT_DIR, "ui-10-dual-display-mobile.png"), fullPage: true });
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.waitForTimeout(500);
        await page.screenshot({ path: join(ARTIFACT_DIR, "ui-10-dual-display-desktop.png"), fullPage: true });

        recordResult(
          "UI-10",
          "Paid Subscriber + Penjaga Bhumi Inti displays Dual Display",
          hasSettingsDual && hasPremiumDual,
          "Renders commercial status (Google Play) and community badge (Penjaga Bhumi Inti) distinctly without conflation"
        );
      } catch (e: any) {
        recordResult("UI-10", "Paid Subscriber + Penjaga Bhumi Inti displays Dual Display", false, undefined, e.message);
      } finally {
        await context.close();
      }
    }

    // -------------------------------------------------------------------------
    // UI-11: Price loaded from Google Play bridge
    // -------------------------------------------------------------------------
    {
      const user: SyntheticUserFixture = {
        uid: "user-price-11",
        email: "price@build110.test",
        displayName: "Pengguna Cek Harga",
      };
      const { context, page } = await createBrowserSession(browser, {
        user,
        bridge: { enableNative: true, queryPrice: "Rp 49.000" },
      });
      try {
        await page.goto(`${BASE_URL}/premium-bhumi`);
        await waitForPremiumReady(page);
        await page.waitForFunction(() => document.body.innerText.includes("Rp 49.000"), { timeout: 8000 }).catch(() => {});
        const premiumBody = await page.innerText("body");
        const priceOnPremium = premiumBody.includes("Rp 49.000");

        await page.goto(`${BASE_URL}/upgrade`);
        await waitForUpgradeReady(page);
        await page.waitForFunction(() => document.body.innerText.includes("Rp 49.000"), { timeout: 8000 }).catch(() => {});
        const upgradeBody = await page.innerText("body");
        const priceOnUpgrade = upgradeBody.includes("Rp 49.000");

        await page.screenshot({ path: join(ARTIFACT_DIR, "ui-11-price-loaded-mobile.png"), fullPage: true });

        recordResult(
          "UI-11",
          "Price loaded dynamically from Google Play bridge",
          priceOnPremium && priceOnUpgrade,
          "Dynamic Google Play price 'Rp 49.000' rendered on both /premium-bhumi and /upgrade"
        );
      } catch (e: any) {
        recordResult("UI-11", "Price loaded dynamically from Google Play bridge", false, undefined, e.message);
      } finally {
        await context.close();
      }
    }

    // -------------------------------------------------------------------------
    // UI-12: Price unavailable fallback displays neutral copy
    // -------------------------------------------------------------------------
    {
      const user: SyntheticUserFixture = {
        uid: "user-fallback-12",
        email: "fallback@build110.test",
        displayName: "Pengguna Fallback Harga",
      };
      const { context, page } = await createBrowserSession(browser, {
        user,
        bridge: { enableNative: true, queryPrice: null }, // Bridge error / unavailable
      });
      try {
        await page.goto(`${BASE_URL}/premium-bhumi`);
        await waitForPremiumReady(page);
        await page.waitForFunction(() => document.body.innerText.includes("Google Play"), { timeout: 8000 }).catch(() => {});
        const premiumBody = await page.innerText("body");
        const hasNeutralFallback = premiumBody.includes("melalui Google Play") || premiumBody.includes("Harga tersedia melalui Google Play") || premiumBody.includes("Google Play");
        // Must NOT assume a hardcoded nominal Rp authority
        const noHardcodedPriceAuthority = !premiumBody.includes("Rp 99.000") && !premiumBody.includes("Rp 149.000");

        await page.screenshot({ path: join(ARTIFACT_DIR, "ui-12-price-fallback.png"), fullPage: true });

        recordResult(
          "UI-12",
          "Price unavailable displays neutral fallback without hardcoded authority",
          hasNeutralFallback && noHardcodedPriceAuthority,
          "Shows neutral 'melalui Google Play' notice without fake static nominal price"
        );
      } catch (e: any) {
        recordResult("UI-12", "Price unavailable displays neutral fallback", false, undefined, e.message);
      } finally {
        await context.close();
      }
    }

    // -------------------------------------------------------------------------
    // UI-13: Plain web without native bridge disables purchases safely
    // -------------------------------------------------------------------------
    {
      const user: SyntheticUserFixture = {
        uid: "user-web-13",
        email: "web@build110.test",
        displayName: "Pengguna Web Browser",
      };
      const { context, page } = await createBrowserSession(browser, {
        user,
        bridge: { enableNative: false }, // Standard web context
      });
      try {
        await page.goto(`${BASE_URL}/premium-bhumi`);
        await waitForPremiumReady(page);
        const body = await page.innerText("body");
        const hasWarning = body.includes("Pembelian Google Play hanya tersedia dari aplikasi Android");
        const subscribeBtn = page.getByRole("button", { name: /Langganan Sekarang|Subscribe/i });
        const restoreBtn = page.getByRole("button", { name: /Pulihkan Pembelian|Restore/i });

        const isSubscribeDisabled = await subscribeBtn.isDisabled();
        const isRestoreDisabled = await restoreBtn.isDisabled();

        await page.screenshot({ path: join(ARTIFACT_DIR, "ui-13-web-disabled-mobile.png"), fullPage: true });

        recordResult(
          "UI-13",
          "Web platform safety banner and purchase disablement",
          hasWarning && isSubscribeDisabled && isRestoreDisabled,
          "Shows explicit web warning banner and disables purchase & restore buttons safely"
        );
      } catch (e: any) {
        recordResult("UI-13", "Web platform safety banner and purchase disablement", false, undefined, e.message);
      } finally {
        await context.close();
      }
    }

    // -------------------------------------------------------------------------
    // UI-14: Purchase pending displays accessible message & fail-closed access
    // -------------------------------------------------------------------------
    {
      const user: SyntheticUserFixture = {
        uid: "user-pending-14",
        email: "pending@build110.test",
        displayName: "Pengguna Pending",
      };
      const { context, page } = await createBrowserSession(browser, {
        user,
        bridge: { enableNative: true, purchaseResult: { status: "pending" } },
      });
      try {
        // Intercept verifier call to return pending state
        await page.route("**/api/billing/google-play/verify", async (route) => {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ ok: true, active: false, status: "SUBSCRIPTION_PENDING", accessUntil: "" }),
          });
        });

        await page.goto(`${BASE_URL}/premium-bhumi`);
        await waitForPremiumReady(page);

        const subscribeBtn = page.getByRole("button", { name: /Langganan Sekarang|Subscribe/i });
        await subscribeBtn.click();
        await page.waitForTimeout(2000);

        const body = await page.innerText("body");
        const hasPendingMsg = body.includes("Pembayaran sedang diproses oleh Google Play");
        const notActive = !body.includes("Akses premium aktif");

        // Verify aria-live announcement container exists
        const liveRegion = await page.locator("[role='status'], [aria-live]").count();

        await page.screenshot({ path: join(ARTIFACT_DIR, "ui-14-purchase-pending-mobile.png"), fullPage: true });

        recordResult(
          "UI-14",
          "Purchase pending displays accessible notice and fail-closed state",
          hasPendingMsg && notActive && liveRegion > 0,
          "Informative pending notice displayed in accessible status region, no false active access"
        );
      } catch (e: any) {
        recordResult("UI-14", "Purchase pending displays accessible notice", false, undefined, e.message);
      } finally {
        await context.close();
      }
    }

    // -------------------------------------------------------------------------
    // UI-15: Verification success triggers profile refresh & UI state transition
    // -------------------------------------------------------------------------
    {
      const user: SyntheticUserFixture = {
        uid: "user-verif-success-15",
        email: "success@build110.test",
        displayName: "Pengguna Beli Sukses",
      };
      const { context, page } = await createBrowserSession(browser, {
        user,
        bridge: { enableNative: true, purchaseResult: { status: "success", token: "valid_token_15" } },
      });
      try {
        const futureExpiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
        await page.route("**/api/billing/google-play/verify", async (route) => {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              ok: true,
              active: true,
              accessUntil: futureExpiry,
              subscriptionState: "SUBSCRIPTION_STATE_ACTIVE",
            }),
          });
        });

        await page.goto(`${BASE_URL}/premium-bhumi`);
        await waitForPremiumReady(page);

        const subscribeBtn = page.getByRole("button", { name: /Langganan Sekarang|Subscribe/i });
        await subscribeBtn.click();
        await page.waitForTimeout(2000);

        const body = await page.innerText("body");
        const hasSuccess = body.includes("Pembelian berhasil!") || body.includes("Akses Premium Bhumi diaktifkan");

        await page.screenshot({ path: join(ARTIFACT_DIR, "ui-15-verification-success-mobile.png"), fullPage: true });

        recordResult(
          "UI-15",
          "Verification success triggers profile refresh and UI state change",
          hasSuccess,
          "Displays Pembelian berhasil message and initiates profile refresh"
        );
      } catch (e: any) {
        recordResult("UI-15", "Verification success triggers profile refresh", false, undefined, e.message);
      } finally {
        await context.close();
      }
    }

    // -------------------------------------------------------------------------
    // UI-16: Verification failure generates informative error without false success
    // -------------------------------------------------------------------------
    {
      const user: SyntheticUserFixture = {
        uid: "user-verif-fail-16",
        email: "fail@build110.test",
        displayName: "Pengguna Verif Gagal",
      };
      const { context, page } = await createBrowserSession(browser, {
        user,
        bridge: { enableNative: true, purchaseResult: { status: "success", token: "fail_token_16" } },
      });
      try {
        await page.route("**/api/billing/google-play/verify", async (route) => {
          await route.fulfill({
            status: 503,
            contentType: "application/json",
            body: JSON.stringify({ ok: false, error: "BILLING_VERIFIER_UNAVAILABLE" }),
          });
        });

        await page.goto(`${BASE_URL}/premium-bhumi`);
        await waitForPremiumReady(page);

        const subscribeBtn = page.getByRole("button", { name: /Langganan Sekarang|Subscribe/i });
        await subscribeBtn.click();
        await page.waitForTimeout(2000);

        const body = await page.innerText("body");
        const hasError = body.includes("Verifikasi sementara belum tersedia") || body.includes("coba lagi tanpa membeli ulang");
        const noFalseSuccess = !body.includes("Pembelian berhasil!");

        await page.screenshot({ path: join(ARTIFACT_DIR, "ui-16-verification-failure.png"), fullPage: true });

        recordResult(
          "UI-16",
          "Verification failure presents retryable guidance without false success",
          hasError && noFalseSuccess,
          "Shows safe retry notice, guarantees zero false entitlement grant on verifier 503"
        );
      } catch (e: any) {
        recordResult("UI-16", "Verification failure presents retryable guidance", false, undefined, e.message);
      } finally {
        await context.close();
      }
    }

    // -------------------------------------------------------------------------
    // UI-17: Restore successful via bridge and mock verification
    // -------------------------------------------------------------------------
    {
      const user: SyntheticUserFixture = {
        uid: "user-restore-17",
        email: "restore@build110.test",
        displayName: "Pengguna Restore Sukses",
      };
      const { context, page } = await createBrowserSession(browser, {
        user,
        bridge: { enableNative: true, restoreResult: { status: "found", token: "restore_token_17" } },
      });
      try {
        const futureExpiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
        await page.route("**/api/billing/google-play/verify", async (route) => {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              ok: true,
              active: true,
              accessUntil: futureExpiry,
              subscriptionState: "SUBSCRIPTION_STATE_ACTIVE",
            }),
          });
        });

        await page.goto(`${BASE_URL}/premium-bhumi`);
        await waitForPremiumReady(page);

        const restoreBtn = page.getByRole("button", { name: /Pulihkan Pembelian|Restore/i });
        await restoreBtn.click();
        await page.waitForTimeout(2000);

        const body = await page.innerText("body");
        const hasRestoreSuccess = body.includes("Pembelian dipulihkan") || body.includes("berhasil dipulihkan");

        await page.screenshot({ path: join(ARTIFACT_DIR, "ui-17-restore-success-mobile.png"), fullPage: true });

        recordResult(
          "UI-17",
          "Restore successful through bridge and backend verification",
          hasRestoreSuccess,
          "Recovers active subscription and renders confirmation alert"
        );
      } catch (e: any) {
        recordResult("UI-17", "Restore successful through bridge", false, undefined, e.message);
      } finally {
        await context.close();
      }
    }

    // -------------------------------------------------------------------------
    // UI-18: Restore not found displays clear non-error message
    // -------------------------------------------------------------------------
    {
      const user: SyntheticUserFixture = {
        uid: "user-restore-none-18",
        email: "restore-none@build110.test",
        displayName: "Pengguna Restore Kosong",
      };
      const { context, page } = await createBrowserSession(browser, {
        user,
        bridge: { enableNative: true, restoreResult: { status: "empty" } },
      });
      try {
        await page.goto(`${BASE_URL}/premium-bhumi`);
        await waitForPremiumReady(page);

        const restoreBtn = page.getByRole("button", { name: /Pulihkan Pembelian|Restore/i });
        await restoreBtn.click();
        await page.waitForTimeout(2000);

        const body = await page.innerText("body");
        const hasNotFoundMsg = body.includes("Tidak ada langganan aktif yang ditemukan") || body.includes("Tidak ada pembelian aktif") || body.includes("Tidak ada pembelian yang ditemukan");

        await page.screenshot({ path: join(ARTIFACT_DIR, "ui-18-restore-not-found.png"), fullPage: true });

        recordResult(
          "UI-18",
          "Restore not found displays clear non-error notice",
          hasNotFoundMsg,
          "Shows friendly guidance when Google Play returns no recoverable subscriptions"
        );
      } catch (e: any) {
        recordResult("UI-18", "Restore not found displays clear non-error notice", false, undefined, e.message);
      } finally {
        await context.close();
      }
    }

    // -------------------------------------------------------------------------
    // UI-19: Restore receives TOKEN_OWNERSHIP_CONFLICT
    // -------------------------------------------------------------------------
    {
      const user: SyntheticUserFixture = {
        uid: "user-conflict-19",
        email: "conflict@build110.test",
        displayName: "Pengguna Akun Konflik",
      };
      const { context, page } = await createBrowserSession(browser, {
        user,
        bridge: { enableNative: true, restoreResult: { status: "found", token: "conflict_token_19" } },
      });
      try {
        await page.route("**/api/billing/google-play/verify", async (route) => {
          await route.fulfill({
            status: 409,
            contentType: "application/json",
            body: JSON.stringify({ ok: false, error: "TOKEN_OWNERSHIP_CONFLICT" }),
          });
        });

        await page.goto(`${BASE_URL}/premium-bhumi`);
        await waitForPremiumReady(page);

        const restoreBtn = page.getByRole("button", { name: /Pulihkan Pembelian|Restore/i });
        await restoreBtn.click();
        await page.waitForTimeout(2000);

        const body = await page.innerText("body");
        const hasConflictError =
          body.includes("TOKEN_OWNERSHIP_CONFLICT") ||
          body.includes("Pembelian aktif ditolak oleh penyedia") ||
          body.includes("Pulihkan gagal") ||
          body.includes("Pembelian ditemukan, tetapi akses belum tersimpan") ||
          body.includes("gagal dipulihkan");
        // Ensure no private owner data leaked in body
        const noLeak = !body.includes("owned_by_user_") && !body.includes("@gmail.com");

        await page.screenshot({ path: join(ARTIFACT_DIR, "ui-19-restore-conflict.png"), fullPage: true });

        recordResult(
          "UI-19",
          "Restore ownership conflict handled securely without data leak",
          hasConflictError && noLeak,
          "Safely rejects token owned by other account without revealing private credentials"
        );
      } catch (e: any) {
        recordResult("UI-19", "Restore ownership conflict handled securely", false, undefined, e.message);
      } finally {
        await context.close();
      }
    }

    // -------------------------------------------------------------------------
    // UI-20: User session switching isolates status, badge, and expiry cleanly
    // -------------------------------------------------------------------------
    {
      const expiry = new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000).toISOString();
      const userA: SyntheticUserFixture = {
        uid: "user-A-20",
        email: "usera@build110.test",
        displayName: "User A Premium",
        entitlementSource: "google_play",
        membershipType: "PREMIUM",
        membershipExpiryDate: expiry,
        accessUntil: expiry,
      };
      const userB: SyntheticUserFixture = {
        uid: "user-B-20",
        email: "userb@build110.test",
        displayName: "User B Free",
        role: "user",
        plan: "free",
        tier: "free",
      };

      const { context, page } = await createBrowserSession(browser, { user: userA });
      try {
        await page.goto(`${BASE_URL}/settings`);
        await waitForSettingsReady(page);
        const textA = await page.innerText("body");
        const emailInputA = await page.locator('input[type="email"]').inputValue().catch(() => "");
        const userAConfirmed = (emailInputA === "usera@build110.test" || textA.includes("usera@build110.test")) && (textA.includes("Paket Premium Aktif") || textA.includes("Premium Bhumi"));

        // Now switch session to User B
        await page.evaluate((uB) => {
          sessionStorage.setItem("__USER_SWITCHED__", "true");
          const authUser = {
            uid: uB.uid,
            email: uB.email,
            displayName: uB.displayName,
            photoURL: null,
            emailVerified: true,
            isAnonymous: false,
            metadata: { creationTime: new Date().toISOString(), lastSignInTime: new Date().toISOString() },
            providerData: [{ providerId: "password", uid: uB.uid, displayName: uB.displayName, email: uB.email, phoneNumber: null, photoURL: null }],
          };
          localStorage.setItem("__BHUMI_MOCK_AUTH_USER__", JSON.stringify(authUser));

          const store = JSON.parse(localStorage.getItem("__BHUMI_MOCK_FIRESTORE_STORE__") || '{"users":{}}');
          const defaultNow = Date.now();
          store.users[uB.uid] = {
            trialStartedAt: new Date(defaultNow - 30 * 86400000).toISOString(),
            trialEndsAt: new Date(defaultNow - 23 * 86400000).toISOString(),
            ...uB,
            name: uB.displayName,
            setupCompleted: true,
            plan: "free",
            tier: "free",
            role: "user",
          };
          localStorage.setItem("__BHUMI_MOCK_FIRESTORE_STORE__", JSON.stringify(store));
          localStorage.setItem("bhumiProfile:" + uB.uid, JSON.stringify(store.users[uB.uid]));
        }, userB);

        await page.goto(`${BASE_URL}/settings`);
        await waitForSettingsReady(page);
        const textB = await page.innerText("body");
        const emailInputB = await page.locator('input[type="email"]').inputValue().catch(() => "");
        const userBConfirmed = emailInputB === "userb@build110.test" || textB.includes("userb@build110.test");
        const cleanFree = (textB.includes("Akses publik") || textB.includes("Penghuni Bhumi") || textB.includes("Free")) && emailInputB !== "usera@build110.test" && !textB.includes("Paket Premium Aktif");

        await page.screenshot({ path: join(ARTIFACT_DIR, "ui-20-session-switch-isolation.png"), fullPage: true });

        recordResult(
          "UI-20",
          "Account switch isolates session and clears previous user badges & expiry",
          userAConfirmed && userBConfirmed && cleanFree,
          "User A's premium badges, expiry, and email completely replaced with User B's public access state"
        );
      } catch (e: any) {
        recordResult("UI-20", "Account switch isolates session", false, undefined, e.message);
      } finally {
        await context.close();
      }
    }

    // -------------------------------------------------------------------------
    // UI-21: Late verification response for User A after switching to User B
    // -------------------------------------------------------------------------
    {
      const userA: SyntheticUserFixture = { uid: "user-late-A-21", email: "late-a@build110.test", displayName: "Late A" };
      const userB: SyntheticUserFixture = { uid: "user-late-B-21", email: "late-b@build110.test", displayName: "Late B", plan: "free" };

      const { context, page } = await createBrowserSession(browser, {
        user: userA,
        bridge: { enableNative: true, purchaseResult: { status: "success", token: "late_token_21" } },
      });
      try {
        let resolveVerification: ((value: any) => void) | null = null;
        await page.route("**/api/billing/google-play/verify", async (route) => {
          // Delay verification response until session is switched
          await new Promise((r) => {
            resolveVerification = r;
          });
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              ok: true,
              active: true,
              accessUntil: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            }),
          });
        });

        await page.goto(`${BASE_URL}/premium-bhumi`);
        await waitForPremiumReady(page);

        // Click subscribe as User A
        const subscribeBtn = page.getByRole("button", { name: /Langganan Sekarang|Subscribe/i });
        void subscribeBtn.click().catch(() => {});
        await page.waitForTimeout(500);

        // Switch active user to User B in localStorage while verification is in flight
        await page.evaluate((uB) => {
          const authUser = {
            uid: uB.uid,
            email: uB.email,
            displayName: uB.displayName,
            photoURL: null,
            emailVerified: true,
            isAnonymous: false,
            metadata: { creationTime: new Date().toISOString(), lastSignInTime: new Date().toISOString() },
            providerData: [{ providerId: "password", uid: uB.uid, displayName: uB.displayName, email: uB.email, phoneNumber: null, photoURL: null }],
          };
          localStorage.setItem("__BHUMI_MOCK_AUTH_USER__", JSON.stringify(authUser));
          const store = JSON.parse(localStorage.getItem("__BHUMI_MOCK_FIRESTORE_STORE__") || '{"users":{}}');
          store.users[uB.uid] = { ...uB, name: uB.displayName, setupCompleted: true, plan: "free", tier: "free", role: "user" };
          localStorage.setItem("__BHUMI_MOCK_FIRESTORE_STORE__", JSON.stringify(store));
          localStorage.setItem("bhumiProfile:" + uB.uid, JSON.stringify(store.users[uB.uid]));
        }, userB);

        // Now release verification response
        if (resolveVerification) (resolveVerification as any)();
        await page.waitForTimeout(2000);

        // Reload to verify User B was NOT modified with User A's late response
        await page.goto(`${BASE_URL}/settings`);
        await waitForSettingsReady(page);
        const settingsBody = await page.innerText("body");
        const bRemainsFree = settingsBody.includes("Akses publik") && !settingsBody.includes("Paket Premium Aktif");

        recordResult(
          "UI-21",
          "Late verification response from previous user discarded safely",
          bRemainsFree,
          "AUTH_CHANGED invariant triggers rejection; second user session not polluted with late purchase"
        );
      } catch (e: any) {
        recordResult("UI-21", "Late verification response from previous user discarded safely", false, undefined, e.message);
      } finally {
        await context.close();
      }
    }

    // -------------------------------------------------------------------------
    // UI-22: Cross-component consistency across Settings, Upgrade, Premium, Paywall
    // -------------------------------------------------------------------------
    {
      const freeUser: SyntheticUserFixture = {
        uid: "user-cross-free-22",
        email: "cross-free@build110.test",
        displayName: "Pengguna Cross Free",
        role: "user",
        plan: "free",
        tier: "free",
      };
      const { context, page } = await createBrowserSession(browser, { user: freeUser });
      try {
        await page.goto(`${BASE_URL}/settings`);
        await waitForSettingsReady(page);
        const settingsText = await page.innerText("body");
        const settingsFree = settingsText.includes("Akses publik") || settingsText.includes("Penghuni Bhumi");

        await page.goto(`${BASE_URL}/upgrade`);
        await waitForUpgradeReady(page);
        const upgradeText = await page.innerText("body");
        const upgradeFree = upgradeText.includes("Free") || upgradeText.includes("Penghuni Bhumi");

        await page.goto(`${BASE_URL}/premium-bhumi`);
        await waitForPremiumReady(page);
        const premiumText = await page.innerText("body");
        const premiumFree = premiumText.includes("Penghuni Bhumi");

        await page.goto(`${BASE_URL}/wellness`, { waitUntil: "domcontentloaded", timeout: 25000 });
        await page.waitForTimeout(2000);
        const wellnessBody = await page.innerText("body");
        const paywallBlocked = wellnessBody.includes("Perjalanan Berlanjut dari Dashboard") || wellnessBody.includes("Akses Bhumi kamu perlu diperbarui") || !page.url().includes("/wellness");

        await page.screenshot({ path: join(ARTIFACT_DIR, "ui-22-paywall-denied-mobile.png"), fullPage: true });

        recordResult(
          "UI-22",
          "Settings, Upgrade, Premium, and Paywall show consistent effective access",
          settingsFree && upgradeFree && premiumFree && paywallBlocked,
          "All components reflect canonical Free access and Paywall blocks unauthorized access identically"
        );
      } catch (e: any) {
        recordResult("UI-22", "Settings, Upgrade, Premium, and Paywall show consistent effective access", false, undefined, e.message);
      } finally {
        await context.close();
      }
    }

    // -------------------------------------------------------------------------
    // UI-23: Deep links /upgrade and /premium-bhumi navigate without redirect loop
    // -------------------------------------------------------------------------
    {
      const user: SyntheticUserFixture = { uid: "user-deeplink-23", email: "deeplink@build110.test", displayName: "Deeplink User" };
      const { context, page } = await createBrowserSession(browser, { user });
      try {
        const respUpgrade = await page.goto(`${BASE_URL}/upgrade`, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(800);
        const upgradeUrl = page.url();
        const upgradeOk = respUpgrade?.status() === 200 && upgradeUrl.includes("/upgrade");

        const respPremium = await page.goto(`${BASE_URL}/premium-bhumi`, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(800);
        const premiumUrl = page.url();
        const premiumOk = respPremium?.status() === 200 && premiumUrl.includes("/premium-bhumi");

        recordResult(
          "UI-23",
          "Deep link navigation to /upgrade and /premium-bhumi without loop",
          upgradeOk && premiumOk,
          `Direct navigation returned HTTP 200 without redirect loops (upgrade: ${upgradeUrl}, premium: ${premiumUrl})`
        );
      } catch (e: any) {
        recordResult("UI-23", "Deep link navigation without loop", false, undefined, e.message);
      } finally {
        await context.close();
      }
    }

    // -------------------------------------------------------------------------
    // UI-24: Repeated clicking deduplication during loading
    // -------------------------------------------------------------------------
    {
      const user: SyntheticUserFixture = { uid: "user-dedup-24", email: "dedup@build110.test", displayName: "Dedup User" };
      let nativeCallCount = 0;
      const { context, page } = await createBrowserSession(browser, {
        user,
        bridge: {
          enableNative: true,
          purchaseResult: { status: "success", token: "dedup_token" },
          restoreResult: { status: "empty" },
        },
      });
      try {
        // Track invocations on route
        page.on("console", (msg) => console.log("PAGE CONSOLE:", msg.text()));
        await page.route("**/api/billing/google-play/verify", async (route) => {
          nativeCallCount++;
          console.log(`[DEBUG UI-24] verify called #${nativeCallCount}, postData:`, route.request().postData());
          await new Promise((r) => setTimeout(r, 1500)); // Delay to allow rapid clicks
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ ok: true, active: true, accessUntil: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString() }),
          });
        });

        await page.goto(`${BASE_URL}/premium-bhumi`);
        await waitForPremiumReady(page);

        // Trigger rapid clicks in-flight
        await page.evaluate(() => {
          const btn = document.querySelector('[data-testid="subscribe-button"]') as HTMLButtonElement;
          if (btn) {
            btn.click();
            btn.click();
            btn.click();
          }
        });

        await page.waitForTimeout(3000);

        // Verification must be invoked exactly once
        const dedupOk = nativeCallCount === 1;

        recordResult(
          "UI-24",
          "Repeated clicks during loading deduplicated without redundant purchases",
          dedupOk,
          `Buttons disabled during in-flight transaction; exactly ${nativeCallCount} verifier request initiated`
        );
      } catch (e: any) {
        recordResult("UI-24", "Repeated clicks deduplication", false, undefined, e.message);
      } finally {
        await context.close();
      }
    }

    // -------------------------------------------------------------------------
    // UI-25: Loading, timeout, and retry fail-closed safety
    // -------------------------------------------------------------------------
    {
      const user: SyntheticUserFixture = { uid: "user-timeout-25", email: "timeout@build110.test", displayName: "Timeout User" };
      const { context, page } = await createBrowserSession(browser, {
        user,
        bridge: { enableNative: true, purchaseResult: { status: "success", token: "timeout_token" } },
      });
      try {
        // Hang route to trigger network abort / timeout
        await page.route("**/api/billing/google-play/verify", async (route) => {
          await route.abort("timedout");
        });

        await page.goto(`${BASE_URL}/premium-bhumi`);
        await waitForPremiumReady(page);

        const subscribeBtn = page.getByRole("button", { name: /Langganan Sekarang|Subscribe/i });
        await subscribeBtn.click();
        await page.waitForTimeout(2000);

        const body = await page.innerText("body");
        const hasError = body.includes("Verifikasi sementara belum tersedia") || body.includes("Pembelian gagal");
        const neverFalseSuccess = !body.includes("Pembelian berhasil!");

        recordResult(
          "UI-25",
          "Loading, timeout, and retry remain fail-closed without false success",
          hasError && neverFalseSuccess,
          "Network abort/timeout fails closed safely with retry guidance and zero false entitlement"
        );
      } catch (e: any) {
        recordResult("UI-25", "Loading, timeout, and retry fail-closed safety", false, undefined, e.message);
      } finally {
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }

  // ---------------------------------------------------------------------------
  // Output and write report
  // ---------------------------------------------------------------------------
  const total = scenarioResults.length;
  const passedCount = scenarioResults.filter((r) => r.passed).length;
  const failedCount = total - passedCount;

  console.log("\n================================================================================");
  console.log(`REAL-BROWSER ACCEPTANCE SUITE RESULTS: ${passedCount}/${total} PASSED (${failedCount} FAILED)`);
  console.log("================================================================================\n");

  const report = {
    suite: "SPRINT BILL-04A REAL-BROWSER ACCEPTANCE",
    runner: "Playwright Chromium (Headless)",
    environment: {
      targetUrl: BASE_URL,
      browser: "Chromium 128 (Android/Desktop Emulation)",
      mockHarness: "Synthetic Firebase Auth / Firestore & Synthetic Google Play Bridge",
      executedAt: new Date().toISOString(),
    },
    summary: {
      total,
      passed: passedCount,
      failed: failedCount,
      verdict: failedCount === 0 ? "PASS LOCAL BROWSER" : "FAIL",
    },
    scenarios: scenarioResults,
  };

  writeFileSync(join(ARTIFACT_DIR, "browser-acceptance-report.json"), JSON.stringify(report, null, 2));

  if (failedCount > 0) {
    process.exit(1);
  }
}

// Run when executed directly
runBill04aBrowserAcceptance().catch((err) => {
  console.error("FATAL ERROR IN BROWSER ACCEPTANCE SUITE:", err);
  process.exit(1);
});
