import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { assertQaEndpoint, validateQaConfig, assertQaRuntimeDisabled, assertQaRuntimeAllowed, assertQaStagingAllowed } from '../../lib/config/qaConfig.mjs';
let assertions = 0;
const check = (value) => { assert.ok(value); assertions++; };
const deny = (fn) => { assert.throws(fn, /QA_(CONFIGURATION_BLOCKED|RUNTIME_DISABLED|STAGING_DISABLED)/); assertions++; };
const fixture = () => ({ mode: 'emulator', projectId: 'demo-qa-isolation', packageName: 'com.bhumiamartya.app.qa', billing: 'disabled', native: { projectId: 'demo-qa-isolation', appId: 'synthetic-native' }, web: { projectId: 'demo-qa-isolation', appId: 'synthetic-web' }, backend: { projectId: 'demo-qa-isolation', tokenAudience: 'demo-qa-isolation', tokenIssuer: 'https://securetoken.google.com/demo-qa-isolation' }, oauth: 'disabled', storage: 'disabled', aura: 'disabled', origins: { auth: 'http://127.0.0.1:9099', firestore: 'http://127.0.0.1:8080', functions: 'http://127.0.0.1:5001', bootstrap: 'http://127.0.0.1:3000' }, emulatorHosts: { auth: '127.0.0.1:9099', firestore: '127.0.0.1:8080', functions: '127.0.0.1:5001', bootstrap: '127.0.0.1:3000' } });
const qaFixture = () => ({ mode: 'realQA', projectId: 'bhumi-amartya-qa', firestoreProjectId: 'demo-bhumi-qa-bootstrap', packageName: 'com.bhumiamartya.app.qa', billing: 'disabled', native: { projectId: 'bhumi-amartya-qa', appId: '1:125330899891:android:abc123' }, web: { projectId: 'bhumi-amartya-qa', appId: '1:125330899891:web:abc123' }, backend: { projectId: 'bhumi-amartya-qa', firestoreProjectId: 'demo-bhumi-qa-bootstrap', tokenAudience: 'bhumi-amartya-qa', tokenIssuer: 'https://securetoken.google.com/bhumi-amartya-qa' }, oauth: 'google', storage: 'disabled', aura: 'disabled', origins: { firestore: 'http://127.0.0.1:8080', bootstrap: 'https://localhost:8443' }, emulatorHosts: { firestore: '127.0.0.1:8080', bootstrap: 'localhost:8443' } });
const qaEnv = () => ({ NEXT_PUBLIC_QA_MODE: 'realQA', BHUMI_QA_MODE: 'realQA', NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'bhumi-amartya-qa', NEXT_PUBLIC_QA_ANDROID_PACKAGE: 'com.bhumiamartya.app.qa', NEXT_PUBLIC_QA_FIRESTORE_PROJECT_ID: 'demo-bhumi-qa-bootstrap', NEXT_PUBLIC_USE_FIREBASE_EMULATORS: 'false', NEXT_PUBLIC_USE_AUTH_EMULATOR: 'false', NEXT_PUBLIC_USE_FIRESTORE_EMULATOR: 'true', NEXT_PUBLIC_USE_FUNCTIONS_EMULATOR: 'false', NEXT_PUBLIC_FIREBASE_EMULATOR_HOST: '127.0.0.1', FIRESTORE_EMULATOR_HOST: '127.0.0.1:8080', NEXT_PUBLIC_FIREBASE_API_KEY: 'synthetic-qa-key', NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'bhumi-amartya-qa.firebaseapp.com', NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'bhumi-amartya-qa.firebasestorage.app', NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: '125330899891', NEXT_PUBLIC_FIREBASE_APP_ID: '1:125330899891:web:abc123', NEXT_PUBLIC_QA_GOOGLE_WEB_CLIENT_ID: '125330899891-abc.apps.googleusercontent.com', NEXT_PUBLIC_BILLING_VERIFIER_URL: 'https://localhost:8443', NEXT_PUBLIC_HUMAN_DESIGN_API_URL: 'https://localhost:8443/api/humandesign/calculate', NEXT_PUBLIC_ASTROLOGY_API_URL: 'https://localhost:8443/api/humandesign/astrology', NEXT_PUBLIC_WEB_APP_URL: 'https://localhost:8443' });
check(validateQaConfig(fixture()).runtimeAllowed === false);
check(validateQaConfig(fixture()).status === 'ELIGIBLE_FOR_FURTHER_VERIFICATION_ONLY');
check(validateQaConfig(qaFixture(), qaEnv()).runtimeAllowed === true);
check(assertQaRuntimeAllowed(qaEnv()).mode === 'realQA');
check(assertQaRuntimeAllowed({ ...qaEnv(), BHUMI_LOCAL_QA: '0' }).mode === 'realQA');
deny(() => validateQaConfig());
for (const mutate of [c => c.mode = 'realQA', c => c.native.projectId = 'other', c => c.projectId = 'bhumiamartya-fe85c', c => c.oauth = { verified: true, allowlist: ['unknown'] }, c => c.billing = 'enabled', c => delete c.emulatorHosts, c => c.backend.tokenAudience = 'other']) {
  const c = fixture(); mutate(c); deny(() => validateQaConfig(c));
}
for (const key of ['auth', 'firestore', 'functions', 'bootstrap']) {
  for (const url of ['https://bhumi-billing-verifier.vercel.app', 'https://firestore.googleapis.com', 'http://localhost.evil:8080', 'http://user:pass@localhost:8080', 'http://127.0.0.1:8080/path', 'http://2130706433:8080', 'http://localhost:8080?x=1']) {
    const c = fixture(); c.origins[key] = url; deny(() => validateQaConfig(c));
  }
}
for (const env of [{ NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'bhumiamartya-fe85c' }, { GOOGLE_APPLICATION_CREDENTIALS: 'synthetic-path' }, { NEXT_PUBLIC_USE_AUTH_EMULATOR: 'false' }, { HTTPS_PROXY: 'http://localhost:9999' }, { NEXT_PUBLIC_WEB_APP_URL: 'https://unknown.invalid' }]) deny(() => validateQaConfig(fixture(), env));
for (const env of [{}, { NEXT_PUBLIC_QA_MODE: 'false' }, { NEXT_PUBLIC_QA_MODE: 'emulator', BHUMI_QA_MODE: 'emulator', BHUMI_QA_CONFIG: JSON.stringify(fixture()) }]) deny(() => assertQaStagingAllowed(env));
check(assertQaStagingAllowed({ ...qaEnv(), BHUMI_QA_CONFIG: JSON.stringify(qaFixture()) }).mode === 'realQA');
assertQaRuntimeDisabled(undefined, undefined); assertions++;
for (const mode of ['', 'false', 'production', 'emulator', 'realQA']) deny(() => assertQaRuntimeDisabled(mode));
let calls = 0;
const protectedCall = () => { calls++; throw new Error('PROTECTED_CALLBACK_CALLED'); };
const guard = () => assertQaRuntimeDisabled('emulator');
function load(file, mocks = {}, env = {}, operationGuard = guard) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  vm.runInNewContext(code, { exports, process: { env }, console: { error() {}, log() {}, info() {} }, fetch: protectedCall, URL, Headers, require(name) {
    if (name.includes('qaRuntime')) return { assertQaOperationAllowed: operationGuard };
    if (name in mocks) return mocks[name];
    if (name.includes('qaConfig')) return { assertQaEndpoint, assertQaRuntimeAllowed };
    return new Proxy({}, { get: () => protectedCall });
  } });
  return exports;
}
deny(() => load('lib/firebase/config.ts'));
let initializedApp = null;
let authApp = null;
let firestoreApp = null;
const firebaseMocks = {
  'firebase/app': {
    getApps: () => [],
    getApp: () => initializedApp,
    initializeApp: (config) => {
      initializedApp = { name: '[DEFAULT]', options: config };
      return initializedApp;
    },
  },
  'firebase/auth': { getAuth: (app) => { authApp = app; return { app }; } },
  'firebase/firestore': { getFirestore: (app) => { firestoreApp = app; return { app }; } },
  'firebase/functions': { getFunctions: () => ({}) },
  './emulatorConfig': {
    assertFirestoreEmulatorWired: () => {},
    connectEmulators: () => {},
    connectFunctionsEmulatorOnce: () => {},
    getFirebaseEmulatorEndpoints: () => ({ firestore: { url: 'http://127.0.0.1:8080' } }),
    shouldUseFirebaseEmulators: () => false,
    shouldUseFirestoreEmulator: () => true,
    shouldUseFunctionsEmulator: () => false,
  },
  './qaRuntime': { assertQaOperationAllowed: () => {} },
};
load('lib/firebase/config.ts', firebaseMocks, qaEnv(), () => {});
check(initializedApp?.options?.projectId === 'demo-bhumi-qa-bootstrap');
check(initializedApp?.options?.authDomain === 'bhumi-amartya-qa.firebaseapp.com');
check(authApp === initializedApp && firestoreApp === initializedApp);
const bootstrap = load('lib/billing/canonicalAccessBootstrap.ts');
await assert.rejects(bootstrap.bootstrapCanonicalAccess('synthetic-user', protectedCall, protectedCall), /QA_RUNTIME_DISABLED/); assertions++;
const admin = load('services/billing-verifier/lib/firebaseAdmin.ts');
deny(() => admin.getBhumiAdminApp());
deny(() => admin.getBhumiAdminCredential());
for (const file of ['lib/config/hdApiUrl.ts', 'lib/config/astrologyApiUrl.ts']) deny(() => load(file));
deny(() => load('lib/config/dailyGuidanceApiUrl.ts').getDailyGuidanceApiUrl());
const billingSource = fs.readFileSync('lib/billing/googlePlayBilling.ts', 'utf8');
const helper = billingSource.slice(billingSource.indexOf('function assertQaBillingAllowed'), billingSource.indexOf('export const GOOGLE_PLAY_PRODUCT_ID'));
const wrapper = helper + billingSource.slice(billingSource.indexOf('const BhumiBilling: BillingPlugin'), billingSource.indexOf('const AppPlugin'));
const js = ts.transpileModule(wrapper + '\nexports.billing = BhumiBilling;', { compilerOptions: { target: ts.ScriptTarget.ES2020 } }).outputText;
const exports = {};
vm.runInNewContext(js, { exports, process: { env: {} }, assertQaOperationAllowed: guard, nativeBilling: new Proxy({}, { get: () => protectedCall }) });
for (const method of ['initialize', 'queryPremiumSubscription', 'purchasePremium', 'restorePurchases', 'addListener']) deny(() => exports.billing[method]());
const runner = fs.readFileSync('scripts/run-mobile-staging-build.mjs', 'utf8');
check(runner.indexOf('assertQaStagingAllowed(process.env)') < runner.indexOf('const stagingDir = createStagingDirectory()'));
for (const file of ['app/api/access/bootstrap-trial/route.ts', 'app/api/kenali-diri/aura/route.ts']) {
  const route = load(file, { 'next/server': { NextResponse: { json: (body, init) => ({ body, status: init.status }) } } });
  const response = await route.POST({ headers: new Headers(), json: protectedCall });
  check(response.status >= 400);
}
const authSource = fs.readFileSync('lib/auth/authActions.ts', 'utf8');
const signIn = authSource.slice(authSource.indexOf('export const signInWithGoogle'), authSource.indexOf('  const isNative', authSource.indexOf('export const signInWithGoogle')));
const authJs = ts.transpileModule(signIn + 'protectedCall(); };', { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const authExports = {};
vm.runInNewContext(authJs, { exports: authExports, assertQaOperationAllowed: guard, protectedCall });
await assert.rejects(authExports.signInWithGoogle(), /QA_RUNTIME_DISABLED/); assertions++;
const runtime = (env) => load('lib/config/qaRuntime.ts', { './qaConfig.mjs': { assertQaRuntimeAllowed } }, env).assertQaOperationAllowed;
const selectors = [
  ...['NEXT_PUBLIC_QA_MODE', 'NEXT_PUBLIC_QA_CANDIDATE', 'BHUMI_QA_MODE', 'BHUMI_QA_CONFIG'].flatMap(key => ['', 'false', 'production', 'realQA', 'emulator'].map(value => ({ [key]: value }))),
  { BHUMI_LOCAL_QA: '1' },
  ...['NEXT_PUBLIC_USE_FIREBASE_EMULATORS', 'NEXT_PUBLIC_USE_AUTH_EMULATOR', 'NEXT_PUBLIC_USE_FIRESTORE_EMULATOR', 'NEXT_PUBLIC_USE_FUNCTIONS_EMULATOR', 'NEXT_PUBLIC_ENABLE_EMULATOR_QA_LOGIN', 'NEXT_PUBLIC_ENABLE_FOUNDER_PRE_RELEASE_QA'].map(key => ({ [key]: 'true' })),
  ...['FIREBASE_AUTH_EMULATOR_HOST', 'FIRESTORE_EMULATOR_HOST', 'FIREBASE_FUNCTIONS_EMULATOR_HOST'].map(key => ({ [key]: 'unknown.invalid:9099' })),
  { NEXT_PUBLIC_USE_AUTH_EMULATOR: 'true', NEXT_PUBLIC_USE_FIRESTORE_EMULATOR: 'false' },
];
const billingMocks = {
  '@capacitor/core': { registerPlugin: () => new Proxy({}, { get: () => protectedCall }), Capacitor: { getPlatform: () => 'android', isNativePlatform: () => true } },
  '@/lib/firebase/firebase': { auth: { get currentUser() { return protectedCall(); } } },
  '@capacitor/preferences': { Preferences: new Proxy({}, { get: () => protectedCall }) },
};
for (const env of selectors) {
  const actualGuard = runtime(env);
  deny(actualGuard);
  deny(() => load('lib/firebase/config.ts', {}, env, actualGuard));
  const actualBootstrap = load('lib/billing/canonicalAccessBootstrap.ts', {}, env, actualGuard);
  await assert.rejects(actualBootstrap.bootstrapCanonicalAccess('synthetic-user', protectedCall, protectedCall), /QA_RUNTIME_DISABLED/); assertions++;
  const authModule = load('lib/auth/authActions.ts', {}, env, actualGuard);
  await assert.rejects(authModule.signInWithGoogle(), /QA_RUNTIME_DISABLED/); assertions++;
  const billing = load('lib/billing/googlePlayBilling.ts', billingMocks, env, actualGuard);
  for (const [method, args] of [
    ['processAndVerifyPurchaseToken', [{}]], ['verifyGooglePlayPurchase', [{}]],
    ['recoverAndRefreshGooglePlayPurchases', [[], protectedCall]],
    ['purchaseAndRecoverPremium', [protectedCall]], ['restoreAndRecoverPremium', [protectedCall]],
    ['autoRecoverActiveSubscriptions', []], ['initializeGooglePlayBilling', []],
    ['queryPremiumSubscription', []], ['purchasePremiumSubscription', []], ['restorePremiumPurchases', []],
  ]) {
    await assert.rejects(billing[method](...args), /QA_RUNTIME_DISABLED/); assertions++;
  }
}
const realQaGuard = runtime(qaEnv());
realQaGuard(); assertions++;
const realQaBilling = load('lib/billing/googlePlayBilling.ts', billingMocks, qaEnv(), realQaGuard);
for (const [method, args] of [
  ['processAndVerifyPurchaseToken', [{}]], ['verifyGooglePlayPurchase', [{}]],
  ['recoverAndRefreshGooglePlayPurchases', [[], protectedCall]],
  ['purchaseAndRecoverPremium', [protectedCall]], ['restoreAndRecoverPremium', [protectedCall]],
  ['autoRecoverActiveSubscriptions', []], ['initializeGooglePlayBilling', []],
  ['queryPremiumSubscription', []], ['purchasePremiumSubscription', []], ['restorePremiumPurchases', []],
]) {
  await assert.rejects(realQaBilling[method](...args), /QA_BILLING_DISABLED/); assertions++;
}
for (const env of [{}, { NEXT_PUBLIC_ENABLE_ADMIN_UI: 'true' }, { BHUMI_LOCAL_QA: '0', NEXT_PUBLIC_USE_FIREBASE_EMULATORS: 'false', NEXT_PUBLIC_USE_AUTH_EMULATOR: 'false', NEXT_PUBLIC_USE_FIRESTORE_EMULATOR: 'false', NEXT_PUBLIC_USE_FUNCTIONS_EMULATOR: 'false', NEXT_PUBLIC_ENABLE_FOUNDER_PRE_RELEASE_QA: 'false' }]) {
  const actualGuard = runtime(env);
  actualGuard(); assertions++;
  const billing = load('lib/billing/googlePlayBilling.ts', billingMocks, env, actualGuard);
  check((await billing.processAndVerifyPurchaseToken({ products: [billing.GOOGLE_PLAY_PRODUCT_ID], purchaseToken: 'synthetic', purchaseState: 2 })).status === 'SUBSCRIPTION_PENDING');
  await assert.rejects(billing.verifyGooglePlayPurchase({ products: [] }), /PRODUCT_MISMATCH/); assertions++;
}
const hdModule = load('lib/config/hdApiUrl.ts', { '@capacitor/core': { Capacitor: { isNativePlatform: () => true } } }, qaEnv(), realQaGuard);
check(hdModule.getHdApiUrl() === 'https://localhost:8443/api/humandesign/calculate');
assert.throws(() => hdModule.getHdApiUrl({ envUrl: 'https://bhumi-human-design-api.vercel.app/calculate' }), /QA_CONFIGURATION_BLOCKED/); assertions++;
assert.throws(() => hdModule.getHdApiUrl({ envUrl: 'https://evil.example.com/api' }), /QA_CONFIGURATION_BLOCKED/); assertions++;

const astroModule = load('lib/config/astrologyApiUrl.ts', { '@capacitor/core': { Capacitor: { isNativePlatform: () => true } } }, qaEnv(), realQaGuard);
check(astroModule.getAstrologyApiUrl() === 'https://localhost:8443/api/humandesign/astrology');
assert.throws(() => astroModule.getAstrologyApiUrl({ envUrl: 'https://bhumi-amartya-clean.vercel.app/api' }), /QA_CONFIGURATION_BLOCKED/); assertions++;

const guidanceModule = load('lib/config/dailyGuidanceApiUrl.ts', { '@capacitor/core': { Capacitor: { isNativePlatform: () => true } } }, qaEnv(), realQaGuard);
check(guidanceModule.getDailyGuidanceApiUrl({ isNative: true }) === 'https://localhost:8443/api/ai/daily-guidance');
assert.throws(() => guidanceModule.getDailyGuidanceApiUrl({ isNative: true, webAppUrl: 'https://bhumi-amartya-clean.vercel.app' }), /QA_CONFIGURATION_BLOCKED/); assertions++;

const bootstrapModule = load('lib/billing/canonicalAccessBootstrap.ts', { '@capacitor/core': { Capacitor: { isNativePlatform: () => true } } }, qaEnv(), realQaGuard);
check(bootstrapModule.verifierUrl() === 'https://localhost:8443/api/access/bootstrap-trial');

check(calls === 0);
console.log(`PASS ${assertions} assertions; protected callback/fetch/plugin invocations=${calls}; synthetic only`);
