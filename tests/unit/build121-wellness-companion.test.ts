import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { getDailySensoryCompanion } from '../../lib/wellness/wellnessSensoryCompanion';

test('B121-WELL: Section 01 to 05 integrity maintained in WellnessPageClient', () => {
  const clientPath = path.resolve('components/wellness/WellnessPageClient.tsx');
  const source = fs.readFileSync(clientPath, 'utf8');

  // Verify all 5 canonical sections exist
  assert.match(source, /WellnessSection\s+number="1"/, 'Section 01 Check-in must exist');
  assert.match(source, /WellnessSection\s+number="2"/, 'Section 02 Kondisi must exist');
  assert.match(source, /WellnessSection\s+number="3"/, 'Section 03 Rekomendasi must exist');
  assert.match(source, /WellnessSection\s+number="4"/, 'Section 04 Praktik Tambahan must exist');
  assert.match(source, /WellnessSection\s+number="5"/, 'Section 05 Dukungan must exist');

  // Verify Kristal & Aroma cards exist inside Section 03 before period packages
  assert.match(source, /Kristal Pendamping Hari Ini/, 'Kristal Pendamping Hari Ini card must exist');
  assert.match(source, /Aroma Pendamping Hari Ini/, 'Aroma Pendamping Hari Ini card must exist');
  assert.match(source, /periods\.map/, 'Pagi/Siang/Malam periods must be rendered');

  // Verify placement: Kristal & Aroma cards are placed BEFORE periods.map in Section 03
  const crystalIdx = source.indexOf('Today\'s Crystal Companion');
  const periodsIdx = source.indexOf('periods.map((pack)');
  assert.ok(crystalIdx !== -1 && periodsIdx !== -1 && crystalIdx < periodsIdx, 'Sensory companion must precede period packages');
});

test('B121-WELL: Deterministic crystal and aroma selection by UID, date, and condition', () => {
  const input1 = {
    uid: 'user-widya',
    date: '2026-11-07',
    condition: 'Kelelahan Mental',
    capacity: 'low',
    careFocus: 'Restorasi lembut',
  };

  const companion1A = getDailySensoryCompanion(input1);
  const companion1B = getDailySensoryCompanion(input1);

  // Determinism check
  assert.deepEqual(companion1A, companion1B, 'Identical user and day must yield identical sensory companions');
  assert.ok(companion1A.crystal, 'Crystal must be present');
  assert.ok(companion1A.aroma, 'Aroma must be present');

  // Verify different user receives personalized selection
  const input2 = {
    uid: 'user-budi',
    date: '2026-11-07',
    condition: 'Fokus Kreatif',
    capacity: 'high',
    careFocus: 'Aktivasi ide',
  };
  const companion2 = getDailySensoryCompanion(input2);
  assert.notEqual(companion1A.seed, companion2.seed, 'Seeds must differ across UIDs');
});

test('B121-WELL: Non-medical framing and alternative without product guarantee', () => {
  const sampleCompanion = getDailySensoryCompanion({
    uid: 'user-test',
    date: '2026-11-07',
    condition: 'Stres Kerja',
  });

  const c = sampleCompanion.crystal!;
  const a = sampleCompanion.aroma!;

  // Must have clear disclaimers
  assert.match(c.disclaimer, /bukan prosedur terapi|bukan pengganti pengobatan/i);
  assert.match(a.disclaimer, /bukan obat|bukan pengganti intervensi kesehatan/i);

  // Must have alternative without product (free accessible grounding/breathing)
  assert.ok(c.noProductAlternative.length > 10, 'Crystal must provide free natural alternative');
  assert.ok(a.noProductAlternative.length > 10, 'Aroma must provide free natural alternative');

  // Safety notes for aroma
  assert.match(a.safetyNotes, /jangan ditelan/i, 'Aroma must explicitly prohibit ingestion');
});

test('B121-WELL: Respiratory sensitivity safety fail-safe', () => {
  const sensitiveUser = {
    uid: 'user-asthma',
    date: '2026-11-07',
    condition: 'Sensitif Pernapasan',
    preferences: {
      respiratorySensitivity: true,
      indoorVentilation: 'poor' as const,
    },
  };

  const companion = getDailySensoryCompanion(sensitiveUser);
  assert.ok(companion.aroma, 'Aroma companion still responds safely');
  assert.match(
    companion.aroma.safePractice,
    /sensitivitas pernapasan aktif|hindari diffuser/i,
    'Must activate respiratory sensitivity safeguard'
  );
});
