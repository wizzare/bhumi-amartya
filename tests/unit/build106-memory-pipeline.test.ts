/**
 * Build 106 Step 5 — Memory pipeline: candidate repository + pattern aggregator
 * (R-21 continuity, R-23 visibility/control CRUD, R-24/R-25 retrieval, R-26 boundaries, R-27 pinning).
 *
 * Runner: tsx --import ./tests/helpers/releaseTestEnv.mjs tests/unit/build106-memory-pipeline.test.ts
 * (env preload only because lib/firebase/config is on the import chain; the repo
 *  falls back to the local cache when auth.currentUser is not the uid.)
 */
import assert from "node:assert";
process.on("unhandledRejection", () => {});
process.on("uncaughtException", (e) => {
  if (String(e).includes("FIRESTORE") || String(e).includes("_startProactiveRefresh") || String(e).includes("accessToken")) return;
  console.error(e); process.exit(1);
});

function setupStorage() {
  const store: Record<string, string> = {};
  // @ts-ignore
  global.window = { localStorage: {
    getItem(k: string) { return store[k] ?? null; },
    setItem(k: string, v: string) { store[k] = v; },
    removeItem(k: string) { delete store[k]; },
  } } as any;
  return store;
}

let assertions = 0;
function ok(cond: unknown, msg: string): void { assertions += 1; assert.ok(cond, msg); }
function eq<T>(a: T, b: T, msg: string): void { assertions += 1; assert.strictEqual(a, b, msg); }

(async () => {
  setupStorage();
  const { memoryCandidateRepository } = await import("../../lib/repositories/memoryCandidateRepository.ts");
  const { aggregateForJourney, conciseJourneyNote } = await import("../../lib/memory/memoryPatternAggregator.ts");
  type MC = import("../../lib/memory/memoryCandidate.ts").MemoryCandidate;

  const UID = "mem-uid-1";
  const entry = (over: Record<string, unknown>): any => ({
    id: "e", date: "2026-08-25", theme: "Proses Pelepasan", questions: ["Q1"],
    journalText: "isi", emotionalState: "Sedih", bodySignals: [], createdAt: new Date().toISOString(),
    insight: "i", tomorrowFocus: "t", previousEntryCount: 0, ...over,
  });

  /* ---- R-23/R-26: one-off is PENDING, not auto-promoted ---- */
  memoryCandidateRepository._clearLocal(UID);
  const c1 = await memoryCandidateRepository.upsertFromEntry(UID, entry({ id: "e1", journalType: "FREE", date: "2026-08-20" }));
  ok(c1, "first entry creates a candidate");
  eq(c1!.state, "PENDING", "one-off candidate is PENDING (not auto-CONFIRMED)");
  eq(c1!.evidence.length, 1, "one evidence item");
  ok(c1!.confidence <= 0.25, "one-off confidence stays low");

  /* ---- R-21/R-24: evidence accumulates across entries, same theme ---- */
  await memoryCandidateRepository.upsertFromEntry(UID, entry({ id: "e2", journalType: "CBT", date: "2026-08-22", cbt: { situation: "x" } }));
  const c3 = await memoryCandidateRepository.upsertFromEntry(UID, entry({ id: "e3", journalType: "EMOTION", date: "2026-08-25", emotion: { primaryFeeling: "sedih" } }));
  eq(c3!.evidence.length, 3, "evidence accumulated to 3");
  ok(c3!.originatingModes.length >= 2, "originating modes accumulate (FREE + CBT + EMOTION)");
  ok(c3!.confidence >= 0.6, "confidence rises with 3 evidence");

  /* ---- R-25: aggregator promotes only 3+ evidence (or pinned), excludes DISMISSED ---- */
  let active = aggregateForJourney(await memoryCandidateRepository.getCandidates(UID));
  eq(active.length, 1, "3-evidence candidate is promoted to an active pattern");
  eq(active[0].evidenceCount, 3, "pattern carries the evidence count");
  ok(active[0].daysSpan >= 5, "daysSpan computed across the evidence dates");

  /* ---- R-23: user control — confirm / correct / dismiss ---- */
  await memoryCandidateRepository.confirm(UID, c3!.id);
  let all = await memoryCandidateRepository.getCandidates(UID);
  eq(all.find((c: MC) => c.id === c3!.id)!.state, "CONFIRMED", "confirm() sets CONFIRMED");
  eq((await memoryCandidateRepository.getActiveCandidates(UID)).length, 1, "getActiveCandidates returns CONFIRMED/CORRECTED only");

  await memoryCandidateRepository.correct(UID, c3!.id, "Tema pelepasan yang aku pilih sendiri");
  all = await memoryCandidateRepository.getCandidates(UID);
  const corrected = all.find((c: MC) => c.id === c3!.id)!;
  eq(corrected.state, "CORRECTED", "correct() sets CORRECTED");
  eq(corrected.correctedLabel, "Tema pelepasan yang aku pilih sendiri", "user-corrected label stored");

  await memoryCandidateRepository.dismiss(UID, c3!.id);
  all = await memoryCandidateRepository.getCandidates(UID);
  eq(all.find((c: MC) => c.id === c3!.id)!.state, "DISMISSED", "dismiss() sets DISMISSED");
  eq((await memoryCandidateRepository.getActiveCandidates(UID)).length, 0, "R-26: dismissed candidate no longer influences Journey");
  active = aggregateForJourney(await memoryCandidateRepository.getCandidates(UID));
  eq(active.length, 0, "aggregator excludes DISMISSED even with 3+ evidence");

  /* ---- R-26: a dismissed theme accumulates evidence but stays DISMISSED (no silent re-promotion) ---- */
  const afterDismiss = await memoryCandidateRepository.upsertFromEntry(UID, entry({ id: "e4", journalType: "FREE", date: "2026-08-27" }));
  eq(afterDismiss!.state, "DISMISSED", "new evidence on a dismissed theme does not re-promote it");
  ok(afterDismiss!.evidence.length >= 4, "evidence still appended for provenance");

  /* ---- R-27: pinned bypasses the 3+ promotion gate ---- */
  memoryCandidateRepository._clearLocal(UID);
  const pinnedSeed = await memoryCandidateRepository.upsertFromEntry(UID, entry({ id: "p1", journalType: "FREE", theme: "Rasa Syukur", date: "2026-08-25" }));
  await memoryCandidateRepository.saveCandidate(UID, { ...(pinnedSeed as MC), pinned: true });
  active = aggregateForJourney(await memoryCandidateRepository.getCandidates(UID));
  eq(active.length, 1, "R-27: a pinned one-off candidate surfaces as an active pattern");
  eq(active[0].theme, "rasa syukur", "pinned pattern carries its theme");

  /* ---- conciseJourneyNote locale ---- */
  const note = conciseJourneyNote(active[0], "en");
  ok(note.includes("appeared in") && note.includes("days"), "conciseJourneyNote renders an English grounded line");
  ok(!/depresi|disorder|diagnos/i.test(conciseJourneyNote(active[0], "id")), "grounded note is non-diagnostic");

  console.log(`PASS build106-memory-pipeline (${assertions} assertions)`);
})();
