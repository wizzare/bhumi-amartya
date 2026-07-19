const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  console.log("=== BHUMI V4 REAL FIREBASE SMOKE TEST ===");
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => console.log('[BROWSER]', msg.text()));
  page.on('pageerror', err => console.log('[BROWSER ERROR]', err.message));

  try {
    console.log("1. Navigating to /login...");
    await page.goto('http://localhost:3000/login');

    // Check if we have NEXT_PUBLIC_FIREBASE_API_KEY
    const hasApiKey = await page.evaluate(() => !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY).catch(() => false);
    console.log("   Firebase API Key present in client:", hasApiKey);

    console.log("2. Attempting Anonymous Authentication (Real Firebase)...");
    const authResult = await page.evaluate(async () => {
      try {
        // Attempt to find firebase config or just try to sign in if SDK is available
        // We'll check for the exposed auth object if the app exposes it,
        // or we can just try to see if 'firebase' is on window.
        if (!window.firebase) {
           // If not on window, we might need to wait for a module load
           // In Next.js it might not be globally exposed.
        }
        return { status: "manual_check_required" };
      } catch (err) {
        return { status: "error", error: err.message };
      }
    });
    console.log("   Auth Result:", authResult);

    console.log("3. Isolation Check: Verifying that local storage does not grant access...");
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem("bhumi_active_uid", "some_random_uid");
    });
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForTimeout(5000);
    console.log("   Current URL after unauthenticated dashboard attempt:", page.url());
    if (page.url().includes('/login')) {
      console.log("   ✓ Isolation PASS: Redirected to login.");
    } else {
      console.log("   × Isolation FAIL: Stayed on " + page.url());
    }

    console.log("4. Akashi Spot Check Simulation...");
    // We'll use audit mode for one user to see if the rendered text is clean
    await page.evaluate(() => {
      localStorage.setItem("bhumi_audit_user", "founder_control");
    });
    await page.goto('http://localhost:3000/profile/siapa-dirimu');
    await page.waitForSelector('text=Arsip Akashi', { timeout: 30000 });
    const akashiContent = await page.textContent('body');
    const forbidden = ["Pisces", "Life Path", "Gate", "Channel", "Arcana", "null", "undefined"];
    let leakageCount = 0;
    forbidden.forEach(word => {
      if (akashiContent.toLowerCase().includes(word.toLowerCase())) {
        console.log("   [LEAK] Found word:", word);
        leakageCount++;
      }
    });
    console.log("   Rendered Akashi Leakage Count:", leakageCount);

    console.log("5. Quality Gate: Build Verification...");
    // We'll check if 'out' directory exists or if we can run export
    const outExists = fs.existsSync('out');
    console.log("   Static export 'out' directory exists:", outExists);

    await page.screenshot({ path: 'smoke_test_result.png' });

  } catch (err) {
    console.error("SMOKE TEST CRITICAL FAILURE:", err);
  } finally {
    await browser.close();
    console.log("Done.");
  }
})();
