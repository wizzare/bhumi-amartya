import { chromium, type Browser, type BrowserContext, type Page } from "playwright";

async function runSmoke() {
  console.log("=== BUILD 126 JOURNEY BROWSER SMOKE TEST ===");
  const browser: Browser = await chromium.launch({ headless: true });

  const routes = [
    "/journey",
    "/journey/stage",
    "/journey/message",
    "/journey/focus",
    "/journey/attention",
    "/journey/milestone",
    "/journey/history",
  ];

  const viewports = [
    { name: "Desktop", width: 1280, height: 800 },
    { name: "Mobile", width: 390, height: 844 },
  ];

  let totalChecks = 0;
  let passedChecks = 0;

  for (const vp of viewports) {
    console.log(`\n--- Testing Viewport: ${vp.name} (${vp.width}x${vp.height}) ---`);
    const context: BrowserContext = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      baseURL: "http://localhost:3000",
    });

    const page: Page = await context.newPage();

    // Set audit user in localStorage to bypass login redirect
    await page.addInitScript(() => {
      window.localStorage.setItem("bhumi_audit_user", "founder");
    });

    // 1. Dashboard parity check
    try {
      totalChecks++;
      await page.goto("/", { waitUntil: "domcontentloaded", timeout: 15000 });
      await page.waitForTimeout(1000);
      const content = await page.content();
      const hasTitle = content.includes("Bhumi") || content.includes("Amartya");
      if (hasTitle) {
        console.log(`[PASS] ${vp.name} - Dashboard loaded successfully`);
        passedChecks++;
      } else {
        console.error(`[FAIL] ${vp.name} - Dashboard title missing`);
      }
    } catch (e: any) {
      console.error(`[ERROR] ${vp.name} - Dashboard navigation error:`, e.message);
    }

    // 2. Journey routes check
    for (const route of routes) {
      totalChecks++;
      try {
        const response = await page.goto(route, { waitUntil: "domcontentloaded", timeout: 15000 });
        await page.waitForTimeout(800);
        const status = response?.status();
        const html = await page.content();

        // Check for server error or 404
        if (status === 200 || status === 304) {
          // Check that no unhandled crash occurred
          const hasCrash = html.includes("Application error") || html.includes("Internal Server Error");
          if (!hasCrash) {
            console.log(`[PASS] ${vp.name} - Route ${route} rendered with HTTP ${status}`);
            passedChecks++;
          } else {
            console.error(`[FAIL] ${vp.name} - Route ${route} has application error`);
          }
        } else {
          console.error(`[FAIL] ${vp.name} - Route ${route} returned HTTP ${status}`);
        }
      } catch (e: any) {
        console.error(`[ERROR] ${vp.name} - Route ${route} failed:`, e.message);
      }
    }

    await context.close();
  }

  await browser.close();

  console.log(`\n=== BROWSER SMOKE TEST SUMMARY ===`);
  console.log(`Total checks: ${totalChecks}`);
  console.log(`Passed checks: ${passedChecks}`);
  console.log(`Failed checks: ${totalChecks - passedChecks}`);

  if (passedChecks === totalChecks) {
    console.log("BROWSER_SMOKE_PASS");
    process.exit(0);
  } else {
    console.error("BROWSER_SMOKE_FAIL");
    process.exit(1);
  }
}

runSmoke().catch((err) => {
  console.error("Fatal smoke error:", err);
  process.exit(1);
});
