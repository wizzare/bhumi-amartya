const QA_PROJECT_ID = 'bhumi-amartya-qa';
const QA_PACKAGE_NAME = 'com.bhumiamartya.app.qa';
const QA_MESSAGING_SENDER_ID = '125330899891';
const QA_APP_ID_PATTERN = /^1:125330899891:(android|web):[a-z0-9]+$/i;
const QA_GOOGLE_CLIENT_ID_PATTERN = /^125330899891-[a-z0-9]+\.apps\.googleusercontent\.com$/;
const QA_CLIENT_ID_ENV = 'NEXT_PUBLIC_QA_GOOGLE_WEB_CLIENT_ID';
const PRODUCTION_GOOGLE_CLIENT_ID = '59259824153-vldlev9s91l6sss3ulqbh8mnaah4n4c9.apps.googleusercontent.com';
const DEMO_PROJECT_PATTERN = /^demo-[a-z0-9-]+$/;
const LOOPBACK_HOSTS = new Set(['127.0.0.1', 'localhost', '[::1]', '::1']);
const PRODUCTION_URL_PATTERN = /(^|\.)vercel\.app$/i;

const invalid = () => { throw new Error('QA_CONFIGURATION_BLOCKED'); };
const runtimeBlocked = () => { throw new Error('QA_RUNTIME_DISABLED'); };

function parseLoopbackUrl(raw, { httpsOnly = false, requirePort = true, allowPath = false } = {}) {
  if (typeof raw !== 'string' || !raw.trim()) invalid();
  let url;
  try { url = new URL(raw); } catch { invalid(); }
  if (httpsOnly ? url.protocol !== 'https:' : !['http:', 'https:'].includes(url.protocol)) invalid();
  const authority = raw.replace(/^[a-z]+:\/\//i, '').split(/[/?#]/, 1)[0].split('@').pop();
  const rawHost = authority.startsWith('[')
    ? authority.slice(0, authority.indexOf(']') + 1)
    : authority.split(':')[0];
  if (!LOOPBACK_HOSTS.has(rawHost)) invalid();
  if (!LOOPBACK_HOSTS.has(url.hostname)) invalid();
  if (PRODUCTION_URL_PATTERN.test(url.hostname)) invalid();
  if (url.username || url.password) invalid();
  if (requirePort && !url.port) invalid();
  if (!allowPath && url.pathname !== '/') invalid();
  if (allowPath && url.pathname.includes('..')) invalid();
  if (url.search || url.hash) invalid();
  return url;
}

function parseEmulatorEndpoint(raw) {
  const url = parseLoopbackUrl(raw);
  if (url.protocol !== 'http:') invalid();
  return { origin: url.origin, host: url.host };
}

function parseLoopbackHostPort(raw) {
  if (typeof raw !== 'string' || !raw.trim() || raw.includes('://') || /[/?#@]/.test(raw)) invalid();
  let url;
  try { url = new URL(`http://${raw}`); } catch { invalid(); }
  if (url.protocol !== 'http:' || !LOOPBACK_HOSTS.has(url.hostname) || !url.port || url.pathname !== '/' || url.search || url.hash) invalid();
  return url;
}

function assertSafeOptionalHttps(raw) {
  const url = parseLoopbackUrl(raw, { httpsOnly: true, allowPath: true });
  if (url.origin !== raw.replace(/\/+$/, '')) {
    if (!raw.startsWith(url.origin) || url.pathname === '/') invalid();
  }
  return raw;
}

function assertNotProductionString(value) {
  if (typeof value !== 'string' || !value.trim()) invalid();
  if (/bhumiamartya-fe85c/i.test(value)) invalid();
  if (PRODUCTION_URL_PATTERN.test(value)) invalid();
  if (value === PRODUCTION_GOOGLE_CLIENT_ID) invalid();
  return value;
}

function validateEmulatorConfig(config, inherited) {
  const project = config.projectId;
  if (typeof project !== 'string' || !DEMO_PROJECT_PATTERN.test(project)) invalid();
  if (config.packageName !== QA_PACKAGE_NAME || config.billing !== 'disabled') invalid();
  for (const identity of [config.native, config.web, config.backend]) {
    if (!identity || identity.projectId !== project) invalid();
  }
  if (typeof config.native.appId !== 'string' || !config.native.appId.startsWith('synthetic-') || typeof config.web.appId !== 'string' || !config.web.appId.startsWith('synthetic-') || config.backend.tokenAudience !== project || config.backend.tokenIssuer !== `https://securetoken.google.com/${project}`) invalid();
  if (config.oauth !== 'disabled' || config.storage !== 'disabled' || config.aura !== 'disabled') invalid();
  for (const key of ['auth', 'firestore', 'functions', 'bootstrap']) {
    const endpoint = parseEmulatorEndpoint(config.origins?.[key]);
    if (config.emulatorHosts?.[key] !== endpoint.host) invalid();
  }
  const allowed = {
    NEXT_PUBLIC_QA_MODE: 'emulator',
    BHUMI_QA_MODE: 'emulator',
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: project,
    NEXT_PUBLIC_FIREBASE_EMULATOR_PROJECT_ID: project,
    FIREBASE_PROJECT_ID: project,
    GCLOUD_PROJECT: project,
    BHUMI_TEST_PROJECT_ID: project,
    FIREBASE_AUTH_EMULATOR_HOST: config.emulatorHosts.auth,
    FIRESTORE_EMULATOR_HOST: config.emulatorHosts.firestore,
    FIREBASE_FUNCTIONS_EMULATOR_HOST: config.emulatorHosts.functions,
  };
  for (const [key, value] of Object.entries(inherited)) {
    if (!value) continue;
    if (isSensitiveEnvKey(key) && allowed[key] !== value) invalid();
  }
  return Object.freeze({ status: 'ELIGIBLE_FOR_FURTHER_VERIFICATION_ONLY', runtimeAllowed: false });
}

function validateRealQaConfig(config, inherited) {
  if (config.projectId !== QA_PROJECT_ID || config.firestoreProjectId !== config.backend?.firestoreProjectId || typeof config.firestoreProjectId !== 'string' || !DEMO_PROJECT_PATTERN.test(config.firestoreProjectId)) invalid();
  if (config.packageName !== QA_PACKAGE_NAME || config.billing !== 'disabled' || config.oauth !== 'google' || config.storage !== 'disabled' || config.aura !== 'disabled') invalid();
  for (const identity of [config.native, config.web, config.backend]) {
    if (!identity || identity.projectId !== QA_PROJECT_ID) invalid();
  }
  if (!QA_APP_ID_PATTERN.test(config.native.appId) || !config.native.appId.endsWith(':android') && !config.native.appId.includes(':android:')) invalid();
  if (!QA_APP_ID_PATTERN.test(config.web.appId) || !config.web.appId.includes(':web:')) invalid();
  if (config.backend.tokenAudience !== QA_PROJECT_ID || config.backend.tokenIssuer !== `https://securetoken.google.com/${QA_PROJECT_ID}`) invalid();
  if (config.backend.projectId === config.firestoreProjectId) invalid();

  const firestore = parseEmulatorEndpoint(config.origins?.firestore);
  const bootstrap = parseLoopbackUrl(config.origins?.bootstrap, { httpsOnly: true });
  if (config.origins?.auth !== undefined || config.origins?.functions !== undefined) invalid();
  if (config.emulatorHosts?.firestore !== firestore.host || config.emulatorHosts?.bootstrap !== bootstrap.host) invalid();
  if (config.emulatorHosts?.auth !== undefined || config.emulatorHosts?.functions !== undefined) invalid();

  const allowed = {
    NEXT_PUBLIC_QA_MODE: 'realQA',
    BHUMI_QA_MODE: 'realQA',
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: QA_PROJECT_ID,
    NEXT_PUBLIC_QA_ANDROID_PACKAGE: QA_PACKAGE_NAME,
    NEXT_PUBLIC_QA_FIRESTORE_PROJECT_ID: config.firestoreProjectId,
    NEXT_PUBLIC_USE_FIREBASE_EMULATORS: 'false',
    NEXT_PUBLIC_USE_AUTH_EMULATOR: 'false',
    NEXT_PUBLIC_USE_FIRESTORE_EMULATOR: 'true',
    NEXT_PUBLIC_USE_FUNCTIONS_EMULATOR: 'false',
    NEXT_PUBLIC_FIREBASE_EMULATOR_HOST: '127.0.0.1',
    NEXT_PUBLIC_BILLING_VERIFIER_URL: config.origins.bootstrap,
    FIRESTORE_EMULATOR_HOST: config.emulatorHosts.firestore,
    FIREBASE_PROJECT_ID: config.firestoreProjectId,
    GCLOUD_PROJECT: config.firestoreProjectId,
    GOOGLE_CLOUD_PROJECT: config.firestoreProjectId,
    BHUMI_TEST_PROJECT_ID: config.firestoreProjectId,
    NEXT_PUBLIC_ENABLE_ADMIN_UI: 'false',
    ENABLE_QA_LOGIN: 'false',
    NEXT_PUBLIC_ENABLE_EMULATOR_QA_LOGIN: 'false',
    NEXT_PUBLIC_ENABLE_ANDROID_EMULATOR_QA_LOGIN: 'false',
    NEXT_PUBLIC_ENABLE_FOUNDER_PRE_RELEASE_QA: 'false',
    NEXT_PUBLIC_APP_EDITION: 'standard',
  };

  for (const [key, value] of Object.entries(inherited)) {
    if (!value) continue;
    if (key === 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN') {
      if (value !== `${QA_PROJECT_ID}.firebaseapp.com`) invalid();
      continue;
    }
    if (key === 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET') {
      if (![`${QA_PROJECT_ID}.firebasestorage.app`, `${QA_PROJECT_ID}.appspot.com`].includes(value)) invalid();
      continue;
    }
    if (key === 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID') {
      if (value !== QA_MESSAGING_SENDER_ID) invalid();
      continue;
    }
    if (key === 'NEXT_PUBLIC_FIREBASE_APP_ID') {
      if (!QA_APP_ID_PATTERN.test(value) || !value.includes(':web:')) invalid();
      continue;
    }
    if (key === 'NEXT_PUBLIC_FIREBASE_API_KEY') {
      if (!assertNotProductionString(value)) invalid();
      continue;
    }
    if (key === QA_CLIENT_ID_ENV) {
      if (value === PRODUCTION_GOOGLE_CLIENT_ID || !QA_GOOGLE_CLIENT_ID_PATTERN.test(value)) invalid();
      continue;
    }
    if (key === 'NEXT_PUBLIC_HUMAN_DESIGN_API_URL' || key === 'NEXT_PUBLIC_ASTROLOGY_API_URL') {
      assertSafeOptionalHttps(value);
      continue;
    }
    if (key === 'NEXT_PUBLIC_WEB_APP_URL') {
      assertSafeOptionalHttps(value);
      if (value.replace(/\/+$/, '') !== config.origins.bootstrap) invalid();
      continue;
    }
    if (key === 'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID') {
      if (!/^G-[A-Z0-9]+$/i.test(value)) invalid();
      continue;
    }
    if (key === 'FIREBASE_AUTH_EMULATOR_HOST' || key === 'FIREBASE_FUNCTIONS_EMULATOR_HOST' || key === 'FIREBASE_CONFIG') invalid();
    if (allowed[key] !== undefined) {
      if (allowed[key] !== value) invalid();
      continue;
    }
    if (isSensitiveEnvKey(key)) invalid();
  }

  return Object.freeze({ status: 'READY_FOR_LOCAL_QA', runtimeAllowed: true });
}

function isSensitiveEnvKey(key) {
  return /^NEXT_PUBLIC_/i.test(key)
    || /FIREBASE|FIRESTORE|GOOGLE|GCLOUD|BILLING|OAUTH|CREDENTIAL|TOKEN|SECRET|PRIVATE_KEY|PROXY|NODE_OPTIONS|VERCEL/i.test(key);
}

export function validateQaConfig(config, inherited = {}) {
  if (!config || !['emulator', 'realQA'].includes(config.mode)) invalid();
  return config.mode === 'realQA'
    ? validateRealQaConfig(config, inherited)
    : validateEmulatorConfig(config, inherited);
}

export function assertQaRuntimeDisabled(mode, candidate) {
  if (mode !== undefined || candidate !== undefined) throw new Error('QA_RUNTIME_DISABLED');
}

export function assertQaRuntimeAllowed(env = {}) {
  const hasSignal = [
    'NEXT_PUBLIC_QA_MODE',
    'NEXT_PUBLIC_QA_CANDIDATE',
    'BHUMI_QA_MODE',
    'BHUMI_QA_CONFIG',
    'NEXT_PUBLIC_QA_FIRESTORE_PROJECT_ID',
    'NEXT_PUBLIC_QA_ANDROID_PACKAGE',
    QA_CLIENT_ID_ENV,
  ].some((key) => env[key] !== undefined)
    || ['FIRESTORE_EMULATOR_HOST', 'FIREBASE_AUTH_EMULATOR_HOST', 'FIREBASE_FUNCTIONS_EMULATOR_HOST'].some((key) => Boolean(env[key]))
    || env.BHUMI_LOCAL_QA === '1'
    || ['NEXT_PUBLIC_USE_FIREBASE_EMULATORS', 'NEXT_PUBLIC_USE_AUTH_EMULATOR', 'NEXT_PUBLIC_USE_FIRESTORE_EMULATOR', 'NEXT_PUBLIC_USE_FUNCTIONS_EMULATOR', 'NEXT_PUBLIC_ENABLE_EMULATOR_QA_LOGIN', 'NEXT_PUBLIC_ENABLE_FOUNDER_PRE_RELEASE_QA', 'NEXT_PUBLIC_ENABLE_ANDROID_EMULATOR_QA_LOGIN'].some((key) => env[key] === 'true');

  if (!hasSignal && env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== QA_PROJECT_ID) {
    return Object.freeze({ mode: 'production', runtimeAllowed: false });
  }

  if (env.NEXT_PUBLIC_QA_MODE !== 'realQA' || env.BHUMI_QA_MODE !== 'realQA') runtimeBlocked();
  if (env.NEXT_PUBLIC_QA_CANDIDATE !== undefined || env.BHUMI_LOCAL_QA === '1') runtimeBlocked();
  if (env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== QA_PROJECT_ID) runtimeBlocked();
  if (env.NEXT_PUBLIC_QA_ANDROID_PACKAGE !== QA_PACKAGE_NAME) runtimeBlocked();
  if (!DEMO_PROJECT_PATTERN.test(env.NEXT_PUBLIC_QA_FIRESTORE_PROJECT_ID || '')) runtimeBlocked();
  if (env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS !== undefined && env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS !== 'false') runtimeBlocked();
  if (env.NEXT_PUBLIC_USE_AUTH_EMULATOR !== 'false') runtimeBlocked();
  if (env.NEXT_PUBLIC_USE_FIRESTORE_EMULATOR !== 'true') runtimeBlocked();
  if (env.NEXT_PUBLIC_USE_FUNCTIONS_EMULATOR !== 'false') runtimeBlocked();
  if (env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST !== '127.0.0.1') runtimeBlocked();
  if (env.FIREBASE_AUTH_EMULATOR_HOST || env.FIREBASE_FUNCTIONS_EMULATOR_HOST) runtimeBlocked();
  if (env.FIRESTORE_EMULATOR_HOST !== undefined) parseLoopbackHostPort(env.FIRESTORE_EMULATOR_HOST);
  if (!env.NEXT_PUBLIC_FIREBASE_API_KEY || !env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || !env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || !env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || !env.NEXT_PUBLIC_FIREBASE_APP_ID) runtimeBlocked();
  if (env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN !== `${QA_PROJECT_ID}.firebaseapp.com`) runtimeBlocked();
  if (![`${QA_PROJECT_ID}.firebasestorage.app`, `${QA_PROJECT_ID}.appspot.com`].includes(env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET)) runtimeBlocked();
  if (env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID !== QA_MESSAGING_SENDER_ID) runtimeBlocked();
  if (!QA_APP_ID_PATTERN.test(env.NEXT_PUBLIC_FIREBASE_APP_ID) || !env.NEXT_PUBLIC_FIREBASE_APP_ID.includes(':web:')) runtimeBlocked();
  if (env[QA_CLIENT_ID_ENV] === PRODUCTION_GOOGLE_CLIENT_ID || !QA_GOOGLE_CLIENT_ID_PATTERN.test(env[QA_CLIENT_ID_ENV] || '')) runtimeBlocked();
  assertSafeOptionalHttps(env.NEXT_PUBLIC_BILLING_VERIFIER_URL);
  const bootstrap = parseLoopbackUrl(env.NEXT_PUBLIC_BILLING_VERIFIER_URL, { httpsOnly: true });
  if (bootstrap.pathname !== '/') runtimeBlocked();
  assertSafeOptionalHttps(env.NEXT_PUBLIC_HUMAN_DESIGN_API_URL);
  assertSafeOptionalHttps(env.NEXT_PUBLIC_ASTROLOGY_API_URL);
  assertSafeOptionalHttps(env.NEXT_PUBLIC_WEB_APP_URL);
  const webApp = parseLoopbackUrl(env.NEXT_PUBLIC_WEB_APP_URL, { httpsOnly: true });
  if (webApp.pathname !== '/' || webApp.origin !== bootstrap.origin) runtimeBlocked();
  if (env.NEXT_PUBLIC_ENABLE_EMULATOR_QA_LOGIN === 'true' || env.NEXT_PUBLIC_ENABLE_FOUNDER_PRE_RELEASE_QA === 'true') runtimeBlocked();

  return Object.freeze({
    mode: 'realQA',
    runtimeAllowed: true,
    authProjectId: QA_PROJECT_ID,
    firestoreProjectId: env.NEXT_PUBLIC_QA_FIRESTORE_PROJECT_ID,
    packageName: QA_PACKAGE_NAME,
  });
}

export function assertQaStagingAllowed(env) {
  if (env.NEXT_PUBLIC_QA_MODE !== 'realQA' || env.BHUMI_QA_MODE !== 'realQA') invalid();
  let config;
  try { config = JSON.parse(env.BHUMI_QA_CONFIG || ''); } catch { invalid(); }
  validateQaConfig(config, Object.fromEntries(Object.entries(env).filter(([key]) => key !== 'BHUMI_QA_CONFIG')));
  assertQaRuntimeAllowed(env);
  return Object.freeze(config);
}

export function assertQaEndpoint(raw) {
  return assertSafeOptionalHttps(raw);
}

export { QA_PROJECT_ID, QA_PACKAGE_NAME };
