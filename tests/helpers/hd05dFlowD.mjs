import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { expect } from '@playwright/test';
import { isAllowedUrl } from './hd05cHarnessNetworkGuard.mjs';

export async function flowD(browser, engine, root) {
  const results = [];
  for (let number = 1; number <= 7; number++) {
    const id = `D0${number}`;
    const dir = fs.mkdtempSync(path.join(root, `${id}-${Date.now()}-`));
    const context = await browser.newContext({ serviceWorkers: 'block' });
    await context.tracing.start({ screenshots: true, snapshots: true });
    const logs = [], network = [], errors = [], checks = [];
    await context.route('**/*', route => {
      const url = new URL(route.request().url());
      network.push({ origin: url.origin, path: url.pathname, allowed: isAllowedUrl(url.href) });
      if (isAllowedUrl(url.href) && url.pathname.replace(/\/$/, '') === '/api/access/bootstrap-trial') return route.fulfill({ json: { ok: true, outcome: 'ALREADY_PRESENT' } });
      return isAllowedUrl(url.href) ? route.continue() : route.abort();
    });
    await context.routeWebSocket('**/*', socket => {
      const u = new URL(socket.url());
      if (u.protocol === 'ws:' && ['localhost', '127.0.0.1'].includes(u.hostname) && u.port === '3001') socket.connectToServer();
      else socket.close();
    });
    const page = await context.newPage();
    page.on('console', msg => {
      const text = msg.text();
      const category = /Failed to load resource/.test(text) ? 'resource-load-failed' : /OAuthCredential/.test(text) ? 'mock-oauth-export' : /hydration|hydrated/i.test(text) ? 'hydration' : /GUARD|ERR_BLOCKED/.test(text) ? 'expected-network-block' : /FirebaseError/.test(text) ? 'firebase-error' : /\[AUTH/.test(text) ? 'auth-lifecycle' : /Fast Refresh|HMR/.test(text) ? 'development-refresh' : 'application-message';
      logs.push({ type: msg.type(), category });
    });
    page.on('pageerror', () => errors.push('pageerror'));
    const check = (name, value) => { assert.ok(value, name); checks.push(name); };
    page.on('domcontentloaded', () => {
      page.evaluate(() => {
        window.__DOM_TRACK__ = { foreignA: 0, foreignB: 0 };
        new MutationObserver(() => {
          const main = document.querySelector('main');
          if (!main) return;
          const uid = JSON.parse(localStorage.getItem('__BHUMI_MOCK_AUTH_USER__') || 'null')?.uid;
          const text = main.innerText || main.textContent || '';
          if (uid === 'hd-browser-test-b' && (text.includes('Manifesting Generator') || (text.includes('Sacral') && !text.includes('Open:')))) window.__DOM_TRACK__.foreignA++;
          if (uid === 'hd-browser-test-a' && (text.includes('Projector') || text.includes('Splenic'))) window.__DOM_TRACK__.foreignB++;
        }).observe(document.body, { subtree: true, childList: true, characterData: true });
      }).catch(() => {});
    });
    const hd = async () => { await page.goto('http://localhost:3001/blueprint/human-design/'); await page.locator('[data-hd-state]').waitFor(); };
    const login = async account => {
      await page.goto('http://localhost:3001/login/');
      await page.getByRole('button', { name: 'Lanjutkan dengan Google' }).click();
      await page.getByRole('button', { name: `Synthetic account ${account}` }).click();
      await page.waitForFunction(a => JSON.parse(localStorage.getItem('__BHUMI_MOCK_AUTH_USER__') || 'null')?.uid === `hd-browser-test-${a.toLowerCase()}`, account);
    };
    const chart = async account => {
      await expect(page.locator('[data-hd-state]')).toHaveAttribute('data-hd-state', 'ready_canonical', { timeout: 45000 });
      for (const [label, value] of Object.entries(account === 'A' ? { Type: 'Manifesting Generator', Authority: 'Sacral', Profile: '6/3' } : { Type: 'Projector', Authority: 'Splenic', Profile: '2/4' })) {
        await expect(page.getByRole('heading', { name: label, exact: true }).locator('..').locator('p').first()).toHaveText(value);
        checks.push(`${account} ${label}`);
      }
      await expect(page.getByText(account === 'A' ? 'Projector' : 'Manifesting Generator', { exact: true })).toHaveCount(0);
      checks.push('no foreign chart');
      const authorityText = await page.getByRole('heading', { name: 'Authority', exact: true }).locator('..').locator('p').first().innerText();
      const profileText = await page.getByRole('heading', { name: 'Profile', exact: true }).locator('..').locator('p').first().innerText();
      assert.equal(authorityText, account === 'A' ? 'Sacral' : 'Splenic');
      assert.equal(profileText, account === 'A' ? '6/3' : '2/4');
      checks.push('DOM authority/profile clean');
    };
    const logout = async () => {
      await page.goto('http://localhost:3001/settings/');
      page.once('dialog', dialog => dialog.accept());
      await page.getByRole('button', { name: /Keluar|Sign Out/i }).last().click();
      await page.waitForFunction(() => !localStorage.getItem('__BHUMI_MOCK_AUTH_USER__'));
      await expect(page.getByText('Manifesting Generator', { exact: true })).toHaveCount(0);
      checks.push('logout clears A DOM');
    };
    let result = 'FAIL';
    let failure = null;
    try {
      await login('A'); await hd(); await chart('A');
      if (number === 2) await logout();
      if ([3, 6].includes(number)) {
        for (let cycle = 0; cycle < (number === 6 ? 2 : 1); cycle++) {
          await logout(); await login('B'); await page.goto('http://localhost:3001/blueprint/human-design/'); await page.locator('[data-hd-state]').waitFor(); await chart('B');
          if (number === 6) { await logout(); await login('A'); await page.goto('http://localhost:3001/blueprint/human-design/'); await page.locator('[data-hd-state]').waitFor(); await chart('A'); }
        }
        if (number === 6) {
          const track = await page.evaluate(() => window.__DOM_TRACK__ || { foreignA: 0, foreignB: 0 });
          check('MutationObserver observed clean intermediate B', track.foreignA === 0);
          check('MutationObserver observed clean intermediate A', track.foreignB === 0);
        }
      }
      if ([4, 7].includes(number)) {
        await page.evaluate(() => { window.__HD05D_STORE__.arm(); window.dispatchEvent(new Event('online')); });
        await page.waitForFunction(() => window.__HD05D_STORE__.pending > 0);
        checks.push('read delay explicitly observed');
        if (number === 7) {
          await page.locator('a[href^="/dashboard"]:visible').click();
          await expect(page).toHaveURL(/\/dashboard\/?$/, { timeout: 60000 });
          await page.evaluate(() => window.__HD05D_STORE__.release());
          await page.waitForFunction(() => window.__HD05D_STORE__.released > 0);
          await expect(page.getByRole('heading', { name: 'Desain Energimu', exact: true })).toHaveCount(0);
          await expect(page.getByRole('heading', { name: 'Authority', exact: true })).toHaveCount(0);
          checks.push('release after unmount');
        } else {
          await page.getByRole('button', { name: 'Switch synthetic account' }).click();
          await page.getByRole('button', { name: 'Synthetic account B' }).click();
          await chart('B');
          await page.evaluate(() => window.__HD05D_STORE__.release());
          await page.waitForFunction(() => window.__HD05D_STORE__.released > 0);
          await chart('B');
          await page.evaluate(() => { Object.defineProperty(navigator, 'onLine', { configurable: true, value: false }); window.dispatchEvent(new Event('offline')); });
          await expect(page.locator('[data-hd-state]')).toHaveAttribute('data-hd-state', 'offline_with_valid_cache');
          await expect(page.getByText('Manifesting Generator', { exact: true })).toHaveCount(0);
          checks.push('B cache survives late A');
        }
      }
      if (number === 5) {
        engine.control.armed = true;
        await page.evaluate(() => { window.__HD05D_STORE__.makePending(); window.dispatchEvent(new Event('online')); });
        await page.getByRole('button', { name: 'Coba lagi', exact: true }).click();
        await expect.poll(() => engine.control.started, { timeout: 15000 }).toBeGreaterThan(0);
        checks.push('shared executor reached deferred engine');
        await page.getByRole('button', { name: 'Switch synthetic account' }).click();
        await page.getByRole('button', { name: 'Synthetic account B' }).click();
        await chart('B');
        const before = await page.evaluate(() => JSON.stringify(window.__HD05D_STORE__.state()['hd-browser-test-b']));
        engine.control.release();
        check('engine release marker', engine.control.released > 0);
        await chart('B');
        await expect.poll(() => page.evaluate(() => window.__HD05D_RECOVERY__?.settled), { timeout: 15000 }).toBeGreaterThan(0);
        checks.push('shared executor operation settled after release');
        check('B final state untouched', before === await page.evaluate(() => JSON.stringify(window.__HD05D_STORE__.state()['hd-browser-test-b'])));
        check('no foreign HD writes', await page.evaluate(() => window.__HD05D_STORE__.writes.every(w => !w.hd || w.path === `blueprints/${w.owner}`)));
        fs.writeFileSync(path.join(dir, 'writes.json'), JSON.stringify(await page.evaluate(() => window.__HD05D_STORE__.writes)));
      }
      check('no unhandled browser errors', errors.length === 0);
      result = 'PASS';
    } catch (error) { failure = String(error.message).slice(0, 900); }
    finally {
      engine.control.release(); engine.control.armed = false;
      await page.screenshot({ path: path.join(dir, 'screen.png'), fullPage: true }).catch(() => {});
      await context.tracing.stop({ path: path.join(dir, 'trace.zip') });
      const row = { id, BrowserExecuted: true, result, assertions: checks.length, checks, failure, consoleErrors: logs.filter(x => x.type === 'error').length, unhandled: errors.length, evidence: dir };
      fs.writeFileSync(path.join(dir, 'assertions.json'), JSON.stringify(row, null, 2));
      fs.writeFileSync(path.join(dir, 'console.json'), JSON.stringify(logs));
      fs.writeFileSync(path.join(dir, 'network.json'), JSON.stringify(network));
      results.push(row); console.log(JSON.stringify(row));
      await context.close();
    }
  }
  fs.writeFileSync(path.join(root, 'results.json'), JSON.stringify(results, null, 2));
  return results.every(row => row.result === 'PASS');
}
