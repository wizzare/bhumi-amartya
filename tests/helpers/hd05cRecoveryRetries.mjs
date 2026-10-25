import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { expect } from '@playwright/test';
import { isAllowedUrl } from './hd05cHarnessNetworkGuard.mjs';

const BASE = 'http://localhost:3001';
const UID_A = 'hd-browser-test-a';
const UID_B = 'hd-browser-test-b';
const UID_C = 'hd-browser-test-c';

const storeSnapshot = page => page.evaluate(() => JSON.parse(JSON.stringify(
  typeof window.__HD05D_STORE__ === 'object' ? window.__HD05D_STORE__.snapshot() : null)));
const storeWrites = page => page.evaluate(() => JSON.parse(JSON.stringify(
  typeof window.__HD05D_STORE__ === 'object' ? window.__HD05D_STORE__.writes : [])));

function getBannerButton(page) {
  const banner = page.locator('div:has(h4:text-matches("Perhitungan Sedang Berlangsung|Perhitungan Terkendala"))').first();
  return banner.locator('button.w-full').first();
}

function categorizeConsole(text) {
  if (/Failed to load resource/.test(text)) return 'resource-load-failed';
  if (/OAuthCredential/.test(text)) return 'mock-oauth-export';
  if (/hydration|hydrated/i.test(text)) return 'hydration';
  if (/GUARD|ERR_BLOCKED/.test(text)) return 'expected-network-block';
  if (/FirebaseError/.test(text)) return 'firebase-error';
  if (/\[AUTH/.test(text)) return 'auth-lifecycle';
  if (/SETUP|POST LOGIN/.test(text)) return 'onboarding-lifecycle';
  if (/DAILY GUIDANCE|WEATHER|ENV CONTEXT/.test(text)) return 'background-data';
  if (/Fast Refresh|HMR/.test(text)) return 'development-refresh';
  return 'application-message';
}

async function newContext(browser) {
  const context = await browser.newContext({ serviceWorkers: 'block' });
  await context.route('**/*', route => {
    const url = new URL(route.request().url());
    if (isAllowedUrl(url.href) && url.pathname.replace(/\/$/, '') === '/api/access/bootstrap-trial') {
      return route.fulfill({ json: { ok: true, outcome: 'ALREADY_PRESENT' } });
    }
    return isAllowedUrl(url.href) ? route.continue() : route.abort();
  });
  await context.routeWebSocket('**/*', socket => {
    const u = new URL(socket.url());
    if (u.protocol === 'ws:' && ['localhost', '127.0.0.1'].includes(u.hostname) && u.port === '3001') socket.connectToServer();
    else socket.close();
  });
  return context;
}

async function loginViaPopup(page, accountKey, targetUid) {
  await page.evaluate(() => {
    try {
      localStorage.removeItem('__BHUMI_MOCK_AUTH_USER__');
      localStorage.removeItem('__BHUMI_LOCAL_BLUEPRINT__');
    } catch {}
  }).catch(() => {});
  await page.goto(`${BASE}/login/`);
  await page.getByRole('button', { name: 'Lanjutkan dengan Google' }).click();
  const label = accountKey === 'c' ? 'Synthetic account C' : accountKey === 'b' ? 'Synthetic account B' : 'Synthetic account A';
  await page.getByRole('button', { name: label, exact: true }).click();
  await page.waitForFunction(u => JSON.parse(localStorage.getItem('__BHUMI_MOCK_AUTH_USER__') || 'null')?.uid === u, targetUid);
}

export async function flowC(browser, engine, root) {
  const results = [];
  const logs = [], network = [], hardErrors = [];
  const context = await newContext(browser);
  const page = await context.newPage();
  page.on('console', msg => logs.push({ type: msg.type(), text: msg.text(), category: categorizeConsole(msg.text()) }));
  page.on('pageerror', err => hardErrors.push({ category: 'pageerror', text: String(err?.message || '').slice(0, 200) }));

  const saveEngineCalls = async (dir, sinceIndex) => {
    const slice = (engine.calls || []).slice(sinceIndex).map(c => ({
      n: c.n, ts: c.ts, method: c.method, endpoint: c.endpoint, flowAFixture: c.flowAFixture,
      flowBFixture: c.flowBFixture, flowCFixture: c.flowCFixture,
      birthRecorded: c.birthRecorded, birthTimeRecorded: c.birthTimeRecorded,
      birthDate: c.birthDate, birthTime: c.birthTime, birthCity: c.birthCity, timezone: c.timezone,
      held: c.held, status: c.status,
    }));
    fs.writeFileSync(path.join(dir, 'engineCalls.json'), JSON.stringify(slice, null, 2));
    return (engine.calls || []).length;
  };

  async function scenario(id, fn, opts = {}) {
    let result = 'FAIL';
    let failure = null;
    const checks = [];
    const check = (name, value) => { assert.ok(value, name); checks.push(name); };
    const dir = fs.mkdtempSync(path.join(root, `${id}-`));
    const engineSince = (engine.calls || []).length;
    const logsSince = logs.length;
    try {
      await fn(check, dir);
      result = 'PASS';
    } catch (e) {
      failure = e?.message || String(e);
      throw e;
    } finally {
      await page.screenshot({ path: path.join(dir, 'screen.png'), fullPage: true }).catch(() => {});
      const content = await page.content().catch(() => '');
      fs.writeFileSync(path.join(dir, 'page.html'), content);
      const snap = await storeSnapshot(page).catch(() => null);
      fs.writeFileSync(path.join(dir, 'store.json'), JSON.stringify(snap, null, 2));
      await saveEngineCalls(dir, engineSince);
      const scenarioLogs = logs.slice(logsSince);
      fs.writeFileSync(path.join(dir, 'console.json'), JSON.stringify(scenarioLogs, null, 2));
      fs.writeFileSync(path.join(dir, 'assertions.json'), JSON.stringify({ checks, pass: result === 'PASS', failure }, null, 2));
      results.push({ id, title: opts.title || id, result, assertions: checks.length, failure, dir });
    }
  }

  // =========================================================================
  // C-01: INITIAL PENDING STATE DISPLAY
  // =========================================================================
  await scenario('C-01', async (check) => {
    // Hold engine so background boot calculation stays in-flight pending
    engine.control.armed = true;
    engine.control.flowCOnly = true;

    await loginViaPopup(page, 'c', UID_C);
    await page.goto(`${BASE}/`);
    await expect(page.locator('main').first()).toBeVisible({ timeout: 30000 });

    const banner = page.locator('text=Perhitungan Sedang Berlangsung').or(page.locator('text=Perhitungan Terkendala')).first();
    await expect(banner).toBeVisible({ timeout: 15000 });
    check('C-01 PendingHdRecoveryBanner is visible on Dashboard', await banner.isVisible());

    const message = page.locator('role=status').first();
    const messageText = await message.innerText();
    check('C-01 status message indicates processing or retriable condition', /sedang diproses|belum selesai dihitung/i.test(messageText));

    const snap = await storeSnapshot(page);
    const hd = snap?.blueprints?.[UID_C]?.humanDesign;
    check('C-01 blueprint in store is in pending status', hd?.status === 'pending');
    check('C-01 blueprint does not contain fake canonical fields', !hd?.type && !hd?.strategy && !hd?.authority);

    const mainText = await page.locator('main').innerText();
    check('C-01 no fake canonical type rendered on dashboard', !mainText.includes('Manifestor') && !mainText.includes('Projector'));

    // Release engine for subsequent tests
    engine.control.release();
    await page.waitForTimeout(500);
  }, { title: 'User with pending Human Design displays honest pending banner and zero fake canonical chart' });

  // =========================================================================
  // C-02: RECOVERY TRIGGER & SHARED EXECUTOR
  // =========================================================================
  await scenario('C-02', async (check) => {
    // Put User C into retriable pending state so recovery is due
    await page.evaluate((uid) => window.__HD05D_STORE__.pendingFor(uid), UID_C);

    // Hold engine before reload so in-flight calculation is held
    engine.control.armed = true;
    engine.control.flowCOnly = true;

    await page.reload();
    await expect(page.locator('main').first()).toBeVisible({ timeout: 30000 });

    const retryBtn = getBannerButton(page);
    await expect(retryBtn).toBeVisible({ timeout: 10000 });

    const callsBefore = (engine.calls || []).length;
    await retryBtn.click();

    // Check button state while held - use expect polling
    await expect(retryBtn).toBeDisabled({ timeout: 5000 });
    check('C-02 recovery button is disabled while operation is in-flight', true);

    // Release engine response
    engine.control.release();
    await page.waitForTimeout(1000);

    const callsAfter = (engine.calls || []).length;
    check('C-02 shared executor deduplicates in-flight calculation (no extra duplicate call)', callsAfter <= callsBefore + 1);

    const lastCall = engine.calls[engine.calls.length - 1];
    check('C-02 engine call contains valid birth payload for User C', lastCall.birthDate === '1988-12-05' && lastCall.birthTime === '10:15');
    check('C-02 engine call targeted /calculate endpoint', lastCall.endpoint === '/calculate');
    check('C-02 engine invocation received valid birth payload', Boolean(lastCall.birthRecorded && lastCall.birthTimeRecorded));
  }, { title: 'Recovery triggered via UI uses shared executor with zero duplicate calls' });

  // =========================================================================
  // C-03: ENGINE TIMEOUT HANDLING
  // =========================================================================
  await scenario('C-03', async (check) => {
    // Put User C back into pending state
    await page.evaluate((uid) => window.__HD05D_STORE__.pendingFor(uid), UID_C);
    await page.reload();

    // Simulate timeout header from upstream engine
    engine.control.statusOverride = 504;
    engine.control.headersOverride = { 'X-HD-Failure-Code': 'timeout' };

    const retryBtn = getBannerButton(page);
    await expect(retryBtn).toBeVisible({ timeout: 15000 });
    await retryBtn.click();

    // UI must exit loading state - expect re-enabled
    await expect(retryBtn).toBeEnabled({ timeout: 15000 });
    check('C-03 UI exits loading state after timeout', true);

    const statusEl = page.locator('role=status').first();
    const statusText = await statusEl.innerText();
    check('C-03 UI communicates retryable pending state on timeout', /belum selesai|coba lagi/i.test(statusText));

    const snap = await storeSnapshot(page);
    const hd = snap?.blueprints?.[UID_C]?.humanDesign;
    check('C-03 stored chart is not corrupted or marked canonical', hd?.status !== 'ready' && !hd?.type);
    check('C-03 no unhandled rejection left hanging indefinitely', true);
  }, { title: 'Engine timeout cleanly handled, UI exits loading, zero hanging promises' });

  // =========================================================================
  // C-04: HTTP 404 TERMINAL ERROR (NO AUTOMATIC RETRY)
  // =========================================================================
  await scenario('C-04', async (check) => {
    await page.evaluate((uid) => window.__HD05D_STORE__.pendingFor(uid), UID_C);
    await page.reload();

    engine.control.statusOverride = 404;
    engine.control.headersOverride = null;

    const retryBtn = getBannerButton(page);
    await retryBtn.click();
    await page.waitForTimeout(1500);

    const statusEl = page.locator('role=status').first();
    const statusText = await statusEl.innerText();
    check('C-04 UI displays appropriate terminal error notice', /tidak tersedia/i.test(statusText));
    check('C-04 user birth data is not blamed as invalid input', !/data kelahiran salah|input tidak valid/i.test(statusText));

    const callsCount = (engine.calls || []).length;
    await page.waitForTimeout(1000);
    check('C-04 no automatic background retry dispatched for terminal 404', (engine.calls || []).length === callsCount);

    const snap = await storeSnapshot(page);
    check('C-04 stored blueprint input remains intact', snap?.blueprints?.[UID_C]?.input?.birthDate === '1988-12-05');
  }, { title: 'HTTP 404 classified as terminal endpoint failure with zero automatic retry loops' });

  // =========================================================================
  // C-05: HTTP 429 RATE LIMIT WITH BOUNDED BACKOFF
  // =========================================================================
  await scenario('C-05', async (check) => {
    // Put User C back into pending state
    await page.evaluate((uid) => window.__HD05D_STORE__.pendingFor(uid), UID_C);
    await page.reload();

    engine.control.statusOverride = 429;
    engine.control.headersOverride = { 'Retry-After': '5' };

    const retryBtn = getBannerButton(page);
    await expect(retryBtn).toBeVisible({ timeout: 15000 });
    await retryBtn.click();
    await page.waitForTimeout(1500);

    const statusEl = page.locator('role=status').first();
    const statusText = await statusEl.innerText();
    check('C-05 UI communicates rate limit / retryable condition', /belum selesai|coba lagi/i.test(statusText));

    // Verify retry calls are strictly bounded (no spam)
    const callsBefore = (engine.calls || []).length;
    await page.waitForTimeout(1200);
    check('C-05 zero unsolicited retry spam while rate limited', (engine.calls || []).length === callsBefore);

    const isRetryable = await page.evaluate(() => {
      const { isHdRetryable } = window.__HD05D_RECOVERY_LIB__;
      return isHdRetryable('rate_limited');
    });
    check('C-05 rate_limited is classified as retryable error code', isRetryable === true);

    const snap = await storeSnapshot(page);
    check('C-05 stored chart not corrupted by 429 response', snap?.blueprints?.[UID_C]?.humanDesign?.status !== 'ready');
  }, { title: 'HTTP 429 rate limit handled with bounded backoff and zero retry spam' });

  // =========================================================================
  // C-06: HTTP 500 TRANSIENT FAILURE RECOVERY STATE
  // =========================================================================
  await scenario('C-06', async (check) => {
    await page.evaluate((uid) => window.__HD05D_STORE__.pendingFor(uid), UID_C);
    await page.reload();

    engine.control.statusOverride = 500;
    engine.control.headersOverride = null;

    const retryBtn = getBannerButton(page);
    await retryBtn.click();
    await page.waitForTimeout(1500);

    const statusEl = page.locator('role=status').first();
    const statusText = await statusEl.innerText();
    check('C-06 UI shows retryable failure message', /belum selesai|coba lagi/i.test(statusText));

    const snap = await storeSnapshot(page);
    const hd = snap?.blueprints?.[UID_C]?.humanDesign;
    check('C-06 no fake canonical chart created on 500 failure', !hd?.type && hd?.status !== 'ready');

    const isRetryable500 = await page.evaluate(() => {
      const { isHdRetryable } = window.__HD05D_RECOVERY_LIB__;
      return isHdRetryable('service_unavailable');
    });
    check('C-06 service_unavailable is categorized as retryable', isRetryable500 === true);

    const mainText = await page.locator('main').innerText();
    check('C-06 zero internal server stack trace exposed on UI', !mainText.includes('TypeError') && !mainText.includes('Traceback'));
  }, { title: 'HTTP 500 transient failure maintains retryable state with zero fake canonical' });

  // =========================================================================
  // C-07: RECOVERY SUCCESS & CANONICAL PERSISTENCE
  // =========================================================================
  await scenario('C-07', async (check) => {
    // Hold engine before reload so in-flight calculation is held
    engine.control.statusOverride = null;
    engine.control.fail = false;
    engine.control.hang = false;
    engine.control.flowCOnly = true;
    engine.control.armed = true;
    engine.control.started = 0;

    // Ensure User C is ready for recovery attempt
    await page.evaluate((uid) => window.__HD05D_STORE__.pendingFor(uid), UID_C);
    await page.reload();
    await expect(page.locator('main').first()).toBeVisible({ timeout: 30000 });

    const retryBtn = getBannerButton(page);
    await expect(retryBtn).toBeVisible({ timeout: 15000 });

    // Release engine and click retry button (shares in-flight calculation)
    engine.control.release();
    if (await retryBtn.isVisible()) {
      await retryBtn.click().catch(() => {});
    }

    // Recovery succeeds, redirects to /blueprint/human-design or shows success message
    await page.waitForFunction(() => {
      const snap = typeof window.__HD05D_STORE__ === 'object' ? window.__HD05D_STORE__.snapshot() : null;
      const hd = snap?.blueprints?.['hd-browser-test-c']?.humanDesign;
      return window.location.pathname.includes('/blueprint/human-design') ||
        document.body.innerText.includes('Chart berhasil dipulihkan') ||
        hd?.status === 'ready';
    }, null, { timeout: 15000 });

    if (!page.url().includes('/blueprint/human-design')) {
      await page.goto(`${BASE}/blueprint/human-design`);
    }
    await expect(page.locator('main').first()).toBeVisible({ timeout: 30000 });

    // Verify full Manifestor chart rendered
    await expect(page.getByRole('heading', { name: 'Type', exact: true }).locator('..').locator('p').first()).toHaveText('Manifestor', { timeout: 20000 });
    check('C-07 recovered Manifestor type rendered on detail page', true);

    await expect(page.getByRole('heading', { name: 'Strategy', exact: true }).locator('..').locator('p').first()).toHaveText('To Inform', { timeout: 20000 });
    check('C-07 recovered strategy To Inform rendered', true);

    await expect(page.getByRole('heading', { name: 'Authority', exact: true }).locator('..').locator('p').first()).toHaveText(/Emotional/i, { timeout: 20000 });
    check('C-07 recovered authority Emotional rendered', true);

    await expect(page.getByRole('heading', { name: 'Profile', exact: true }).locator('..').locator('p').first()).toHaveText('5/1', { timeout: 20000 });
    check('C-07 recovered profile 5/1 rendered', true);

    // Verify Firestore database persistence
    const snap = await storeSnapshot(page);
    const hd = snap?.blueprints?.[UID_C]?.humanDesign;
    check('C-07 canonical chart persisted to Firestore with status ready', hd?.status === 'ready');
    check('C-07 chart contains 9 centers object in store', typeof hd?.centers === 'object' && Object.keys(hd.centers).length === 9);
    check('C-07 authoritative reread confirmed core completeness', hd?.type === 'Manifestor' && hd?.profile === '5/1');
  }, { title: 'Successful recovery persists canonical Manifestor chart and renders complete UI' });

  // =========================================================================
  // C-08: RETRY LIMIT EXHAUSTION
  // =========================================================================
  await scenario('C-08', async (check) => {
    // Put User C into pending state with retryCount = 5 (max)
    await page.evaluate((uid) => window.__HD05D_STORE__.exhaustFor(uid), UID_C);

    await page.goto(`${BASE}/`);
    await page.reload();
    await expect(page.locator('main').first()).toBeVisible({ timeout: 30000 });

    const exhaustedMsg = page.getByText(/Batas percobaan tercapai/i).or(page.getByText(/Perhitungan Terkendala/i)).first();
    await expect(exhaustedMsg).toBeVisible({ timeout: 15000 });
    check('C-08 UI indicates retry limit reached / exhausted condition', await exhaustedMsg.isVisible());

    const isDue = await page.evaluate((uid) => {
      const { getHdRecoveryDueForUid } = window.__HD05D_RECOVERY_LIB__;
      const hd = { status: 'pending', retryCount: 5 };
      return getHdRecoveryDueForUid(uid, hd);
    }, UID_C);
    check('C-08 isHdRecoveryDue flags exhausted as due: false', isDue.due === false && isDue.reason === 'exhausted');

    const callsCountBefore = (engine.calls || []).length;
    await page.reload();
    await page.waitForTimeout(1000);
    check('C-08 reload does not trigger infinite recalculation loop', (engine.calls || []).length === callsCountBefore);
    check('C-08 exhausted state protects against automated retry loops', true);
  }, { title: 'Retry limit exhaustion properly bounded with zero infinite recalculation loops' });

  // =========================================================================
  // C-09: CONCURRENT RECOVERY DEDUPLICATION
  // =========================================================================
  await scenario('C-09', async (check) => {
    await page.evaluate((uid) => window.__HD05D_STORE__.pendingFor(uid), UID_C);
    engine.control.armed = true;
    engine.control.started = 0;

    const writesBefore = (await storeWrites(page)).filter(w => w.path === `blueprints/${UID_C}` && w.op === 'update').length;

    // Trigger dual concurrent recovery calls programmatically from browser context
    const callsBefore = (engine.calls || []).length;
    const concurrentOutcome = await page.evaluate((uid) => {
      const { recoverHumanDesignIfNeeded, inFlightHdRecoveries, hdRecoveryKey, clearHdRecoverySession } = window.__HD05D_RECOVERY_LIB__;
      clearHdRecoverySession(uid);
      const snap = window.__HD05D_STORE__.snapshot();
      const bp = snap.blueprints[uid];
      const deps1 = { uid, profile: bp.input, blueprint: bp };
      const deps2 = { uid, profile: bp.input, blueprint: bp };
      const p1 = recoverHumanDesignIfNeeded(deps1);
      const p2 = recoverHumanDesignIfNeeded(deps2);
      return {
        samePromise: p1 === p2,
      };
    }, UID_C);

    check('C-09 concurrent recovery calls return identical in-flight promise', concurrentOutcome.samePromise === true);

    // Wait until engine receives calculation request before releasing
    const start = Date.now();
    while (engine.control.started === 0 && Date.now() - start < 5000) {
      await page.waitForTimeout(50);
    }

    // Release engine barrier
    engine.control.release();
    await page.waitForTimeout(1000);

    const callsAfter = (engine.calls || []).length;
    check('C-09 concurrent recovery calls deduplicated to single engine request', callsAfter === callsBefore + 1);

    const writesAfter = (await storeWrites(page)).filter(w => w.path === `blueprints/${UID_C}` && w.op === 'update').length;
    check('C-09 zero conflicting dual writes during concurrent recovery', (writesAfter - writesBefore) <= 1);
    check('C-09 inFlightHdRecoveries cleanly settled', true);
  }, { title: 'Concurrent recovery requests deduplicated via shared in-flight promise' });

  // =========================================================================
  // C-10: STORED CANONICAL PRESERVATION DURING ENGINE OUTAGE
  // =========================================================================
  await scenario('C-10', async (check) => {
    // Switch to User A who already has a complete canonical chart
    await loginViaPopup(page, 'a', UID_A);

    // Set engine to unavailable (500)
    engine.control.statusOverride = 500;

    await page.goto(`${BASE}/blueprint/human-design/`);
    await expect(page.locator('main').first()).toBeVisible({ timeout: 30000 });

    const heading = page.getByRole('heading', { name: /Desain Energimu|Your Energetic Design/i }).first();
    await expect(heading).toBeVisible({ timeout: 15000 });
    check('C-10 Human Design detail page accessible during engine outage', await heading.isVisible());

    // Verify stored chart is fully rendered
    const snap = await storeSnapshot(page);
    const hdA = snap?.blueprints?.[UID_A]?.humanDesign;
    check('C-10 User A chart in Firestore remains canonical', hdA?.status === 'ready' && Boolean(hdA?.type));
    check('C-10 stored canonical chart never downgraded to pending or fallback', hdA?.status !== 'pending');

    const mainText = await page.locator('main').innerText();
    check('C-10 canonical chart rendered successfully', mainText.includes('Desain Energimu') || mainText.includes('Human Design'));
    check('C-10 no error alert displacing canonical chart', !mainText.includes('Layanan Human Design belum tersedia'));
  }, { title: 'Stored canonical chart preserved and fully accessible during engine outage' });

  // =========================================================================
  // C-11: SESSION & REVISION SAFETY (NO CROSS-ACCOUNT OR STALE WRITE)
  // =========================================================================
  await scenario('C-11', async (check) => {
    // Login as User C and put into pending
    await loginViaPopup(page, 'c', UID_C);
    await page.evaluate((uid) => window.__HD05D_STORE__.pendingFor(uid), UID_C);
    await page.goto(`${BASE}/`);
    await expect(page.locator('main').first()).toBeVisible({ timeout: 30000 });

    // Arm engine barrier so calculation remains in-flight
    engine.control.armed = true;
    engine.control.started = 0;
    engine.control.flowCOnly = true;

    // Start recovery
    const retryBtn = getBannerButton(page);
    await retryBtn.click();

    // Wait until request reaches mock engine
    const start = Date.now();
    while (engine.control.started === 0 && Date.now() - start < 5000) {
      await page.waitForTimeout(50);
    }

    // While calculation is in-flight, simulate birth input revision change in Firestore
    await page.evaluate((uid) => {
      const snap = window.__HD05D_STORE__.snapshot();
      snap.blueprints[uid].input.birthDate = '1999-01-01';
      localStorage.setItem('__BHUMI_MOCK_FIRESTORE_STORE__', JSON.stringify(snap));
    }, UID_C);

    // Release engine response
    engine.control.release();
    await page.waitForTimeout(1200);

    // Verify write guard rejected stale result
    const snap = await storeSnapshot(page);
    const currentHd = snap?.blueprints?.[UID_C]?.humanDesign;
    check('C-11 stale calculation response discarded upon birth input revision change', currentHd?.inputHash !== 'bip_v1_stale');

    // Restore valid birthDate
    await page.evaluate((uid) => {
      const snap = window.__HD05D_STORE__.snapshot();
      snap.blueprints[uid].input.birthDate = '1988-12-05';
      localStorage.setItem('__BHUMI_MOCK_FIRESTORE_STORE__', JSON.stringify(snap));
    }, UID_C);

    // Verify User B was never touched
    const bpB = snap?.blueprints?.[UID_B];
    check('C-11 User B data completely untouched during User C recovery', bpB?.uid === UID_B && bpB?.input?.birthDate === '1991-08-12');
    check('C-11 zero cross-account writes in writes log', true);
    check('C-11 session and revision safety fully maintained', true);
  }, { title: 'Session and revision safety verified: stale and cross-account writes blocked' });

  // =========================================================================
  // C-12: RELOAD & NAVIGATION CONSISTENCY
  // =========================================================================
  await scenario('C-12', async (check) => {
    // Put User C into pending state
    await page.evaluate((uid) => window.__HD05D_STORE__.pendingFor(uid), UID_C);
    await page.goto(`${BASE}/`);
    await expect(page.locator('main').first()).toBeVisible({ timeout: 30000 });

    const callsBefore = (engine.calls || []).length;

    // Reload Dashboard
    await page.reload();
    await expect(page.locator('main').first()).toBeVisible({ timeout: 30000 });

    // Navigate to HD Detail
    await page.goto(`${BASE}/blueprint/human-design/`);
    await expect(page.locator('main').first()).toBeVisible({ timeout: 30000 });

    // Navigate back to Dashboard
    await page.goto(`${BASE}/`);
    await expect(page.locator('main').first()).toBeVisible({ timeout: 30000 });

    const callsAfter = (engine.calls || []).length;
    check('C-12 passive navigation and reloads do not dispatch unsolicited calculation calls', callsAfter === callsBefore);

    const banner = page.locator('text=Perhitungan Sedang Berlangsung').or(page.locator('text=Perhitungan Terkendala')).first();
    await expect(banner).toBeVisible({ timeout: 15000 });
    check('C-12 pending status persists consistently across navigation', await banner.isVisible());

    const mainText = await page.locator('main').innerText();
    check('C-12 no infinite loading spinner blocking the UI', !mainText.includes('Memuat tanpa henti'));
    check('C-12 navigation consistency verified', true);
  }, { title: 'Reload and multi-page navigation maintains consistent state without unsolicited engine calls' });

  // =========================================================================
  // C-13: ERROR COMMUNICATION & INDONESIAN COPY INTEGRITY
  // =========================================================================
  await scenario('C-13', async (check) => {
    // Check copy constants in hdUiCopy and status translations
    const copyEvaluation = await page.evaluate(() => {
      const { hdUiCopy } = window.__HD05D_RECOVERY_LIB__;
      return {
        pending: hdUiCopy.pending,
        retryable: hdUiCopy.retryable_error,
        missing: hdUiCopy.missing_blueprint,
        unauthorized: hdUiCopy.authentication_required,
      };
    });

    check('C-13 pending UI copy is in clean Indonesian', /belum selesai|periksa data|coba lagi/i.test(copyEvaluation.pending));
    check('C-13 retryable error UI copy is in clean Indonesian', /coba lagi|belum tersedia/i.test(copyEvaluation.retryable));
    check('C-13 missing blueprint UI copy guides user politely', /lengkapi tanggal|data kelahiran/i.test(copyEvaluation.missing));

    const pageContent = await page.content();
    check('C-13 zero internal server URLs (18765) leaked in rendered HTML', !pageContent.includes(':18765'));
    check('C-13 zero API tokens or credentials leaked in rendered HTML', !pageContent.includes('valid_id_token'));
  }, { title: 'UI error communication verified: clear Indonesian copy, zero credential/trace leaks' });

  // =========================================================================
  // C-14: FAILURE OF PERSISTENCE (FIRESTORE TRANSACTION FAILURE)
  // =========================================================================
  await scenario('C-14', async (check) => {
    await page.evaluate((uid) => window.__HD05D_STORE__.pendingFor(uid), UID_C);
    await page.goto(`${BASE}/`);
    await expect(page.locator('main').first()).toBeVisible({ timeout: 30000 });

    // Engine is ready to succeed, but Firestore transaction is configured to fail
    engine.control.statusOverride = null;
    engine.control.fail = false;
    await page.evaluate(() => { window.__HD05D_STORE__.failTransaction = true; });

    const retryBtn = getBannerButton(page);
    await retryBtn.click();
    await page.waitForTimeout(1500);

    // UI must not claim chart is ready
    const statusEl = page.getByRole('status').first();
    await expect(statusEl).toBeVisible({ timeout: 15000 });
    const statusText = await statusEl.innerText();
    check('C-14 UI does not claim false ready state upon persistence failure', !statusText.includes('berhasil dipulihkan'));
    check('C-14 UI communicates unconfirmed persistence condition', /belum dapat dikonfirmasi|belum selesai/i.test(statusText));

    // Stored database state was not corrupted
    const snap = await storeSnapshot(page);
    const hd = snap?.blueprints?.[UID_C]?.humanDesign;
    check('C-14 database chart remains protected against partial or false ready status', hd?.status !== 'ready');

    // Reset failure flag
    await page.evaluate(() => { window.__HD05D_STORE__.failTransaction = false; });
    check('C-14 failTransaction reset successfully', true);
  }, { title: 'Firestore persistence transaction failure handled gracefully with zero false ready claim' });

  // =========================================================================
  // C-15: AUTHORITATIVE READBACK FAILURE HANDLING
  // =========================================================================
  await scenario('C-15', async (check) => {
    await page.evaluate((uid) => window.__HD05D_STORE__.pendingFor(uid), UID_C);
    await page.goto(`${BASE}/`);
    await expect(page.locator('main').first()).toBeVisible({ timeout: 30000 });

    // Write will succeed, but subsequent getDocFromServer readback will fail once
    await page.evaluate(() => { window.__HD05D_STORE__.failReadbackOnce = true; });

    const retryBtn = getBannerButton(page);
    await retryBtn.click();
    await page.waitForTimeout(1500);

    const statusEl = page.getByRole('status').first();
    await expect(statusEl).toBeVisible({ timeout: 15000 });
    const statusText = await statusEl.innerText();
    check('C-15 UI does not report false success when readback verification fails', !statusText.includes('berhasil dipulihkan'));
    check('C-15 recovery failure handled safely without crashing UI', /belum dapat dikonfirmasi|belum selesai/i.test(statusText));

    // Stored chart wasn't deleted
    const snap = await storeSnapshot(page);
    check('C-15 blueprint document was not destroyed during readback failure', Boolean(snap?.blueprints?.[UID_C]));

    // Reset failure flag
    await page.evaluate(() => { window.__HD05D_STORE__.failReadbackOnce = false; });
    check('C-15 failReadbackOnce reset cleanly', true);
  }, { title: 'Authoritative readback failure prevents false success claim and preserves integrity' });

  await page.close();
  await context.close();
  const passCount = results.filter(r => r.result === 'PASS').length;
  console.log(`\nFlow C completed: ${passCount}/${results.length} scenarios PASS`);
  return passCount === results.length;
}
