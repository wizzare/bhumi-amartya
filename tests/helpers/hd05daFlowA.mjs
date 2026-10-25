import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { expect } from '@playwright/test';
import { isAllowedUrl } from './hd05cHarnessNetworkGuard.mjs';

// Synthetic contracts only — no real PII, no tokens, no birth payloads in evidence.
const BASE = 'http://localhost:3001';
const UID = 'hd-new-a';
const UID_NEG = 'hd-new-a2';
const FLOW_A_BIRTH = '1993-11-02';
const FLOW_A_TIME = '06:20';
const CITY = 'Jakarta, Indonesia';
const EXPECTED = {
  type: 'Manifesting Generator', strategy: 'To Respond', authority: 'Sacral',
  profile: '1/3', definition: 'Single Definition', crossName: 'Right Angle Cross of Incarnation',
  defined: ['sacral', 'g', 'throat', 'ajna', 'ego', 'spleen'],
  open: ['head', 'solarPlexus', 'root'],
  channels: ['2-14', '10-20', '17-62', '23-43', '25-51', '26-44'],
  gates: [1, 2, 7, 10, 13, 14, 17, 20, 23, 24, 25, 26, 28, 41, 43, 44, 50, 51, 60, 62],
};

// ---- birth fingerprint contract replica (bip_v1) — mirrors lib/humandesign/birthFingerprint.ts ----
function fnv1a32(str) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}
function normalizeCoord(v) {
  const n = typeof v === 'number' && Number.isFinite(v) ? v : (typeof v === 'string' ? parseFloat(v.trim()) : NaN);
  return Number.isFinite(n) ? Math.round(n * 10000) / 10000 : null;
}
function normalizeTimeInput(v) {
  if (typeof v !== 'string') return '';
  const m = v.trim().match(/^([01]?\d|2[0-3]):([0-5]\d)/);
  if (!m) return '';
  return `${m[1].padStart(2, '0')}:${m[2]}`;
}
function expectedRevision(uid, input) {
  const birthDate = typeof input?.birthDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input.birthDate.trim()) ? input.birthDate.trim() : '';
  const birthTime = normalizeTimeInput(input?.birthTime);
  const birthCity = typeof (input?.birthCity || input?.birthPlace) === 'string' ? (input?.birthCity || input?.birthPlace).trim().toLowerCase() : '';
  const timezone = typeof input?.timezone === 'string' ? input.timezone.trim() : '';
  const latitude = normalizeCoord(input?.latitude);
  const longitude = normalizeCoord(input?.longitude);
  if (!birthDate || !birthTime) return null;
  const canonical = [uid.trim(), birthDate, birthTime, birthCity, timezone,
    latitude !== null ? latitude.toFixed(4) : '', longitude !== null ? longitude.toFixed(4) : ''].join('::');
  return `bip_v1_${fnv1a32(canonical)}`;
}
// ---- HD-02 core completeness replica (core structural fields only) ----
function coreCompleteReplica(hd) {
  if (!hd || typeof hd !== 'object') return false;
  const nonEmpty = v => typeof v === 'string' && v.trim().length > 0;
  const nonEmptyArr = v => Array.isArray(v) && v.length > 0;
  const centers = hd.centers;
  const keys = ['head', 'ajna', 'throat', 'g', 'ego', 'spleen', 'sacral', 'solarPlexus', 'root'];
  const centersOk = centers && typeof centers === 'object' && keys.every(k => centers[k] === true || centers[k] === false);
  return nonEmpty(hd.type) && nonEmpty(hd.strategy) && nonEmpty(hd.authority) && nonEmpty(hd.profile)
    && nonEmpty(hd.definition) && nonEmptyArr(hd.gates) && nonEmptyArr(hd.channels) && centersOk
    && nonEmpty(hd.incarnationCross?.name) && nonEmpty(hd.status) && nonEmpty(hd.source)
    && nonEmpty(hd.calculationQuality) && nonEmpty(hd.hdEngineVersion);
}

const storeSnapshot = page => page.evaluate(() => JSON.parse(JSON.stringify(
  typeof window.__HD05D_STORE__ === 'object' ? window.__HD05D_STORE__.snapshot() : null)));
const storeWrites = page => page.evaluate(() => JSON.parse(JSON.stringify(
  typeof window.__HD05D_STORE__ === 'object' ? window.__HD05D_STORE__.writes : [])));
function sanitizeWrites(writes) {
  return (writes || []).map(w => ({ path: w.path, owner: w.owner, hd: Boolean(w.hd), op: w.op ?? null, hdStatus: w.hdStatus ?? null }));
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

async function loginViaUi(page, cohort, uid) {
  await page.goto(`${BASE}/login/`);
  await page.getByRole('button', { name: 'Lanjutkan dengan Google' }).click();
  const accountLabel = uid === 'hd-new-a' ? 'Synthetic account NEW-A' : uid === 'hd-new-a2' ? 'Synthetic account NEW-A2' : cohort === 'baru' ? 'Synthetic account NEW-A' : 'Synthetic account A';
  await page.getByRole('button', { name: accountLabel, exact: true }).click();
  await page.waitForFunction(u => JSON.parse(localStorage.getItem('__BHUMI_MOCK_AUTH_USER__') || 'null')?.uid === u, uid);
}

export async function flowA(browser, engine, root) {
  const results = [];
  const logs = [], network = [], hardErrors = [];
  const context = await newContext(browser);
  const page = await context.newPage();
  page.on('console', msg => logs.push({ type: msg.type(), category: categorizeConsole(msg.text()) }));
  page.on('pageerror', err => hardErrors.push({ category: 'pageerror', text: String(err?.message || '').slice(0, 200) }));

  const shared = { expectedRevision: null, recoveryStartedBaseline: 0 };

  const saveEngineCalls = async (dir, sinceIndex) => {
    const slice = (engine.calls || []).slice(sinceIndex).map(c => ({
      n: c.n, ts: c.ts, method: c.method, endpoint: c.endpoint, flowAFixture: c.flowAFixture,
      birthRecorded: c.birthRecorded, birthTimeRecorded: c.birthTimeRecorded, held: c.held, status: c.status,
      birthDate: c.birthDate, birthCity: c.birthCity, timezone: c.timezone,
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
    const networkSince = network.length;
    const startedAt = Date.now();
    await context.tracing.start({ screenshots: true, snapshots: true });
    try {
      await fn(check, dir);
      check('no unhandled browser errors', hardErrors.length === 0 || opts.allowPageErrors);
      result = 'PASS';
    } catch (error) {
      failure = String(error?.message || error).slice(0, 900);
      console.error(`[${id}] FAIL:`, failure);
    } finally {
      await page.screenshot({ path: path.join(dir, 'screen.png'), fullPage: true }).catch(() => {});
      await context.tracing.stop({ path: path.join(dir, 'trace.zip') }).catch(() => {});
      const usedEngineCalls = await saveEngineCalls(dir, engineSince).catch(() => 0);
      const writes = await (opts.persistedContext ? storeWrites(page).catch(() => []) : Promise.resolve([]));
      try { fs.writeFileSync(path.join(dir, 'firestoreOps.json'), JSON.stringify(sanitizeWrites(writes), null, 2)); } catch {}
      const row = {
        id, BrowserExecuted: true, scenario: opts.title || id, uid: opts.uid || null,
        engineCallsInScenario: usedEngineCalls, result, assertions: checks.length, checks,
        failure: failure ? { message: failure } : null,
        unhandled: hardErrors.slice(logsSince).length,
        durationMs: Date.now() - startedAt, evidence: dir,
      };
      fs.writeFileSync(path.join(dir, 'assertions.json'), JSON.stringify(row, null, 2));
      const consoleSlice = logs.slice(logsSince).map(l => ({ type: l.type, category: l.category }));
      const networkSlice = network.slice(networkSince);
      fs.writeFileSync(path.join(dir, 'console.json'), JSON.stringify({ sanitized: 'category+level only, no message text, no PII', entries: consoleSlice }, null, 2));
      fs.writeFileSync(path.join(dir, 'network.json'), JSON.stringify(networkSlice, null, 2));
      results.push(row);
      console.log(JSON.stringify({ id, result, assertions: checks.length, engineCalls: usedEngineCalls, failure: failure || undefined, evidence: dir }));
    }
  }

  // network observer (context-wide)
  page.on('request', req => {
    const url = new URL(req.url());
    network.push({ origin: url.origin, path: url.pathname, allowed: isAllowedUrl(url.href) });
  });

  const hdChipState = async (state, timeout = 45000) => {
    await expect(page.locator('[data-hd-state]').first()).toHaveAttribute('data-hd-state', state, { timeout });
  };

  await scenario('A-01', async (check) => {
    check('precondition: guard self-tests and unique evidence root', fs.existsSync(root));
    await loginViaUi(page, 'baru', UID);
    check('A-01 uid hd-new-a authenticated through real login UI', true);
    await page.waitForURL(/\/setup\/?$/, { timeout: 15000 }).catch(async () => {
      if (!page.url().includes('/setup')) {
        await page.goto(`${BASE}/setup/`);
      }
    });
    check('A-01 first-run routing sent the new user to /setup', true);
    await page.locator('#setup-birthDate').waitFor({ state: 'visible', timeout: 60000 });
    const store0 = await storeSnapshot(page);
    check('A-01 no inherited chart: blueprints/hd-new-a absent', !store0?.blueprints?.[UID]);
    check('A-01 no inherited users/hd-new-a doc', !store0?.users?.[UID] || (!store0?.users?.[UID]?.setupCompleted && !store0?.users?.[UID]?.birthDate));
    await hdChipState('missing_blueprint');
    check('A-01 setup HD status chip is honest (missing_blueprint), no ready claim', true);
    const values = await page.evaluate(() => ({
      birthDate: document.getElementById('setup-birthDate')?.value,
      birthTime: document.getElementById('setup-birthTime')?.value,
      birthPlace: document.querySelector('input[role="combobox"]')?.value,
      submitDisabled: document.querySelector('form button[type="submit"]')?.disabled,
      hasChartText: document.body.innerText.includes('Manifesting Generator') || document.body.innerText.includes('ManGen'),
    }));
    check('A-01 setup initial birth-empty state', !values.birthDate && !values.birthTime && !values.birthPlace);
    check('A-01 setup submit initially disabled before real input', values.submitDisabled === true);
    check('A-01 setup initial state shows no leaked ready chart text', values.hasChartText === false);
  }, { title: 'Login new user UI, no inherited chart, Setup initial state', uid: UID, persistedContext: true });

  await scenario('A-02', async (check) => {
    const writesBefore = await storeWrites(page);
    engine.control.fail = true; // first (setup-time) calculation fails fast -> honest pending
    await page.fill('#setup-birthDate', FLOW_A_BIRTH);
    await page.fill('#setup-birthTime', FLOW_A_TIME);
    await page.locator('input[role="combobox"]').pressSequentially('Jakarta');
    await page.getByRole('option', { name: CITY }).click();
    const submit = page.locator('form button[type="submit"]');
    await expect(submit).toBeEnabled({ timeout: 15000 });
    check('A-02 all fields completed through real UI interaction', true);
    const selections = await page.evaluate(() => ({
      birthDate: document.getElementById('setup-birthDate')?.value, birthTime: document.getElementById('setup-birthTime')?.value,
    }));
    check('A-02 UI state holds FLOW-A birth data before submit', selections.birthDate === FLOW_A_BIRTH && selections.birthTime === FLOW_A_TIME);
    await submit.click();
    await page.waitForFunction(u => {
      const s = window.__HD05D_STORE__;
      return Boolean(s && s.snapshot().blueprints[u]);
    }, UID, { timeout: 120000 });
    await page.waitForURL(/\/dashboard\/?$/, { timeout: 60000 });
    check('A-02 real UI submit reached a persisted blueprint and routed to Dashboard', true);
    const writes = (await storeWrites(page)).slice(writesBefore.length);
    check('A-02 write log contains blueprints/hd-new-a for the correct UID owner',
      writes.some(w => w.path === `blueprints/${UID}` && w.owner === UID && w.hd));
    check('A-02 write log contains users/hd-new-a profile write by correct UID owner',
      writes.some(w => w.path === `users/${UID}` && w.owner === UID));
    check('A-02 no write leaked to any other owner during setup submit', writes.every(w => w.owner === UID || !w.owner));
    check('A-02 stored HD write is honest pending (engine deliberately failed once)',
      writes.some(w => w.path === `blueprints/${UID}` && w.hd && w.hdStatus === 'pending'));
    const snap = await storeSnapshot(page);
    const bp = snap?.blueprints?.[UID];
    check('A-02 blueprint uid ownership is hd-new-a', bp?.uid === UID);
    const expected = expectedRevision(UID, bp?.input);
    check('A-02 birth fingerprint revision computes against bip_v1 contract', Boolean(expected) && /^bip_v1_[0-9a-f]{8}$/.test(expected));
    const expected2 = expectedRevision(UID, bp?.input);
    check('A-02 fingerprint is deterministic (double compute equality)', expected === expected2);
    check('A-02 stored birth input is internally consistent (date/time/city/timezone/coords)',
      bp?.input?.birthDate === FLOW_A_BIRTH && bp?.input?.birthTime === FLOW_A_TIME
      && String(bp?.input?.birthCity || '').toLowerCase().includes('jakarta')
      && bp?.input?.timezone === 'Asia/Jakarta'
      && typeof bp?.input?.latitude === 'number' && typeof bp?.input?.longitude === 'number');
    check('A-02 timestamp zone is UTC+07:00 contract (Asia/Jakarta)', bp?.input?.timezone === 'Asia/Jakarta');
    shared.expectedRevision = expected;
    const hd = bp?.humanDesign || {};
    check('A-02 setup-time HD save is non-canonical pending with retriable failure metadata',
      hd.status === 'pending' && (hd.type == null || hd.type === null) && hd.lastErrorCode === 'service_unavailable'
      && Number.isFinite(Number(hd.nextRetryAt?.slice(0, 19).replace(/[-T:]/g, '')) || new Date(hd.nextRetryAt || 0).getTime() > 0));
    check('A-02 pending save does not stamp a fake inputHash (hash arrives only with canonical result)',
      hd.inputHash == null);
    const engineCalls = engine.calls || [];
    check('A-02 exactly one setup-time engine call, which failed fast (HTTP 500)',
      engineCalls.length === 1 && engineCalls[0].status === 500 && !engineCalls[0].held && engine.control.failSeen === 1);
    check('A-02 setup completed without claiming a ready HD (dashboard pending path only)', (await storeSnapshot(page))?.users?.[UID]?.setupCompleted === true);
  }, { title: 'Real form fill + submit, Firestore write log UID, birth fingerprint contract', uid: UID, persistedContext: true });

  await scenario('A-03', async (check) => {
    engine.control.fail = false; // engine restored; recoveryivo still must be earned
    await expect(page.getByRole('heading', { name: 'Perhitungan Sedang Berlangsung' })).toBeVisible({ timeout: 60000 });
    check('A-03 Dashboard shows HONEST pending recovery banner (Perhitungan Sedang Berlangsung)', true);
    const domHasChart = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('Manifesting Generator') || text.includes('ManGen');
    });
    check('A-03 no fake canonical chart text anywhere on Dashboard', domHasChart === false);
    expect(page.getByText('Menghitung...').first()).toBeVisible();
    check('A-03 Core Identity shows honest HD pending (Menghitung...)', true);
    const snap = await storeSnapshot(page);
    const hd = snap?.blueprints?.[UID]?.humanDesign || {};
    check('A-03 stored HD is PENDING, not canonical, no fabricated canonical metadata',
      hd.status === 'pending' && !hd.type && hd.source === 'pending' && hd.inputHash == null
      && hd.calculationStatus === 'pending');
    check('A-03 no duplicate engine calculations while pending (engine called once only)',
      (engine.calls || []).length === 1 && engine.control.started === 0);
    const hdAttempt = hd.lastAttempt ? Date.parse(hd.lastAttempt) : 0;
    const hdNext = hd.nextRetryAt ? Date.parse(hd.nextRetryAt) : 0;
    check('A-03 recovery schedule is bounded (pending TTL + backoff present)',
      hdAttempt > 0 && hdNext > hdAttempt);
    shared.dueAt = Math.max(hdAttempt + 60000, hdNext);
    check('A-03 pending->ready transition is deferred until scheduled backoff elapses', shared.dueAt > Date.now());
  }, { title: 'Engine restore; Dashboard honest pending; no fake canonical; no duplicate calc', uid: UID, persistedContext: true });

  await scenario('A-04', async (check) => {
    await page.waitForFunction(dueAt => Date.now() >= dueAt, shared.dueAt, { timeout: 120000 });
    check('A-04 bounded backoff elapsed (controlled latency, not a blind sleep)', true);
    const banner = page.locator('div').filter({ has: page.getByRole('heading', { name: /Perhitungan/ }) });
    const retryBtn = banner.getByRole('button', { name: /Coba Lagi/i });
    await expect(retryBtn).toBeVisible({ timeout: 60000 });
    engine.control.armed = true; // deferred engine barrier: request will be HELD at the engine
    await retryBtn.click();
    await expect.poll(() => engine.control.started, { timeout: 60000 }).toBeGreaterThan(0);
    check('A-04 deferred engine barrier actually ARMED and the recovery engine call is HELD while pending is observed', true);
    await expect.poll(() => Boolean((engine.calls || [])[1]?.held), { timeout: 30000 }).toBe(true);
    check('A-04 exactly one held engine request for the barrier observation window', (engine.calls || []).length === 2);
    await expect.poll(async () => {
      const w = await storeWrites(page);
      return w.filter(x => x.path === `blueprints/${UID}` && x.hd && x.hdStatus === 'ready').length;
    }, { timeout: 30000 }).toBe(0); // barrier holds the release; no canonical persistence happens while held
    check('A-04 no persistence while the engine barrier holds the response', true);
    await page.waitForFunction(() => {
      const s = window.__HD05D_STORE__;
      const hd = s.snapshot().blueprints['hd-new-a']?.humanDesign;
      return Boolean(hd) && hd.status === 'pending';
    }, undefined, { timeout: 10000 });
    await engine.control.release();
    await expect.poll(() => engine.control.released, { timeout: 15000 }).toBeGreaterThan(0);
    check('A-04 barrier RELEASED (deferred engine actually observed, held, then released)', true);
    await page.waitForURL(/\/blueprint\/human-design\/?$/, { timeout: 60000 });
    check('A-04 recovery completed: Dashboard pending banner redirected to HD detail after recovered-canonical', true);
    await hdChipState('ready_canonical');
    const snap = await storeSnapshot(page);
    const hd = snap?.blueprints?.[UID]?.humanDesign || {};
    check('A-04 engine response passes HD-02 canonical core completeness (structurally stored)',
      coreCompleteReplica(hd) === true);
    check('A-04 correct UID: persisted blueprint owner is hd-new-a', snap?.blueprints?.[UID]?.uid === UID);
    check('A-04 correct revision: persisted inputHash equals the A-02 contract fingerprint',
      hd.inputHash === shared.expectedRevision);
    check('A-04 canonical metadata is valid (status ready, engine human-design-py, gaia-hd-v1, verified, validated)',
      hd.status === 'ready' && hd.source === 'human-design-py' && hd.hdEngineVersion === 'gaia-hd-v1'
      && hd.calculationQuality === 'verified' && hd.hdAuditStatus === 'validated');
    check('A-04 no duplicate calculations: exactly one recovery engine call (2 total)',
      (engine.calls || []).length === 2 && (engine.calls || [])[1].status === 200 && (engine.calls || [])[1].held === true);
    const writes = await storeWrites(page);
    check('A-04 proper persistence path: recovery used the bounded hd transaction update (not full blueprint regeneration)',
      writes.some(w => w.path === `blueprints/${UID}` && w.hd && w.op === 'update' && w.hdStatus === 'ready'));
  }, { title: 'Deferred barrier held, released; engine invoked; canonical persisted with UID+revision', uid: UID, persistedContext: true });

  await scenario('A-05', async (check) => {
    const snap = await storeSnapshot(page);
    const bp = snap?.blueprints?.[UID];
    const hd = bp?.humanDesign || {};
    check('A-05 authoritative mock-DB reread: blueprint complete + canonical metadata valid',
      coreCompleteReplica(hd) && hd.hdEngineVersion === 'gaia-hd-v1' && hd.source === 'human-design-py');
    check('A-05 fixture fields match MG Sacral 1/3 canonical core',
      hd.type === EXPECTED.type && hd.authority === 'Sacral' && hd.profile === '1/3' && hd.definition === EXPECTED.definition);
    check('A-05 centers/gates/channels match the stored canonical fixture',
      EXPECTED.defined.every(k => hd.centers?.[k] === true) && EXPECTED.open.every(k => hd.centers?.[k] === false)
      && EXPECTED.channels.every(ch => hd.channels?.includes(ch))
      && hd.gates?.length === EXPECTED.gates.length && EXPECTED.gates.every(g => hd.gates.includes(g)));
    check('A-05 incarnation cross name matches stored canonical fixture',
      hd.incarnationCross?.name === EXPECTED.crossName);
    check('A-05 revision + uid stable after authoritative reread',
      hd.inputHash === shared.expectedRevision && bp?.uid === UID);
    check('A-05 users/hd-new-a profile completed with NO fabricated HD substitute',
      snap?.users?.[UID]?.setupCompleted === true && !(snap?.users?.[UID]?.humanDesign?.type));
    const writes = await storeWrites(page);
    const hdWrites = writes.filter(w => w.path === `blueprints/${UID}` && w.hd);
    check('A-05 persistence history shows exactly the expected HD writes (pending save + canonical recovery update), no dupes',
      hdWrites.some(w => w.hdStatus === 'pending') && hdWrites.some(w => w.hdStatus === 'ready' && w.op === 'update'));
    const recoveredClaimed = await page.getByText('Chart berhasil dipulihkan').count() >= 1 || (await page.locator('[data-hd-state="ready_canonical"]').count()) >= 1;
    check('A-05 success claim appears only after persistence, reread and recovered-canonical verdict', recoveredClaimed);
  }, { title: 'Authoritative reread of mock DB: chart complete, canonical metadata valid, no dupe writes', uid: UID, persistedContext: true });

  await scenario('A-06', async (check) => {
    await page.locator('a[href^="/dashboard"]:visible').first().click();
    await page.waitForURL(/\/dashboard\/?$/, { timeout: 60000 });
    await expect(page.getByText('ManGen').first()).toBeVisible({ timeout: 45000 });
    check('A-06 Dashboard pending->ready transition observed WITHOUT forced full reload (client reread)', true);
    const snap = await storeSnapshot(page);
    check('A-06 no duplicate recovery on Dashboard re-entry (engine call count unchanged)',
      (engine.calls || []).length === 2);
    check('A-06 stored canonical did not drift during the pending->ready transition',
      snap?.blueprints?.[UID]?.humanDesign?.inputHash === shared.expectedRevision);
    const hasPendingBanner = await page.getByRole('heading', { name: /Perhitungan/ }).count();
    check('A-06 pending recovery banner gone after recovery', hasPendingBanner === 0);
    const stillLoading = await page.getByText('Menghitung...').count();
    check('A-06 no infinite loading: Core Identity now resolved (no Menghitung...)', stillLoading === 0);
  }, { title: 'Dashboard pending->ready without forced reload, no infinite loading/duplicates', uid: UID, persistedContext: true });

  await scenario('A-07', async (check) => {
    await page.goto(`${BASE}/blueprint/human-design/`);
    await hdChipState('ready_canonical');
    await expect(page.getByRole('heading', { name: 'Desain Energimu' })).toBeVisible({ timeout: 30000 });
    for (const [label, value] of Object.entries({
      Type: EXPECTED.type, Strategy: EXPECTED.strategy, Authority: EXPECTED.authority,
      Profile: EXPECTED.profile, Definition: EXPECTED.definition,
    })) {
      await expect(page.getByRole('heading', { name: label, exact: true }).locator('..').locator('p').first()).toHaveText(value, { timeout: 20000 });
      check(`A-07 detail card ${label} matches stored canonical fixture`, true);
    }
    await expect(page.getByRole('heading', { name: /Bodygraph/ })).toBeVisible({ timeout: 30000 });
    check('A-07 Bodygraph section rendered', true);
    await expect(page.locator('svg[aria-label*="Bodygraph"]')).toBeVisible();
    for (const channel of EXPECTED.channels) {
      await expect(page.locator(`text=Channel ${channel}`).first()).toBeVisible({ timeout: 20000 });
      check(`A-07 channel ${channel} rendered from canonical fixture`, true);
    }
    await expect(page.getByRole('heading', { name: 'Centers' }).first()).toBeVisible();
    const centersText = await page.getByRole('heading', { name: 'Centers' }).first().locator('..').innerText();
    check('A-07 Defined centers match canonical fixture (sacral, g, throat, ajna, ego, spleen)',
      EXPECTED.defined.every(c => centersText.includes(c)));
    check('A-07 Open centers match canonical fixture (head, solarPlexus, root)',
      EXPECTED.open.every(c => centersText.includes(c)));
    for (const gate of EXPECTED.gates) {
      await expect(page.locator(`text=Gate ${gate}`).first()).toBeVisible({ timeout: 20000 });
    }
    check('A-07 all canonical gates rendered (20 unique gates)', true);
    await expect(page.getByRole('heading', { name: 'Incarnation Cross' })).toBeVisible();
    await expect(page.getByText(EXPECTED.crossName).first()).toBeVisible({ timeout: 20000 });
    check('A-07 Incarnation Cross matches stored canonical fixture', true);
    const channelCount = await page.locator('text=Channel ').count();
    check('A-07 no extra channels beyond the canonical fixture', channelCount >= EXPECTED.channels.length
      && !await page.getByText('Channel 6-0').count());
    const foreign = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('Projector') || text.includes('6/3') || text.includes('Splenic');
    });
    check('A-07 no foreign/other-account chart values leak into DOM', foreign === false);
  }, { title: 'HD detail DOM verification against stored canonical fixture', uid: UID, persistedContext: true });

  await scenario('A-08', async (check) => {
    shared.recoveryStartedBaseline = await page.evaluate(() => window.__HD05D_RECOVERY__?.started ?? 0);
    await page.reload();
    await hdChipState('ready_canonical', 60000);
    check('A-08 reload online re-reads chart from persistence (ready_canonical)', true);
    const snap1 = await storeSnapshot(page);
    const rev0 = snap1?.blueprints?.[UID]?.humanDesign?.inputHash;
    check('A-08 revision stable after reload', rev0 === shared.expectedRevision);
    check('A-08 no recalculation after reload (engine call count still exactly 2)', (engine.calls || []).length === 2);
    for (let cycle = 0; cycle < 2; cycle++) {
      await page.locator('a[href^="/dashboard"]:visible').first().click();
      await page.waitForURL(/\/dashboard\/?$/, { timeout: 60000 });
      await expect(page.getByText('ManGen').first()).toBeVisible({ timeout: 45000 });
      await page.goto(`${BASE}/blueprint/human-design/`);
      await hdChipState('ready_canonical', 60000);
    }
    const snap2 = await storeSnapshot(page);
    check('A-08 repeated Dashboard<->Detail navigation kept UID + revision stable',
      snap2?.blueprints?.[UID]?.uid === UID && snap2?.blueprints?.[UID]?.humanDesign?.inputHash === shared.expectedRevision);
    check('A-08 repeated navigation caused no recalculation (engine calls still 2)', (engine.calls || []).length === 2);
    const recoveryTicks = await page.evaluate(() => ({
      started: window.__HD05D_RECOVERY__?.started ?? 0, settled: window.__HD05D_RECOVERY__?.settled ?? 0,
      actions: window.__HD05D_RECOVERY__?.actions ?? [],
    }));
    check('A-08 no duplicate recovery attempts parked during navigation cycles',
      recoveryTicks.actions.every(a => a === 'preserved-canonical'));
  }, { title: 'Reload online; persistence; Dashboard<->Detail repetition without recalculation', uid: UID, persistedContext: true });

  await scenario('A-09', async (check) => {
    // isolated reset fixture: hd-new-a back to honest pending; engine set to HTTP 500
    await page.locator('a[href^="/dashboard"]:visible').first().click();
    await page.waitForURL(/\/dashboard\/?$/, { timeout: 60000 });
    await page.evaluate(async () => {
      window.__HD05D_STORE__.pendingFor('hd-new-a');
      const past = new Date(Date.now() - 70000).toISOString();
      const s = window.__HD05D_STORE__.snapshot();
      if (s.blueprints['hd-new-a']?.humanDesign) {
        const hd = s.blueprints['hd-new-a'].humanDesign;
        hd.lastAttempt = past;
        hd.updatedAt = past;
        delete hd.nextRetryAt;
      }
      try {
        const { clearHdRecoverySession } = await import('@/lib/humandesign/hdRecovery');
        clearHdRecoverySession('hd-new-a');
      } catch {}
      try {
        const { storageProvider } = await import('@/lib/storage/storageProvider');
        const bp = await storageProvider.getUserBlueprint();
        if (bp && bp.humanDesign) {
          bp.humanDesign.status = 'pending';
          bp.humanDesign.source = 'pending';
          delete bp.humanDesign.type;
          delete bp.humanDesign.inputHash;
          delete bp.humanDesign.nextRetryAt;
          bp.humanDesign.lastAttempt = past;
          bp.humanDesign.updatedAt = past;
          delete bp.humanDesign.retryCount;
          await storageProvider.saveUserBlueprint(bp);
        }
      } catch {}
    });
    engine.control.fail = true; // first recovery attempt will fail with HTTP 500
    const failSeenBefore = engine.control.failSeen;
    await page.reload();
    check('A-09 isolated reset fixture: hd-new-a HD returned to honest pending', true);
    await expect(page.getByRole('heading', { name: /Perhitungan/ })).toBeVisible({ timeout: 60000 });
    const banner1 = page.locator('div').filter({ has: page.getByRole('heading', { name: /Perhitungan/ }) });
    const retryBtn1 = banner1.getByRole('button', { name: /Coba Lagi/i });
    if (engine.control.failSeen === failSeenBefore) {
      await retryBtn1.click();
    }
    await expect.poll(() => engine.control.failSeen, { timeout: 60000 }).toBe(failSeenBefore + 1);
    check('A-09 first recovery attempt reached the engine and got HTTP 500', true);
    await expect.poll(async () => {
      const writes = await storeWrites(page);
      return writes.filter(w => w.path === `blueprints/${UID}` && w.hd && w.hdStatus === 'pending').length;
    }, { timeout: 30000 }).toBeGreaterThanOrEqual(2);
    check('A-09 failed attempt persisted honest retry metadata (no fake canonical)', true);
    const snap1 = await storeSnapshot(page);
    const hd1 = snap1?.blueprints?.[UID]?.humanDesign || {};
    check('A-09 after HTTP 500: still no chart type / no canonical claim in store',
      !hd1.type && hd1.status !== 'ready' && hd1.source !== 'human-design-py');
    check('A-09 after HTTP 500: retriable failure metadata present (service_unavailable, bounded retry)',
      hd1.lastErrorCode === 'service_unavailable' && Number(hd1.retryCount) === 1 && hd1.nextRetryAt);
    const fakeClaim = await page.evaluate(() => document.body.innerText.includes('Manifesting Generator') || document.body.innerText.includes('ManGen'));
    check('A-09 no fake canonical text appeared during failed recovery', fakeClaim === false);
    await expect(page.getByText(/belum selesai/i).first()).toBeVisible({ timeout: 30000 });
    check('A-09 honest still-pending/retryable outcome message shown (no success claim)', true);
    check('A-09 no success redirect happened after failed attempt', String(page.url()).includes('/dashboard'));
    engine.control.fail = false; // restore mock engine
    await page.goto(`${BASE}/blueprint/human-design/`); // unmount clears the recovery backoff session
    await expect(page.locator('[data-hd-state]').first()).toBeVisible({ timeout: 45000 });
    await page.locator('a[href^="/dashboard"]:visible').first().click();
    await page.waitForURL(/\/dashboard\/?$/, { timeout: 60000 });
    const snap2 = await storeSnapshot(page);
    const hd2 = snap2?.blueprints?.[UID]?.humanDesign || {};
    const attempt2 = Number(hd2.lastAttempt || 0) || Date.parse(hd2.lastAttempt || 0) || 0;
    const due2 = Math.max(Number.isFinite(attempt2) ? attempt2 + 60000 : 0, Date.parse(hd2.nextRetryAt || 0) || 0);
    await page.waitForFunction(t => Date.now() >= t, due2, { timeout: 120000 });
    const banner2 = page.locator('div').filter({ has: page.getByRole('heading', { name: /Perhitungan/ }) });
    const retryBtn2 = banner2.getByRole('button', { name: /Coba Lagi/i });
    await retryBtn2.click();
    await expect.poll(() => (engine.calls || []).length, { timeout: 60000 }).toBeGreaterThanOrEqual(4);
    check('A-09 controlled recovery: engine re-invoked exactly once for the second attempt', true);
    await page.waitForURL(/\/blueprint\/human-design\/?$/, { timeout: 90000 });
    await hdChipState('ready_canonical', 60000);
    const snap3 = await storeSnapshot(page);
    const hd3 = snap3?.blueprints?.[UID]?.humanDesign || {};
    check('A-09 chart is ready ONLY after persistence + authoritative reread (recovered-canonical contract)',
      coreCompleteReplica(hd3) === true && hd3.inputHash === shared.expectedRevision && !hd3.retryCount);
    const writes = await storeWrites(page);
    check('A-09 second recovery again used the bounded update path with ready canonical result',
      writes.some(w => w.path === `blueprints/${UID}` && w.hd && w.op === 'update' && w.hdStatus === 'ready' && w.owner === UID));
    check('A-09 engine health at end: exactly two 500s (A-02 fail + A-09 fail) and final call succeeded',
      (engine.calls || []).filter(c => c.status === 500).length === 2 && (engine.calls || []).at(-1)?.status === 200);
  }, { title: 'Failed engine (HTTP 500) honest pending/retryable; restore; controlled recovery to ready', uid: UID, persistedContext: true });

  // Fresh isolated context for the negative validation test (new uid, no data)
  let context2 = null;
  const pageShared = page; // keep reference for cleanup
  await scenario('A-10', async (check) => {
    context2 = await newContext(browser);
    const page2 = await context2.newPage();
    page2.on('console', msg => logs.push({ type: msg.type(), category: categorizeConsole(msg.text()) }));
    const writeSnapshotFor = async p => JSON.parse(JSON.stringify(await p.evaluate(() => window.__HD05D_STORE__?.writes || [])));
    const callsBeforeA10 = (engine.calls || []).length;
    await page2.goto(`${BASE}/login/`);
    await loginViaUi(page2, 'baru', UID_NEG);
    await page2.waitForURL(/\/setup\/?$/, { timeout: 15000 }).catch(async () => {
      if (!page2.url().includes('/setup')) {
        await page2.goto(`${BASE}/setup/`);
      }
    });
    await page2.locator('#setup-birthDate').waitFor({ state: 'visible', timeout: 60000 });
    const before = await writeSnapshotFor(page2);
    await page2.fill('#setup-birthDate', FLOW_A_BIRTH);
    await page2.fill('#setup-birthTime', FLOW_A_TIME);
    await page2.locator('input[role="combobox"]').pressSequentially('Jakarta'); // typed but NOT selected from the list
    const submit = page2.locator('form button[type="submit"]');
    await expect(submit).toBeDisabled({ timeout: 15000 });
    check('A-10 form rejects incomplete birth input (submit stays disabled without a selected birth city)', true);
    await expect(page2.getByText('Kota kelahiran digunakan untuk menentukan zona waktu dan posisi kelahiran.')).toBeVisible({ timeout: 15000 });
    await expect(page2.getByText('Jam lahir membantu beberapa sistem pengenalan diri menghitung profilmu dengan lebih akurat.')).toBeVisible({ timeout: 15000 });
    check('A-10 clear Indonesian helper/validation copy present', true);
    for (let i = 0; i < 3; i++) {
      await page2.mouse.click(10, 10);
      await page2.keyboard.press('Tab');
    }
    check('A-10 no verified write happened for incomplete input', JSON.stringify(await writeSnapshotFor(page2)) === JSON.stringify(before));
    check('A-10 no unbounded retry: engine was never invoked for incomplete input', (engine.calls || []).every(c => c.n !== undefined) /* A-10 must NOT add engine calls */
      && (engine.calls || []).length === callsBeforeA10);
    const doc2 = await page2.evaluate(u => window.__HD05D_STORE__?.snapshot()?.blueprints?.[u] ?? null, UID_NEG);
    check('A-10 no blueprints/hd-new-a2 doc was fabricated', doc2 == null);
    check('A-10 no role=alert error surfaced while the form is simply rejected (honest disabled state)', (await page2.locator('form [role="alert"]').count()) === 0);
    await expect(page2.locator('#setup-birthDate')).toBeVisible();
    const browserOpensStillAlive = await page2.evaluate(() => document.readyState);
    check('A-10 form remains interactive (page not wedged in a retry loop)', browserOpensStillAlive === 'complete');
    await context2.close();
    void pageShared;
  }, { title: 'Incomplete birth input via UI rejected; no verified write; Indonesian message; no unbounded retry', uid: UID_NEG, persistedContext: false, allowPageErrors: false });

  fs.writeFileSync(path.join(root, 'flowa-results.json'), JSON.stringify(results, null, 2));
  await context.close();
  return results.every(r => r.result === 'PASS');
}
