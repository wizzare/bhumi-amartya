import { chromium } from 'playwright';

async function test() {
  const browser = await chromium.launch({ headless: true });

  const BASE_URL = 'http://127.0.0.1:3000';
  const now = new Date('2026-10-21T05:00:00Z');

  async function createSession(u: any) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await page.addInitScript((data) => {
      localStorage.setItem('__BHUMI_MOCK_AUTH_USER__', JSON.stringify({
        uid: data.uid,
        email: data.email,
        displayName: data.displayName,
        photoURL: null,
        emailVerified: true,
        isAnonymous: false,
        metadata: { creationTime: new Date().toISOString(), lastSignInTime: new Date().toISOString() },
        providerData: [{ providerId: 'password', uid: data.uid, displayName: data.displayName, email: data.email, phoneNumber: null, photoURL: null }]
      }));
      const profile = { ...data, name: data.displayName, setupCompleted: true };
      const store = { users: { [data.uid]: profile }, blueprints: {}, testerBadgeRegistry: {} };
      localStorage.setItem('__BHUMI_MOCK_FIRESTORE_STORE__', JSON.stringify(store));
      localStorage.setItem('bhumiProfile:' + data.uid, JSON.stringify(profile));
    }, u);
    await page.route('**/api/access/bootstrap-trial*', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, outcome: 'ALREADY_PRESENT' }) }));
    return { context, page };
  }

  // UI-01
  {
    const u1 = { uid: 'user-free-01', email: 'free@build110.test', displayName: 'Pengguna Gratis', role: 'user', plan: 'free', tier: 'free' };
    const { context, page } = await createSession(u1);
    await page.goto(`${BASE_URL}/upgrade`);
    await page.waitForTimeout(2000);
    const uBody = await page.innerText('body');
    await page.goto(`${BASE_URL}/premium-bhumi`);
    await page.waitForTimeout(2000);
    const pBody = await page.innerText('body');
    console.log('UI-01:', {
      statusFree: uBody.includes('Free') || uBody.includes('Belum aktif'),
      hasPenghuni: pBody.includes('Penghuni Bhumi') || pBody.includes('Akses gratis'),
      noActiveSub: !pBody.includes('Akses premium aktif'),
    });
    await context.close();
  }

  // UI-02
  {
    const start = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const endsAt = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
    const u2 = {
      uid: 'user-trial-02',
      email: 'trial@build110.test',
      displayName: 'Pengguna Trial',
      role: 'user',
      badge: 'Penjaga Bhumi',
      membership: 'trial',
      membershipType: 'TRIAL',
      entitlementSource: 'server_access_bootstrap',
      trialStartedAt: start.toISOString(),
      trialEndsAt: endsAt.toISOString(),
      accessUntil: endsAt.toISOString(),
    };
    const { context, page } = await createSession(u2);
    await page.goto(`${BASE_URL}/premium-bhumi`);
    await page.waitForTimeout(2000);
    const body = await page.innerText('body');
    console.log('UI-02:', {
      trialActive: body.includes('Masa percobaan aktif') || body.includes('Trial'),
      daysPresent: body.includes('hari tersisa') || body.includes('5 hari') || body.includes('Akses hingga'),
      bodyExcerpt: body.slice(200, 500).replace(/\s+/g, ' ')
    });
    await context.close();
  }

  // UI-04
  {
    const expiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const u4 = {
      uid: 'user-paid-04',
      email: 'paid@build110.test',
      displayName: 'Pengguna Paid',
      role: 'user',
      entitlementSource: 'google_play',
      membershipType: 'PREMIUM',
      membershipExpiryDate: expiry.toISOString(),
      accessUntil: expiry.toISOString(),
    };
    const { context, page } = await createSession(u4);
    await page.goto(`${BASE_URL}/settings`);
    await page.waitForTimeout(2000);
    const sBody = await page.innerText('body');
    await page.goto(`${BASE_URL}/premium-bhumi`);
    await page.waitForTimeout(2000);
    const pBody = await page.innerText('body');
    console.log('UI-04:', {
      settingsPaid: sBody.includes('Paket Premium Aktif') || sBody.includes('Premium Bhumi'),
      premiumPaid: pBody.includes('Akses premium aktif') || pBody.includes('Premium Bhumi'),
      hasExpiry: pBody.includes('Akses hingga'),
      settingsExcerpt: sBody.slice(300, 600).replace(/\s+/g, ' '),
      premiumExcerpt: pBody.slice(200, 500).replace(/\s+/g, ' '),
    });
    await context.close();
  }

  await browser.close();
}

test().catch(console.error);
