import assert from 'node:assert/strict';
import test from 'node:test';
import { HD_ENGINE_VERSION, evaluateBlueprint } from '../lib/blueprintVersion';

// 19. missing engineVersion => stale
test('19: blueprint without any version marker is STALE', () => {
  const r = evaluateBlueprint({ humanDesign: { type: 'Projector', profile: '6/2' } });
  assert.equal(r.freshness, 'STALE_CALCULATION');
  assert.equal(r.stale, true);
  assert.equal(r.storedVersion, null);
  assert.match(r.reason, /predates calculation versioning/);
});

test('19b: production shape (updatedAt only, no version) is STALE', () => {
  const r = evaluateBlueprint({
    updatedAt: '2026-09-01T00:00:00Z',
    generatedAt: '2026-09-01T00:00:00Z',
    humanDesign: { type: 'Projector', authority: 'Splenic' },
  });
  assert.equal(r.stale, true);
});

// 20. old engineVersion => stale
test('20: older engine version is STALE', () => {
  const r = evaluateBlueprint({ humanDesign: { type: 'Projector', engineVersion: 'hd-meannode-0' } });
  assert.equal(r.freshness, 'STALE_CALCULATION');
  assert.equal(r.storedVersion, 'hd-meannode-0');
  assert.match(r.reason, /current engine is hd-truenode-1/);
});

test('20b: unknown/foreign version string is treated as STALE, not assumed current', () => {
  const r = evaluateBlueprint({ humanDesign: { type: 'X', engineVersion: 'something-else' } });
  assert.equal(r.stale, true);
});

// 21. current engineVersion => current
test('21: current engine version is CURRENT', () => {
  const r = evaluateBlueprint({ humanDesign: { type: 'Manifesting Generator', engineVersion: HD_ENGINE_VERSION } });
  assert.equal(r.freshness, 'CURRENT');
  assert.equal(r.stale, false);
  assert.equal(r.storedVersion, HD_ENGINE_VERSION);
});

test('21b: version accepted from alternate field names', () => {
  assert.equal(evaluateBlueprint({ humanDesignVersion: HD_ENGINE_VERSION, humanDesign: { type: 'X' } }).stale, false);
  assert.equal(evaluateBlueprint({ engineVersion: HD_ENGINE_VERSION, humanDesign: { type: 'X' } }).stale, false);
  assert.equal(evaluateBlueprint({ humanDesign: { type: 'X', calculationVersion: HD_ENGINE_VERSION } }).stale, false);
});

test('21c: newer-than-known engine is not flagged stale', () => {
  const r = evaluateBlueprint({ humanDesign: { type: 'X', engineVersion: 'hd-truenode-1' } }, 'hd-meannode-0');
  assert.equal(r.stale, false);
});

test('no human design section is not a staleness error', () => {
  const r = evaluateBlueprint({ lifePath: 7 });
  assert.equal(r.freshness, 'NO_HUMAN_DESIGN');
  assert.equal(r.stale, false);
  assert.equal(evaluateBlueprint(null).freshness, 'NO_HUMAN_DESIGN');
});

test('HD_ENGINE_VERSION matches the true-node engine identifier', () => {
  assert.equal(HD_ENGINE_VERSION, 'hd-truenode-1');
});
