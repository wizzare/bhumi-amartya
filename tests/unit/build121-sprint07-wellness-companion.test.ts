/**
 * BHUMI AMARTYA — BUILD 121
 * SPRINT 121-07: WELLNESS PERSONAL COMPANION TEST SUITE
 *
 * Verifies:
 * 1. Three distinct synthetic Blueprint profiles (Manifesting Generator, Projector, Reflector).
 * 2. Two users with identical Blueprint but different check-ins receive different companions (real condition > symbolic blueprint).
 * 3. Respiratory sensitivity & indoor ventilation safety exclusions (diffusers/smoke excluded, natural air alternative).
 * 4. User worldview & consent opt-out (allowSpiritualContent: false -> crystal = null).
 * 5. Rejection mechanism (rejectedCrystalIds / rejectedAromaIds exclusion).
 * 6. User without Journey data degrades gracefully without fabricating fake progress.
 * 7. Check-in mutation on the same calendar day updates recommendation dynamically.
 * 8. Account switching and local date changes produce distinct deterministic seeds (zero cross-UID leak).
 * 9. Absolute safety invariants: no ingestion, non-medical framing, pet/infant safety, free alternative without product.
 * 10. Five sections of Wellness page remain preserved with sensory companions positioned before period packages.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { getDailySensoryCompanion } from '@/lib/wellness/wellnessSensoryCompanion';

// ============================================================================
// FIXTURES
// ============================================================================

const BLUEPRINT_MG = {
  hdType: 'Manifesting Generator',
  hdAuthority: 'Emotional - Solar Plexus',
  hdProfile: '6/2',
  lifePath: 4,
  centerArcana: 7,
};

const BLUEPRINT_PROJECTOR = {
  hdType: 'Projector',
  hdAuthority: 'Splenic',
  hdProfile: '1/3',
  lifePath: 8,
  centerArcana: 11,
};

const BLUEPRINT_REFLECTOR = {
  hdType: 'Reflector',
  hdAuthority: 'Lunar Cycle',
  hdProfile: '4/6',
  lifePath: 11,
  centerArcana: 9,
};

// ============================================================================
// TEST CASES
// ============================================================================

test('SPRINT 121-07 TEST 1: Three Distinct Synthetic Blueprint Profiles Integration', () => {
  const date = '2026-11-07';

  const resMG = getDailySensoryCompanion({
    uid: 'usr_alpha_mg',
    date,
    condition: 'Dinamis',
    blueprint: BLUEPRINT_MG,
  });

  const resProj = getDailySensoryCompanion({
    uid: 'usr_beta_proj',
    date,
    condition: 'Observasi',
    blueprint: BLUEPRINT_PROJECTOR,
  });

  const resRef = getDailySensoryCompanion({
    uid: 'usr_gamma_ref',
    date,
    condition: 'Kontemplasi',
    blueprint: BLUEPRINT_REFLECTOR,
  });

  assert.ok(resMG.crystal && resMG.aroma);
  assert.ok(resProj.crystal && resProj.aroma);
  assert.ok(resRef.crystal && resRef.aroma);

  // Check that HD context is woven into rationale
  assert.match(resMG.crystal.contextRationale, /Manifesting Generator/i);
  assert.match(resProj.crystal.contextRationale, /Projector/i);
  assert.match(resRef.crystal.contextRationale, /Reflector/i);
});

test('SPRINT 121-07 TEST 2: Two Users with Identical Blueprint but Different Check-ins (Real Condition > Symbolic)', () => {
  const date = '2026-11-07';

  // User 1: Stressed & Exhausted (Poor sleep & low energy)
  const userExhausted = getDailySensoryCompanion({
    uid: 'user_mg_tired',
    date,
    condition: 'Kelelahan Batin',
    capacity: 'low',
    blueprint: BLUEPRINT_MG,
    checkIn: {
      metrics: { sleep: 3, energy: 3, emotion: 3, focus: 4 },
      needs: ['rest', 'boundary'],
      currentIssue: 'Beban kerja menumpuk dan kurang tidur',
    },
  });

  // User 2: Energized & Focused (High energy & clarity)
  const userEnergized = getDailySensoryCompanion({
    uid: 'user_mg_energized',
    date,
    condition: 'Semangat Berkarya',
    capacity: 'high',
    blueprint: BLUEPRINT_MG,
    checkIn: {
      metrics: { sleep: 9, energy: 9, emotion: 8, focus: 9 },
      needs: ['focus', 'expression'],
      currentIssue: 'Memulai proyek baru dengan penuh energi',
    },
  });

  // User 1 must receive restorative/grounding companion (Amethyst, Rose Quartz, Selenite, Black Tourmaline)
  assert.ok(
    userExhausted.crystal?.id === 'amethyst' ||
    userExhausted.crystal?.id === 'rose-quartz' ||
    userExhausted.crystal?.id === 'selenite' ||
    userExhausted.crystal?.id === 'black-tourmaline',
    `Exhausted user should receive restorative crystal, got: ${userExhausted.crystal?.id}`
  );

  // User 2 must receive clarity/momentum companion (Citrine, Clear Quartz)
  assert.ok(
    userEnergized.crystal?.id === 'citrine' || userEnergized.crystal?.id === 'clear-quartz',
    `Energized user should receive clarity/momentum crystal, got: ${userEnergized.crystal?.id}`
  );

  // Their recommendations must be distinct despite sharing identical Manifesting Generator blueprint
  assert.notStrictEqual(userExhausted.crystal?.id, userEnergized.crystal?.id);
  assert.notStrictEqual(userExhausted.crystal?.contextRationale, userEnergized.crystal?.contextRationale);
});

test('SPRINT 121-07 TEST 3: Respiratory Sensitivity & Poor Indoor Ventilation Safety Exclusions', () => {
  const date = '2026-11-07';

  const userAsthma = getDailySensoryCompanion({
    uid: 'usr_asthma_safety',
    date,
    condition: 'Sensitif Pernapasan',
    preferences: {
      respiratorySensitivity: true,
      indoorVentilation: 'poor',
    },
  });

  assert.ok(userAsthma.aroma);
  // Diffusers and concentrated aerosols must be explicitly cautioned against
  assert.match(userAsthma.aroma.safePractice, /sensitivitas pernapasan aktif/i);
  assert.match(userAsthma.aroma.safePractice, /hindari diffuser/i);
  assert.ok(userAsthma.safetyWarnings && userAsthma.safetyWarnings.length > 0);
  assert.match(userAsthma.safetyWarnings[0], /sensitivitas pernapasan/i);

  // Safe practice must offer zero-aerosol, natural alternatives
  assert.ok(userAsthma.aroma.noProductAlternative.length > 10);
});

test('SPRINT 121-07 TEST 4: Worldview & Consent Opt-out (allowSpiritualContent: false)', () => {
  const date = '2026-11-07';

  const userOptedOut = getDailySensoryCompanion({
    uid: 'usr_secular_mindset',
    date,
    condition: 'Fokus Rasional',
    preferences: {
      allowSpiritualContent: false,
      allowHolisticCompanions: false,
    },
  });

  // Crystal must be completely null when user opts out of spiritual content
  assert.strictEqual(userOptedOut.crystal, null);
  assert.strictEqual(userOptedOut.optedOut, true);
  assert.ok(userOptedOut.optOutReason && userOptedOut.optOutReason.length > 0);

  // Aroma companion can still provide secular sensory comfort unless aroma is also opted out
  assert.ok(userOptedOut.aroma);
});

test('SPRINT 121-07 TEST 5: Scent or Crystal Rejection Mechanism (rejectedCrystalIds / rejectedAromaIds)', () => {
  const date = '2026-11-07';

  const defaultResult = getDailySensoryCompanion({
    uid: 'usr_reject_test',
    date,
    condition: 'Kelelahan Mental',
  });

  const defaultCrystalId = defaultResult.crystal?.id;
  const defaultAromaId = defaultResult.aroma?.id;

  // Now reject both chosen items
  const userRejected = getDailySensoryCompanion({
    uid: 'usr_reject_test',
    date,
    condition: 'Kelelahan Mental',
    preferences: {
      rejectedCrystalIds: defaultCrystalId ? [defaultCrystalId] : [],
      rejectedAromaIds: defaultAromaId ? [defaultAromaId] : [],
    },
  });

  if (defaultCrystalId) {
    assert.notStrictEqual(userRejected.crystal?.id, defaultCrystalId, 'Rejected crystal must not be returned');
  }
  if (defaultAromaId) {
    assert.notStrictEqual(userRejected.aroma?.id, defaultAromaId, 'Rejected aroma must not be returned');
  }
});

test('SPRINT 121-07 TEST 6: Graceful Fallback When Journey Context is Absent', () => {
  const date = '2026-11-07';

  const userNoJourney = getDailySensoryCompanion({
    uid: 'usr_new_user_no_journey',
    date,
    condition: 'Memulai Hari',
    // journeyContext is undefined
  });

  assert.ok(userNoJourney.crystal);
  assert.ok(userNoJourney.aroma);
  // Ensure rationale does not fabricate fake journey progress or crash
  assert.doesNotMatch(userNoJourney.crystal.contextRationale, /undefined/i);
  assert.doesNotMatch(userNoJourney.aroma.contextRationale, /undefined/i);
});

test('SPRINT 121-07 TEST 7: Check-in Mutation on Same Calendar Day Triggers Dynamic Recalculation', () => {
  const uid = 'usr_dynamic_mutation';
  const date = '2026-11-07';

  // Initial checkin in the morning: Tired
  const morningCheckin = getDailySensoryCompanion({
    uid,
    date,
    condition: 'Kurang Tidur',
    capacity: 'low',
    checkIn: {
      metrics: { sleep: 2, energy: 3, emotion: 4, focus: 3 },
    },
  });

  // Updated checkin in the afternoon after rest: Energized
  const afternoonCheckin = getDailySensoryCompanion({
    uid,
    date,
    condition: 'Segar Kembali',
    capacity: 'high',
    checkIn: {
      metrics: { sleep: 8, energy: 9, emotion: 8, focus: 8 },
    },
  });

  assert.notStrictEqual(
    morningCheckin.seed,
    afternoonCheckin.seed,
    'Mutating check-in metrics on the same day must invalidate seed'
  );
  assert.notStrictEqual(
    morningCheckin.crystal?.contextRationale,
    afternoonCheckin.crystal?.contextRationale,
    'Context rationale must update to reflect afternoon condition'
  );
});

test('SPRINT 121-07 TEST 8: Account Switching and Local Date Rollover Isolation (Zero Leakage)', () => {
  const user1 = getDailySensoryCompanion({
    uid: 'usr_account_alice',
    date: '2026-11-07',
    condition: 'Fokus',
  });

  const user2 = getDailySensoryCompanion({
    uid: 'usr_account_bob',
    date: '2026-11-07',
    condition: 'Fokus',
  });

  const user1NextDay = getDailySensoryCompanion({
    uid: 'usr_account_alice',
    date: '2026-11-08',
    condition: 'Fokus',
  });

  assert.notStrictEqual(user1.seed, user2.seed, 'Distinct accounts must produce distinct seeds');
  assert.notStrictEqual(user1.seed, user1NextDay.seed, 'Date rollover must produce distinct seed');
});

test('SPRINT 121-07 TEST 9: Absolute Safety Invariants (No Ingestion, No Medical Claims, Pet/Infant Safety)', () => {
  const companion = getDailySensoryCompanion({
    uid: 'usr_safety_check',
    date: '2026-11-07',
    condition: 'Uji Keamanan',
    preferences: {
      hasBabiesOrPets: true,
    },
  });

  const c = companion.crystal!;
  const a = companion.aroma!;

  // 1. Crystal disclaimer
  assert.match(c.disclaimer, /bukan prosedur terapi|bukan pengganti pengobatan medis/i);
  assert.doesNotMatch(c.contextRationale, /menyembuhkan|mengobati|terapi klinis/i);

  // 2. Aroma disclaimer & ingestion prohibition
  assert.match(a.disclaimer, /bukan obat|bukan pengganti intervensi kesehatan/i);
  assert.match(a.safetyNotes, /jangan ditelan/i);

  // 3. Child/pet safety: peppermint must be excluded
  assert.notStrictEqual(a.id, 'peppermint', 'Peppermint must be excluded when babies/pets are present');
  assert.match(a.safetyNotes, /anak|hewan/i);

  // 4. Free, non-product alternative must be present
  assert.ok(c.noProductAlternative.length > 10);
  assert.ok(a.noProductAlternative.length > 10);
});

test('SPRINT 121-07 TEST 10: Five Sections Preserved & Sensory Cards Precede Period Packages in UI', () => {
  const clientPath = path.resolve('components/wellness/WellnessPageClient.tsx');
  const source = fs.readFileSync(clientPath, 'utf8');

  // Verify all 5 canonical sections exist
  assert.match(source, /WellnessSection\s+number="1"/, 'Section 01 Check-in must exist');
  assert.match(source, /WellnessSection\s+number="2"/, 'Section 02 Kondisi must exist');
  assert.match(source, /WellnessSection\s+number="3"/, 'Section 03 Rekomendasi must exist');
  assert.match(source, /WellnessSection\s+number="4"/, 'Section 04 Praktik Tambahan must exist');
  assert.match(source, /WellnessSection\s+number="5"/, 'Section 05 Dukungan must exist');

  // Verify sensory cards exist inside Section 03
  assert.match(source, /Kristal Pendamping Hari Ini/);
  assert.match(source, /Aroma Pendamping Hari Ini/);

  // Verify placement before periods.map in Section 03
  const crystalIdx = source.indexOf("Today's Crystal Companion");
  const periodsIdx = source.indexOf('periods.map((pack)');
  assert.ok(crystalIdx !== -1 && periodsIdx !== -1 && crystalIdx < periodsIdx, 'Sensory cards must precede period packages');

  // Verify skip buttons exist for both companions
  assert.match(source, /Lewati \/ Tidak punya/i);
  assert.match(source, /Lewati \/ Tidak suka aroma ini/i);
});
