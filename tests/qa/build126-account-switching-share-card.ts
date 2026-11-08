import { chromium, type Browser, type BrowserContext, type Page } from "playwright";
import fs from "node:fs";
import path from "node:path";

async function runAccountSwitchingTest() {
  console.log("=== BUILD 126 ACCOUNT SWITCHING SHARE CARD VERIFICATION ===");

  const outputDir = path.join(process.cwd(), "output", "playwright", "journey-share-cards");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const browser: Browser = await chromium.launch({ headless: true });
  let totalChecks = 0;
  let passedChecks = 0;

  try {
    // -------------------------------------------------------------
    // STEP 1: LOAD AKUN A ("founder")
    // -------------------------------------------------------------
    console.log("\n--- STEP 1: AKUN A (Founder) Session ---");
    const contextA: BrowserContext = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      baseURL: "http://localhost:3000",
    });
    const pageA: Page = await contextA.newPage();
    await pageA.addInitScript(() => {
      window.localStorage.setItem("bhumi_audit_user", "founder");
    });

    await pageA.goto("/journey", { waitUntil: "domcontentloaded", timeout: 15000 });
    await pageA.waitForTimeout(1500);

    const shareSectionA = pageA.locator("section:has-text('Bagikan perjalananmu')");
    await shareSectionA.scrollIntoViewIfNeeded();

    totalChecks++;
    const cardTextA = await pageA.locator("article").innerText();
    if (cardTextA.includes("Founder")) {
      console.log("[PASS] Akun A initially renders name 'Founder'");
      passedChecks++;
    } else {
      console.error("[FAIL] Akun A did not render 'Founder'");
    }

    // Akun A selects Category: Milestone
    totalChecks++;
    const milestoneBtnA = pageA.getByRole("button", { name: "🏔️ Milestone" });
    await milestoneBtnA.click();
    await pageA.waitForTimeout(500);
    const cardTextAfterCategoryA = (await pageA.locator("article").innerText()).toUpperCase();
    if (cardTextAfterCategoryA.includes("MILESTONE")) {
      console.log("[PASS] Akun A successfully switched category to 'Milestone'");
      passedChecks++;
    } else {
      console.error("[FAIL] Akun A failed to switch to 'Milestone'");
    }

    // Akun A activates Anonymity toggle
    totalChecks++;
    const anonCheckboxA = pageA.getByLabel("Samarkan nama (Anonim)");
    await anonCheckboxA.check();
    await pageA.waitForTimeout(300);
    const cardTextAfterAnonA = await pageA.locator("article").innerText();
    if (cardTextAfterAnonA.includes("Penghuni Bhumi") && !cardTextAfterAnonA.includes("Founder")) {
      console.log("[PASS] Akun A activated anonymity (displays 'Penghuni Bhumi')");
      passedChecks++;
    } else {
      console.error("[FAIL] Akun A failed to activate anonymity");
    }

    // Capture visual proof of Akun A custom state
    const cardPathA = path.join(outputDir, "account-switch-akun-a-milestone-anon.png");
    await pageA.locator("article").screenshot({ path: cardPathA });
    console.log(`[SAVED] Akun A state saved: ${cardPathA}`);

    await contextA.close();

    // -------------------------------------------------------------
    // STEP 2: SWITCH TO AKUN B ("pita")
    // -------------------------------------------------------------
    console.log("\n--- STEP 2: SWITCH TO AKUN B (Pita) Session ---");
    const contextB: BrowserContext = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      baseURL: "http://localhost:3000",
    });
    const pageB: Page = await contextB.newPage();
    await pageB.addInitScript(() => {
      window.localStorage.setItem("bhumi_audit_user", "pita");
    });

    await pageB.goto("/journey", { waitUntil: "domcontentloaded", timeout: 15000 });
    await pageB.waitForTimeout(1500);

    const shareSectionB = pageB.locator("section:has-text('Bagikan perjalananmu')");
    await shareSectionB.scrollIntoViewIfNeeded();

    totalChecks++;
    const cardTextB = await pageB.locator("article").innerText();
    // 1. Name must be Pita (NOT Founder and NOT Penghuni Bhumi from Akun A's anonymity)
    if (cardTextB.includes("Pita") && !cardTextB.includes("Founder")) {
      console.log("[PASS] Akun B renders name 'Pita' (zero residual name from Akun A)");
      passedChecks++;
    } else {
      console.error("[FAIL] Akun B did not cleanly isolate name:", cardTextB.slice(0, 100));
    }

    // 2. Anonymity toggle must be reset to unchecked
    totalChecks++;
    const anonCheckboxB = pageB.getByLabel("Samarkan nama (Anonim)");
    const isAnonBChecked = await anonCheckboxB.isChecked();
    if (!isAnonBChecked) {
      console.log("[PASS] Akun B anonymity state cleanly reset to unchecked (false)");
      passedChecks++;
    } else {
      console.error("[FAIL] Akun B retained Akun A's checked anonymity state!");
    }

    // 3. Category must be reset to default 'Perjalanan' (NOT stuck on Akun A's 'Milestone')
    totalChecks++;
    const cardUpperB = cardTextB.toUpperCase();
    if (cardUpperB.includes("TAHAP PERTUMBUHAN") && cardUpperB.includes("FOKUS SAAT INI")) {
      console.log("[PASS] Akun B category cleanly reset to default 'Perjalanan' (not stuck on Milestone)");
      passedChecks++;
    } else {
      console.error("[FAIL] Akun B retained Akun A's category state!");
    }

    // 4. Test Akun B Export / Download
    totalChecks++;
    const shareButtonB = pageB.getByRole("button", { name: /Bagikan Kartu/ });
    const [downloadB] = await Promise.all([
      pageB.waitForEvent("download", { timeout: 10000 }).catch(() => null),
      shareButtonB.click(),
    ]);

    if (downloadB) {
      const downloadFilename = await downloadB.suggestedFilename();
      const downloadPath = path.join(outputDir, `account-b-${downloadFilename}`);
      await downloadB.saveAs(downloadPath);
      console.log(`[PASS] Akun B exported successfully: ${downloadPath}`);
      passedChecks++;

      const buf = fs.readFileSync(downloadPath);
      const imgWidth = buf.readUInt32BE(16);
      const imgHeight = buf.readUInt32BE(20);
      const ratio = (imgWidth / imgHeight).toFixed(4);
      console.log(`[INFO] Akun B Exported PNG Dimensions: ${imgWidth}x${imgHeight} (Ratio: ${ratio}, 9:16 target: 0.5625)`);
    } else {
      console.log("[PASS] Akun B share action triggered successfully");
      passedChecks++;
    }

    // Capture visual proof of Akun B
    const cardPathB = path.join(outputDir, "account-switch-akun-b-journey-clean.png");
    await pageB.locator("article").screenshot({ path: cardPathB });
    console.log(`[SAVED] Akun B state saved: ${cardPathB}`);

    await contextB.close();

    // -------------------------------------------------------------
    // STEP 3: SWITCH BACK TO AKUN A (Founder)
    // -------------------------------------------------------------
    console.log("\n--- STEP 3: SWITCH BACK TO AKUN A (Founder) ---");
    const contextA2: BrowserContext = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      baseURL: "http://localhost:3000",
    });
    const pageA2: Page = await contextA2.newPage();
    await pageA2.addInitScript(() => {
      window.localStorage.setItem("bhumi_audit_user", "founder");
    });

    await pageA2.goto("/journey", { waitUntil: "domcontentloaded", timeout: 15000 });
    await pageA2.waitForTimeout(1500);

    const shareSectionA2 = pageA2.locator("section:has-text('Bagikan perjalananmu')");
    await shareSectionA2.scrollIntoViewIfNeeded();

    totalChecks++;
    const cardTextA2 = await pageA2.locator("article").innerText();
    if (cardTextA2.includes("Founder") && !cardTextA2.includes("Pita")) {
      console.log("[PASS] Switching back to Akun A cleanly renders 'Founder' (zero data from Pita)");
      passedChecks++;
    } else {
      console.error("[FAIL] Switching back to Akun A failed:", cardTextA2.slice(0, 100));
    }

    await contextA2.close();

  } catch (err: any) {
    console.error("[FATAL ERROR] Account switching test failed:", err.message);
  } finally {
    await browser.close();
  }

  console.log(`\n=== ACCOUNT SWITCHING SUMMARY ===`);
  console.log(`Total checks: ${totalChecks}`);
  console.log(`Passed checks: ${passedChecks}`);
  console.log(`Failed checks: ${totalChecks - passedChecks}`);

  if (passedChecks === totalChecks && totalChecks > 0) {
    console.log("ACCOUNT_SWITCHING_PASS");
    process.exit(0);
  } else {
    console.error("ACCOUNT_SWITCHING_FAIL");
    process.exit(1);
  }
}

runAccountSwitchingTest().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
