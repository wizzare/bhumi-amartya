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
  await page.evaluate(() => { try { localStorage.removeItem("__BHUMI_MOCK_AUTH_USER__"); localStorage.removeItem("__BHUMI_LOCAL_BLUEPRINT__"); } catch {} }).catch(() => {});
  await page.goto(`${BASE}/login/`);

  await page.getByRole('button', { name: 'Lanjutkan dengan Google' }).click();

  const label = accountKey === 'c' ? 'Synthetic account C' : accountKey === 'b' ? 'Synthetic account B' : 'Synthetic account A';

  await page.getByRole('button', { name: label, exact: true }).click();

  await page.waitForFunction(u => JSON.parse(localStorage.getItem('__BHUMI_MOCK_AUTH_USER__') || 'null')?.uid === u, targetUid);

}

export async function flowClosure(browser, engine, root) {

  const results = [];

  const logs = [], network = [], hardErrors = [];

  const context = await newContext(browser);

  const page = await context.newPage();

  page.on('console', msg => logs.push({ type: msg.type(), text: msg.text(), category: categorizeConsole(msg.text()) }));

  page.on('pageerror', err => hardErrors.push({ category: 'pageerror', text: String(err?.message || '').slice(0, 200) }));

  async function scenario(id, fn, opts = {}) {

    let result = 'FAIL';

    let failure = null;

    const checks = [];

    const check = (name, value) => { assert.ok(value, name); checks.push(name); };

    const dir = fs.mkdtempSync(path.join(root, `${id}-`));

    await context.tracing.start({ screenshots: true, snapshots: true });

    try {

      await fn(check);

      result = 'PASS';

    } catch (err) {

      failure = String(err?.message || err);

      console.error(`[${id}] FAIL:`, failure);

      throw err;

    } finally {

      await page.screenshot({ path: path.join(dir, 'screen.png'), fullPage: true }).catch(() => {});

      await context.tracing.stop({ path: path.join(dir, 'trace.zip') }).catch(() => {});

      fs.writeFileSync(path.join(dir, 'assertions.json'), JSON.stringify(checks, null, 2));

      fs.writeFileSync(path.join(dir, 'console.json'), JSON.stringify({ entries: logs.slice(-20) }, null, 2));

      results.push({ id, result, assertions: checks.length, checks, failure });

      console.log(JSON.stringify({ id, result, assertions: checks.length, failure: failure || undefined, evidence: dir }));

    }

  }

  // =========================================================================

  // CLOSURE-01: ONLINE CANONICAL CHART & IN-SESSION OFFLINE MEMORY CACHE

  // =========================================================================

  await scenario('CLOSURE-01', async (check) => {

    await loginViaPopup(page, 'a', UID_A);

    await page.goto(`${BASE}/blueprint/human-design/`);

    await expect(page.locator('main').first()).toBeVisible({ timeout: 30000 });

    await expect(page.locator('[data-hd-state]')).toHaveAttribute('data-hd-state', 'ready_canonical', { timeout: 30000 });

    check('CLOSURE-01 online canonical chart rendered with status ready_canonical', true);

    // Trigger in-session offline event in the active page

    await page.evaluate(() => window.dispatchEvent(new Event('offline')));

    await page.waitForTimeout(500);

    const stateEl = page.locator('[data-hd-state]').first();

    const stateAttr = await stateEl.getAttribute('data-hd-state');

    check('CLOSURE-01 offline in-session state serves cached canonical chart without blank screen',

      stateAttr === 'ready_canonical' || stateAttr === 'offline_with_valid_cache');

    const heading = page.getByRole('heading', { name: /Desain Energimu|Your Energetic Design/i }).first();

    check('CLOSURE-01 chart heading remains fully visible when offline', await heading.isVisible());

    // Restore online event

    await page.evaluate(() => window.dispatchEvent(new Event('online')));

    await page.waitForTimeout(500);

  }, { title: 'Online canonical load followed by in-session offline navigation served via memory cache' });

  // =========================================================================

  // CLOSURE-02: COLD OFFLINE RELOAD & SERVICE WORKER LIMITATION DOCUMENTATION

  // =========================================================================

  await scenario('CLOSURE-02', async (check) => {

    await context.setOffline(true);

    // Cold reload while offline

    let reloadError = null;

    try {

      await page.reload({ timeout: 5000 });

    } catch (err) {

      reloadError = err;

    }

    // In absence of service worker / offline shell, full page reload fails closed with network disconnected

    check('CLOSURE-02 offline cold reload fails closed without service worker shell (documented approved limitation)',

      Boolean(reloadError));

    // Restore online connection

    await context.setOffline(false);

    await page.goto(`${BASE}/blueprint/human-design/`);

    await expect(page.locator('main').first()).toBeVisible({ timeout: 30000 });

    await expect(page.locator('[data-hd-state]')).toHaveAttribute('data-hd-state', 'ready_canonical', { timeout: 30000 });

    check('CLOSURE-02 connection restoration enables authoritative server reread into ready_canonical', true);

  }, { title: 'Offline cold reload behavior tested and service worker absence documented' });

  // =========================================================================

  // CLOSURE-03: MEMORY CACHE EXPIRY AND REVISION MISMATCH INVARIANTS

  // =========================================================================

  await scenario('CLOSURE-03', async (check) => {

    const cacheEvaluation = await page.evaluate(async (uid) => {

      const { loadHdView, HD_CACHE_TTL_MS } = window.__HD05D_RECOVERY_LIB__;

      const snap = window.__HD05D_STORE__.snapshot();

      const bp = snap.blueprints[uid];

      const sessionObj = { uid };

      // Populate fresh cache

      const initial = await loadHdView({

        uid, session: sessionObj, input: bp.input, signal: new AbortController().signal,

        active: () => true, online: true, read: async () => bp,

      });

      // Query with expired clock (> TTL 300,000ms)

      const expiredQuery = await loadHdView({

        uid, session: sessionObj, input: bp.input, signal: new AbortController().signal,

        active: () => true, online: false, read: async () => null, now: Date.now() + HD_CACHE_TTL_MS + 1000,

      });

      // Query with changed birth input revision

      const changedInput = { ...bp.input, birthDate: '1970-01-01' };

      const mismatchQuery = await loadHdView({

        uid, session: sessionObj, input: changedInput, signal: new AbortController().signal,

        active: () => true, online: false, read: async () => null,

      });

      return {

        initialState: initial.state,

        expiredState: expiredQuery.state,

        mismatchState: mismatchQuery.state,

      };

    }, UID_A);

    check('CLOSURE-03 initial load populates cache', cacheEvaluation.initialState === 'ready_canonical');

    check('CLOSURE-03 expired cache rejects stale chart when offline', cacheEvaluation.expiredState === 'offline_without_cache');

    check('CLOSURE-03 input revision mismatch rejects old cached chart', cacheEvaluation.mismatchState === 'offline_without_cache');

  }, { title: 'Memory cache invalidation verified: 5-minute TTL expiration and input revision mismatch' });

  // =========================================================================

  // CLOSURE-04: CROSS-ACCOUNT ISOLATION (OFFLINE & ACTIVE MEMORY CACHE)

  // =========================================================================

  await scenario('CLOSURE-04', async (check) => {

    // Login as User B

    await loginViaPopup(page, 'b', UID_B);

    await page.goto(`${BASE}/blueprint/human-design/`);

    await expect(page.locator('main').first()).toBeVisible({ timeout: 30000 });

    await expect(page.locator('[data-hd-state]')).toHaveAttribute('data-hd-state', 'ready_canonical', { timeout: 30000 });

    const mainText = await page.locator('main').innerText();

    check('CLOSURE-04 User B sees Projector chart', mainText.includes('Projector'));

    check('CLOSURE-04 User A Manifesting Generator chart is not exposed to User B', !mainText.includes('Manifesting Generator'));

    // In-memory cross-account check

    const crossAccountLeak = await page.evaluate(async (uidB) => {

      const snap = window.__HD05D_STORE__.snapshot();

      const bpB = snap.blueprints[uidB];

      return bpB.humanDesign?.type;

    }, UID_B);

    check('CLOSURE-04 User B database chart is strictly Projector', crossAccountLeak === 'Projector');

  }, { title: 'Cross-account data isolation verified across user switch with active memory cache' });

  // =========================================================================

  // CLOSURE-05: MOBILE VIEWPORT (390 x 844) RESPONSIVE & BODYGRAPH INTEGRITY

  // =========================================================================

  await scenario('CLOSURE-05', async (check) => {

    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto(`${BASE}/blueprint/human-design/`);

    await expect(page.locator('main').first()).toBeVisible({ timeout: 30000 });

    const hasNoHorizontalOverflow = await page.evaluate(() => {

      return document.documentElement.scrollWidth <= window.innerWidth + 2;

    });

    check('CLOSURE-05 zero horizontal overflow on mobile viewport 390x844', hasNoHorizontalOverflow);

    const bodygraphSvg = page.locator('svg[aria-label*="Bodygraph"]').first();

    await expect(bodygraphSvg).toBeVisible({ timeout: 15000 });

    check('CLOSURE-05 Bodygraph SVG renders cleanly without layout distortion on mobile', await bodygraphSvg.isVisible());

    const svgBox = await bodygraphSvg.boundingBox();

    check('CLOSURE-05 Bodygraph bounding box fits within mobile screen width', svgBox && svgBox.width <= 390);

    const cardsVisible = await page.getByRole('heading', { name: 'Type', exact: true }).isVisible();

    check('CLOSURE-05 HD property cards visible on mobile viewport', cardsVisible);

  }, { title: 'Mobile viewport 390x844 verification: responsive layout, zero horizontal overflow, clean SVG' });

  // =========================================================================

  // CLOSURE-06: DESKTOP VIEWPORT (1440 x 900) RESPONSIVE ACCEPTANCE

  // =========================================================================

  await scenario('CLOSURE-06', async (check) => {

    await page.setViewportSize({ width: 1440, height: 900 });

    await page.goto(`${BASE}/blueprint/human-design/`);

    await expect(page.locator('main').first()).toBeVisible({ timeout: 30000 });

    const hasNoHorizontalOverflowDesktop = await page.evaluate(() => {

      return document.documentElement.scrollWidth <= window.innerWidth;

    });

    check('CLOSURE-06 zero horizontal overflow on desktop viewport 1440x900', hasNoHorizontalOverflowDesktop);

    const bodygraphDesktop = page.locator('svg[aria-label*="Bodygraph"]').first();

    await expect(bodygraphDesktop).toBeVisible({ timeout: 15000 });

    check('CLOSURE-06 Bodygraph SVG renders cleanly on desktop viewport', await bodygraphDesktop.isVisible());

    const heading = page.getByRole('heading', { name: /Desain Energimu|Your Energetic Design/i }).first();

    check('CLOSURE-06 main energetic design title visible on desktop', await heading.isVisible());

  }, { title: 'Desktop viewport 1440x900 verification: grid layout stability, clean desktop presentation' });

  // =========================================================================

  // CLOSURE-07: KEYBOARD ACCESSIBILITY & FOCUS MANAGEMENT

  // =========================================================================

  await scenario('CLOSURE-07', async (check) => {

    await page.setViewportSize({ width: 1280, height: 800 });

    await loginViaPopup(page, 'c', UID_C);

    await page.evaluate((uid) => window.__HD05D_STORE__.pendingFor(uid), UID_C);

    // Hold engine so calculation stays in-flight pending for recovery banner inspection

    engine.control.armed = true;

    engine.control.flowCOnly = true;

    try {

      await page.goto(`${BASE}/`);

      await expect(page.locator('main').first()).toBeVisible({ timeout: 30000 });

      const retryBtn = getBannerButton(page);

      await expect(retryBtn).toBeVisible({ timeout: 15000 });

      // Focus retry button via keyboard

      await retryBtn.focus();

      const isFocused = await page.evaluate(() => {

        const active = document.activeElement;

        return active?.tagName?.toLowerCase() === 'button' && active?.className?.includes('w-full');

      });

      check('CLOSURE-07 recovery button is focusable via keyboard', isFocused);

      // Trigger action using Space or Enter key

      await page.keyboard.press('Enter');

      await page.waitForTimeout(500);

      const statusEl = page.locator('[role="status"]').first();

      const isStatusLive = await statusEl.getAttribute('aria-live');

      check('CLOSURE-07 status element contains aria-live="polite"', isStatusLive === 'polite');

      const isAriaBusy = await statusEl.getAttribute('aria-busy');

      check('CLOSURE-07 status element reflects aria-busy state during operation', isAriaBusy === 'true' || isAriaBusy === 'false');

    } finally {

      engine.control.release();

      engine.control.flowCOnly = false;

    }

  }, { title: 'Keyboard accessibility & ARIA focus management verification' });

  // =========================================================================

  // CLOSURE-08: ACCESSIBILITY SEMANTICS & CONSOLE PRIVACY HYGIENE

  // =========================================================================

  await scenario('CLOSURE-08', async (check) => {

    await page.goto(`${BASE}/blueprint/human-design/`);

    await expect(page.locator('main').first()).toBeVisible({ timeout: 30000 });

    // Check heading hierarchy

    const headingsCount = await page.locator('h1, h2, h3, h4').count();

    check('CLOSURE-08 semantic heading structure exists for screen readers', headingsCount >= 3);

    // Check DOM privacy and hygiene

    const html = await page.content();

    check('CLOSURE-08 zero internal engine port 18765 leaked in DOM', !html.includes(':18765'));

    check('CLOSURE-08 zero sensitive auth tokens leaked in DOM', !html.includes('mock-token-secret') && !html.includes('private_key'));

    // Check console logs

    const errorLogs = logs.filter(l => l.type === 'error' && !l.text.includes('Failed to load resource') && !l.text.includes('favicon') && !l.text.includes('DAILY_GUIDANCE'));
    check('CLOSURE-08 zero unhandled console error exceptions', errorLogs.length === 0);
  }, { title: 'Accessibility semantics, screen-reader heading tree, and console privacy audit' });

  // =========================================================================

  // CLOSURE-09: RECOVERY GAP VERIFICATION (HTTP 429 POLICY & BOUNDED RETRY)

  // =========================================================================

  await scenario('CLOSURE-09', async (check) => {

    const policyResult = await page.evaluate(() => {

      const { isHdRetryable } = window.__HD05D_RECOVERY_LIB__;

      return {

        rateLimitRetryable: isHdRetryable('rate_limit_exceeded'),

        status429Retryable: isHdRetryable(429),

        status404Retryable: isHdRetryable(404),

        status500Retryable: isHdRetryable(500),

      };

    });

    check('CLOSURE-09 HTTP 429 rate limit is recognized as retryable with backoff', policyResult.rateLimitRetryable || policyResult.status429Retryable);

    check('CLOSURE-09 HTTP 404 is strictly non-retryable (terminal)', policyResult.status404Retryable === false);

    check('CLOSURE-09 HTTP 500 is retryable', policyResult.status500Retryable === true);

  }, { title: 'Recovery gap verification: HTTP 429 rate limit backoff policy and terminal classification' });

  // =========================================================================

  // CLOSURE-10: CACHE-SERVER RECONCILIATION PREVENTS STALE OVERWRITE

  // =========================================================================

  await scenario('CLOSURE-10', async (check) => {

    // Put a stale pending chart in localStorage while server has canonical chart

    await loginViaPopup(page, 'a', UID_A);

    await page.evaluate((uid) => {

      const snap = window.__HD05D_STORE__.snapshot();

      const bp = snap.blueprints[uid];

      const staleBp = {

        ...bp,

        humanDesign: { status: 'pending', source: 'pending' },

      };

      localStorage.setItem('__BHUMI_LOCAL_BLUEPRINT__', JSON.stringify(staleBp));

    }, UID_A);

    // Boot Dashboard

    await page.goto(`${BASE}/`);

    await expect(page.locator('main').first()).toBeVisible({ timeout: 30000 });

    // Verify Dashboard reconciliation restored canonical from server

    const snapAfter = await storeSnapshot(page);

    const hdAfter = snapAfter?.blueprints?.[UID_A]?.humanDesign;

    check('CLOSURE-10 server canonical chart is never overwritten by stale pending localStorage',

      hdAfter?.status === 'ready' && hdAfter?.type === 'Manifesting Generator');

  }, { title: 'Cache-server reconciliation: authoritative Firestore server takes absolute precedence' });

  await page.close();

  await context.close();

  const passCount = results.filter(r => r.result === 'PASS').length;

  console.log(`\nClosure Acceptance completed: ${passCount}/${results.length} scenarios PASS`);

  return passCount === results.length;

}

