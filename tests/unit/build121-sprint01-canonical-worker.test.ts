/**
 * Bhumi Amartya — Build 121 Sprint 121-01: Cloudflare Canonical Worker Unit Test Suite
 * Invariant verification:
 * 1. Client Integration (Setup, Settings, userRepository)
 * 2. Auth Security (Firebase ID Token, UID Isolation, Revocation, Expiry)
 * 3. Firestore REST Transactions (Atomicity, Revision Conflict, Idempotency)
 * 4. Fail-Closed Error Handling & Secrets Protection
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { stripCanonicalServerMetadata, stripClientBirthWrites } from '../../lib/profile/canonicalBirthFields';
import { extractCanonicalRevision } from '../../lib/profile/canonicalBirthFields';

test('SPRINT-121-01: Client Integration — Setup, Settings, and Repository layer invariants', () => {
  const setupSource = fs.readFileSync(path.resolve('app/setup/page.tsx'), 'utf8');
  const settingsSource = fs.readFileSync(path.resolve('app/settings/page.tsx'), 'utf8');
  const userRepoSource = fs.readFileSync(path.resolve('lib/repositories/userRepository.ts'), 'utf8');
  const httpsAdapterSource = fs.readFileSync(path.resolve('lib/profile/canonicalHttps.ts'), 'utf8');

  // 1. Setup page contract
  assert.match(setupSource, /persistCanonicalBirth/, 'Setup must invoke persistCanonicalBirth');
  assert.match(setupSource, /canonical\.status === "COMMITTED"/, 'Setup must verify COMMITTED receipt before setting canonical epoch/revision');
  assert.match(setupSource, /canonical\.status === "CONFLICT"/, 'Setup must detect CONFLICT and prompt reload');
  assert.match(setupSource, /stripCanonicalServerMetadata|userRepository\.upsertUserProfile/, 'Setup must save profile through guarded repository');

  // 2. Settings page contract
  assert.match(settingsSource, /persistCanonicalBirth/, 'Settings must invoke persistCanonicalBirth on birth edit');
  assert.match(settingsSource, /confirmLegacyBirth/, 'Settings must support legacy birth confirmation');
  assert.match(settingsSource, /canonical\?\.status === "CONFLICT"/, 'Settings must gracefully report CONFLICT to user');
  assert.match(settingsSource, /canonical\?\.status === "COMMITTED"/, 'Settings must treat only verified COMMITTED receipt as saved');

  // 3. Repository layer sanitization (anti-forgery guards)
  assert.match(userRepoSource, /stripCanonicalServerMetadata/, 'userRepository must strip server-owned canonical metadata from client writes');
  assert.match(userRepoSource, /stripClientBirthWrites/, 'userRepository must strip client direct birth writes when canonical record exists');

  // 4. HTTPS adapter configuration
  assert.match(httpsAdapterSource, /\/api\/canonical\/\$\{name\}/, 'HTTPS adapter must target canonical API route pattern');
  assert.match(httpsAdapterSource, /functions\/unauthenticated/, 'HTTPS adapter must map 401 to functions/unauthenticated');
  assert.match(httpsAdapterSource, /functions\/permission-denied/, 'HTTPS adapter must map 403 to functions/permission-denied');
});

test('SPRINT-121-01: Anti-Forgery Sanitization — stripCanonicalServerMetadata & stripClientBirthWrites', () => {
  // Client attempts to forge server-owned canonical metadata
  const forgedPayload: Record<string, unknown> = {
    displayName: 'Aria',
    canonicalBirthRevision: 99,
    canonicalBirthEpoch: 'fake-epoch-12345',
    canonicalBirthUpdatedAt: '2026-11-07T00:00:00.000Z',
    canonicalBirthOperationId: 'fake-op-999',
    birthDate: '1995-05-15',
    birthTime: '08:30',
  };

  const sanitized = stripCanonicalServerMetadata(forgedPayload);
  assert.equal(sanitized.canonicalBirthRevision, undefined, 'Server-owned revision must be stripped');
  assert.equal(sanitized.canonicalBirthEpoch, undefined, 'Server-owned epoch must be stripped');
  assert.equal(sanitized.canonicalBirthUpdatedAt, undefined, 'Server-owned timestamp must be stripped');
  assert.equal(sanitized.canonicalBirthOperationId, undefined, 'Server-owned operation ID must be stripped');
  assert.equal(sanitized.displayName, 'Aria', 'Allowed client field must be preserved');

  // Client attempts to bypass canonical authority by directly modifying birth date
  const birthStripped = stripClientBirthWrites(sanitized);
  assert.equal(birthStripped.birthDate, undefined, 'Direct birthDate write must be stripped on canonical profiles');
  assert.equal(birthStripped.birthTime, undefined, 'Direct birthTime write must be stripped on canonical profiles');
  assert.equal(birthStripped.displayName, 'Aria', 'Allowed client profile fields must remain');
});

test('SPRINT-121-01: Auth & Token Security — Worker Auth Contract', () => {
  const workerAuthSource = fs.readFileSync(path.resolve('services/canonical-worker/src/auth.ts'), 'utf8');
  const workerIndexSource = fs.readFileSync(path.resolve('services/canonical-worker/src/index.ts'), 'utf8');

  // 1. Signature algorithm
  assert.match(workerAuthSource, /RS256/, 'Worker must enforce RS256 token verification');
  assert.match(workerAuthSource, /RSASSA-PKCS1-v1_5/, 'Worker must use standard WebCrypto RSASSA-PKCS1-v1_5');

  // 2. Issuer, Audience, Expiry, Clock Skew
  assert.match(workerAuthSource, /payload\.iss !== expectedIssuer/, 'Worker must enforce Google securetoken issuer match');
  assert.match(workerAuthSource, /audience\.includes\(projectId\)/, 'Worker must enforce project audience match');
  assert.match(workerAuthSource, /payload\.exp <= nowSeconds/, 'Worker must reject expired tokens');
  assert.match(workerAuthSource, /payload\.iat > nowSeconds \+ 300/, 'Worker must reject future-dated tokens beyond skew');

  // 3. Revocation check via validSince
  assert.match(workerAuthSource, /authTimeSeconds < floorSeconds/, 'Worker must reject tokens issued prior to account validSince / tokensValidAfterTime');

  // 4. Cross-UID Isolation
  assert.match(workerIndexSource, /data\.profileUid !== identity\.uid/, 'Worker must reject cross-UID mutations with 403');
  assert.match(workerIndexSource, /functions\/permission-denied/, 'Worker must return functions/permission-denied for unauthorized UID');
});

test('SPRINT-121-01: Firestore REST Transactions — Idempotency & Revision Conflict Semantics', () => {
  const coreSource = fs.readFileSync(path.resolve('services/billing-verifier/lib/canonicalProfileCore.cjs'), 'utf8');
  const workerIndexSource = fs.readFileSync(path.resolve('services/canonical-worker/src/index.ts'), 'utf8');

  // 1. Transaction wrapping
  assert.match(coreSource, /db\.runTransaction/, 'Core must execute within Firestore ACID transaction');

  // 2. Idempotency by operationId and request digest
  assert.match(coreSource, /receiptSnap\.exists/, 'Core must inspect receipt document for idempotency');
  assert.match(coreSource, /receipt\.requestDigest === digest/, 'Core must verify request digest matches previous execution');
  assert.match(coreSource, /status: "COMMITTED", idempotent: true/, 'Core must return COMMITTED with idempotent flag on retry');
  assert.match(coreSource, /operation_id_payload_mismatch/, 'Core must reject operationId reuse with modified payload');

  // 3. Revision Conflict (Optimistic Concurrency Control)
  assert.match(coreSource, /status: "CONFLICT"/, 'Core must detect revision discrepancy and return CONFLICT');
  assert.match(coreSource, /currentRevision/, 'Core must return currentRevision on CONFLICT');

  // 4. Legacy Attestation Requirement
  assert.match(coreSource, /legacy_confirmation_required/, 'Core must require explicit owner attestation for legacy birth migration');
});

test('SPRINT-121-01: Secrets Protection & Fail-Closed Guard', () => {
  const clientFiles = [
    'lib/profile/canonicalHttps.ts',
    'lib/profile/canonicalBirth.ts',
    'lib/repositories/userRepository.ts',
    'app/setup/page.tsx',
    'app/settings/page.tsx',
  ];

  for (const relPath of clientFiles) {
    const fullPath = path.resolve(relPath);
    if (!fs.existsSync(fullPath)) continue;
    const content = fs.readFileSync(fullPath, 'utf8');
    assert.equal(content.includes('SERVICE_ACCOUNT_PRIVATE_KEY'), false, `Client file ${relPath} must not contain service account private key`);
    assert.equal(content.includes('BEGIN PRIVATE KEY'), false, `Client file ${relPath} must not contain embedded private key`);
  }
});
