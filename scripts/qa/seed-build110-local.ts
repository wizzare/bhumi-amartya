import { writeFileSync } from 'node:fs';

// Build 110 QA seed hardening: bump this whenever the HD calculation engine,
// fixture data, or seed shape changes. Prevents a pre-fix persisted blueprint
// from silently surviving a rerun and producing a false acceptance result.
const QA_SEED_VERSION = 'build110-qa-seed-v2-manifesting-generator-fix';

async function main() {
  if (process.env.NODE_ENV === 'production' || process.env.BHUMI_LOCAL_QA !== '1') throw new Error('BUILD110_LOCAL_QA_DISABLED');
  const project = 'demo-build110-local';
  Object.assign(process.env, {
    NEXT_PUBLIC_FIREBASE_API_KEY: 'synthetic-build110-key', NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: '127.0.0.1',
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: project, NEXT_PUBLIC_FIREBASE_EMULATOR_PROJECT_ID: project,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: `${project}.appspot.com`, NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: '123456789',
    NEXT_PUBLIC_FIREBASE_APP_ID: '1:123456789:web:synthetic-build110', NEXT_PUBLIC_USE_FIREBASE_EMULATORS: 'true',
    NEXT_PUBLIC_USE_AUTH_EMULATOR: 'true', NEXT_PUBLIC_USE_FIRESTORE_EMULATOR: 'true', NEXT_PUBLIC_USE_FUNCTIONS_EMULATOR: 'true',
    NEXT_PUBLIC_HUMAN_DESIGN_API_URL: 'http://127.0.0.1:18765/api/humandesign/calculate',
  });
  await import('./build110-local-network.mjs');
  const { generateBlueprint } = await import('../../lib/engines/generateBlueprint');
  const { normalizeBlueprint, omitAstrocartographyForPersistence } = await import('../../lib/repositories/blueprintRepository');
  const { sanitizeForFirestore } = await import('../../lib/firebase/sanitizeForFirestore');
  const { HD_ENGINE_VERSION } = await import('../../lib/humandesign/hdAudit');
  const encode = (value: any): any => {
    if (value == null) return { nullValue: null };
    if (value instanceof Date) return { timestampValue: value.toISOString() };
    if (typeof value.toDate === 'function') return { timestampValue: value.toDate().toISOString() };
    if (Array.isArray(value)) return { arrayValue: { values: value.map(encode) } };
    if (typeof value === 'object') return { mapValue: { fields: Object.fromEntries(Object.entries(value).filter(([,v]) => v !== undefined).map(([k,v]) => [k, encode(v)])) } };
    if (typeof value === 'number') return { doubleValue: value };
    if (typeof value === 'boolean') return { booleanValue: value };
    return { stringValue: String(value) };
  };
  async function write(path: string, value: any) {
    const response = await fetch(`http://127.0.0.1:8080/v1/projects/${project}/databases/(default)/documents/${path}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer owner' },
      body: JSON.stringify({ fields: encode(value).mapValue.fields }),
    });
    if (!response.ok) throw new Error(`LOCAL_FIXTURE_WRITE_FAILED_${response.status}: ${(await response.json()).error?.message}`);
  }
  for (const cohort of ['lama', 'baru']) {
    const email = `${cohort}@build110.test`;
    let response = await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=synthetic-build110-key', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'Build110-local-only!', returnSecureToken: true }),
    });
    if (!response.ok && (await response.json()).error?.message === 'EMAIL_EXISTS') {
      response = await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=synthetic-build110-key', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'Build110-local-only!', returnSecureToken: true }),
      });
    }
    if (!response.ok) throw new Error(`LOCAL_ACCOUNT_CREATE_FAILED_${response.status}`);
    const { localId: uid } = await response.json();
    const birth = { uid, fullName: 'Profil Contoh Lengkap', birthDate: '1985-05-03', birthTime: '23:46', birthCity: 'Jakarta', birthCountry: 'Indonesia', latitude: -6.2, longitude: 106.8, timezone: 'Asia/Jakarta' };
    const now = new Date();
    const until = new Date(now.getTime() + 30 * 86400000);

    // QA seed hardening: unconditionally delete any pre-existing blueprint doc
    // BEFORE regenerating. A stale pre-fix persisted result must never survive
    // a reseed and silently pass acceptance.
    await fetch(`http://127.0.0.1:8080/v1/projects/${project}/databases/(default)/documents/blueprints/${uid}`, {
      method: 'DELETE', headers: { Authorization: 'Bearer owner' }
    }).catch(() => {});

    await write(`users/${uid}`, {
      uid, email, displayName: 'Profil Contoh Lokal', fullName: 'Profil Contoh Lokal', language: 'id',
      ...(cohort === 'lama' ? birth : {}), setupCompleted: cohort === 'lama', blueprintStatus: cohort === 'lama' ? 'ready' : 'missing',
      role: 'user', guardianRole: 'user', membershipType: 'TRIAL', accessPhase: 'trial_active',
      trialStartedAt: now, trialEndsAt: until, accessUntil: until, createdAt: now, updatedAt: now,
      qaSeedVersion: QA_SEED_VERSION,
    });
    if (cohort === 'lama') {
      const originalLog = console.log;
      console.log = () => {};
      let blueprint;
      try { blueprint = await generateBlueprint(birth); } finally { console.log = originalLog; }
      const persisted = sanitizeForFirestore(omitAstrocartographyForPersistence(normalizeBlueprint(uid, blueprint)));
      await write(`blueprints/${uid}`, { ...persisted, qaSeedVersion: QA_SEED_VERSION });
      writeFileSync('output/build110-local/blueprint-fixture.json', JSON.stringify(blueprint));

      // Verify freshly-written engine version matches the CURRENT engine — a
      // pre-fix stale doc reused from an older seed run must fail loud here,
      // never pass silently.
      const readback = await fetch(`http://127.0.0.1:8080/v1/projects/${project}/databases/(default)/documents/blueprints/${uid}`, {
        headers: { Authorization: 'Bearer owner' },
      }).then((r) => r.json());
      const persistedEngineVersion = readback.fields?.humanDesign?.mapValue?.fields?.hdEngineVersion?.stringValue;
      if (persistedEngineVersion !== HD_ENGINE_VERSION) {
        throw new Error(`QA_SEED_STALE_HD_ENGINE_VERSION: expected ${HD_ENGINE_VERSION}, persisted doc has ${persistedEngineVersion}`);
      }
    }
  }
  console.log(`LOCAL_FIXTURE_ACCOUNTS=2; PRODUCTION_MUTATION=NO; QA_SEED_VERSION=${QA_SEED_VERSION}; HD_ENGINE_VERSION=${HD_ENGINE_VERSION}`);
}
main().then(() => process.exit(0)).catch(error => { console.error(error instanceof Error ? error.message : 'LOCAL_FIXTURE_FAILED'); process.exit(1); });
