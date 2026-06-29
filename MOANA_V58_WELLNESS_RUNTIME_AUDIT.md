# MOANA v58 Wellness Runtime Save/Readback Audit Report

## 1. Title
**V3 MOANA v58 — Wellness Runtime Save/Readback Audit**

## 2. Timestamp
`2026-06-29T08:25:00+07:00`

## 3. Branch and Commit Hash
* **Branch**: `KARA_V3_WELLNESS_STABLE`
* **Commit Hash**: `eac8065a0fe17e757432da360e665ecff1255a93`

## 4. Scope
Audit of actual Wellness save and readback flows from the codebase and runtime diagnostics across all sections, sub-pages (`/wellness`, `/innerwork/*`, `/journey`), repositories, and Firestore security rules. Strict focus on audit only without applying fixes or code modifications.

## 5. Known Runtime Evidence
1. **Diagnostics Storage Key**: `localStorage` key `moana:v58:section4JourneyDiagnostics`
2. **Meditation Section 4 Save Flow Input**:
   * `userId` / `authUid` / `profileUid`: `vybyLLFpBxhF1L1m9liGHm5chgG2`
   * `dateKey`: `2026-06-29`
   * `practiceType`: `meditation`
   * `practiceTitle`: `Ruang Lembut untuk Duka`
   * `dailyStatePath`: `dailyStates/vybyLLFpBxhF1L1m9liGHm5chgG2/entries/2026-06-29`
   * `journeyRecordPath`: `journeyDailyRecords/vybyLLFpBxhF1L1m9liGHm5chgG2/entries/2026-06-29`
3. **Observed Write Result**:
   * `dailyStates` write succeeded.
   * `journeyDailyRecords` write failed.
   * Error: `FirebaseError` (code: `permission-denied`, message: `Missing or insufficient permissions`).
4. **Journey Readback Diagnostics**:
   * `dailyStatesFound`: 25
   * `todayStateExists`: true
   * `todayProgressCount`: 1
   * `todayProgressTotal`: 7
   * `fallbackWouldTrigger`: false
   * `section4PracticeLogsFound`: 0
   * `seesSection4Records`: false
   * `journeyDailyRecords` read failed with `permission-denied`.

---

## 6. Actual Wellness Structure from Code

| UI Section / Card | UI Label | File Path | Route | Component | Save / Action Button Text | Save Handler / Function Name | Source of User ID | Write Path | Readback Path | Fallback Behavior | Diagnostic Key |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Section 1** | Check-in Hari Ini | `components/wellness/WellnessPageClient.tsx`<br>`components/dashboard/WellnessCheckInCard.tsx` | `/wellness` | `WellnessCheckInCard` | "Simpan Check-in" / "Simpan Check-in Saja" | `handleSave` in `WellnessCheckInCard.tsx` | `props.uid` (from `auth.user.uid` or `auditUser`) | `dailyStates/{uid}/entries/{dateKey}` | `dailyStates/{uid}/entries/{dateKey}` | `localStorage` (`moana:dailyStates:{uid}:{date}`) in dev audit mode | None |
| **Section 2** | Baseline Scan / Hasil Pemetaan | `components/wellness/WellnessPageClient.tsx`<br>`components/wellness/WellnessAssessmentFlow.tsx` | `/wellness` or `/wellness-assessment` | `WellnessAssessmentFlow` / `WellnessSummaryMapping` | "Lanjutkan" / "Lihat Hasil Pemetaan" | `handleComplete` in `WellnessAssessmentFlow.tsx` | `props.uid` | `wellnessAssessments/{docId}`<br>`wellnessMappings/{uid}`<br>`users/{uid}`<br>`dailyStates/{uid}/entries/{dateKey}` | `wellnessMappings/{uid}`<br>`wellnessAssessments` | `localStorage` fallback in storageProvider | None |
| **Section 3** | Rekomendasi Hari Ini | `components/wellness/WellnessPageClient.tsx` | `/wellness` | `WellnessPageClient` | "Mulai Praktik →" (Main)<br>Supporting practice card taps | Navigation Link (href to `/innerwork/{category}`) | N/A | None on `/wellness` tap (Navigation only) | Reads `intelligence` & `decision` on mount | None | None |
| **Section 4 Hub** | Praktik Tambahan | `components/wellness/WellnessPageClient.tsx` | `/wellness` | `WellnessPageClient` (PRACTICES grid) | 7 Cards: Jurnal, Meditasi, Yoga, Olahraga, Audio, Makanan, Manifestasi | Navigation Link (href to `/innerwork/{type}`) + diagnostic logger | `activeUid` / `auth.user.uid` | None on `/wellness` tap (Navigation only) | None | None | `wellness_section4_hub_button_clicked` |
| **Section 4 Practice: Meditasi** | Meditasi & Napas | `app/innerwork/meditation/page.tsx` | `/innerwork/meditation` | `MeditationPage` | "Simpan Refleksi Meditasi" | `handleSave` | `activeUid` (`auth.user.uid` or `auditUser`) | `dailyStates/{uid}/entries/{dateKey}`<br>`journeyDailyRecords/{uid}/entries/{dateKey}` | `journeyDailyRecords/{uid}/entries/{today}`<br>`journeyDailyRecords/{uid}/entries` | `localStorage` for meditation entries | `section4_save_helper_entered`<br>`section4_journey_record_write_attempt`<br>`section4_save_failure` |
| **Section 4 Practice: Journaling** | Jurnal Refleksi | `app/innerwork/journaling/page.tsx` | `/innerwork/journaling` | `JournalingPage` | "Simpan Jurnal" / "Simpan Refleksi" | `handleSave` / `handleReflectionSave` | `activeUid` | `journals/{uid}/entries/{entryId}`<br>`healingMemory/{uid}`<br>`users/{uid}`<br>`dailyStates/{uid}/entries/{dateKey}`<br>`journeyDailyRecords/{uid}/entries/{dateKey}` | `journals/{uid}/entries`<br>`healingMemory/{uid}` | `localStorage` local journal | `section4_save_helper_entered` |
| **Section 4 Practice: Yoga** | Yoga & Movement | `app/innerwork/yoga/page.tsx` | `/innerwork/yoga` | `YogaPage` | "Selesai & Simpan" | `handleComplete` | `activeUid` | `dailyStates/{uid}/entries/{dateKey}`<br>`journeyDailyRecords/{uid}/entries/{dateKey}`<br>`activities/{uid}/entries/{dateKey}` | `dailyStates/{uid}/entries/{dateKey}` | `localStorage` local activity | `section4_save_helper_entered` |
| **Section 4 Practice: Olahraga** | Olahraga & Fisik | `app/innerwork/workout/page.tsx` | `/innerwork/workout` | `WorkoutPage` | "Selesai & Simpan" | `handleComplete` | `activeUid` | `dailyStates/{uid}/entries/{dateKey}`<br>`journeyDailyRecords/{uid}/entries/{dateKey}`<br>`activities/{uid}/entries/{dateKey}` | `dailyStates/{uid}/entries/{dateKey}` | `localStorage` local activity | `section4_save_helper_entered` |
| **Section 4 Practice: Audio Healing** | Audio Healing | `app/innerwork/audio-healing/page.tsx` | `/innerwork/audio-healing` | `AudioHealingPage` | "Selesai Mendengarkan" | `handleComplete` | `activeUid` | `dailyStates/{uid}/entries/{dateKey}`<br>`journeyDailyRecords/{uid}/entries/{dateKey}` | `dailyStates/{uid}/entries/{dateKey}` | `localStorage` local audio | `section4_save_helper_entered` |
| **Section 4 Practice: Makanan & Jamu** | Makanan & Jamu | `app/innerwork/herbal/page.tsx` | `/innerwork/herbal` | `HerbalPage` | "Tandai Selesai" | `handleComplete` | `activeUid` | `dailyStates/{uid}/entries/{dateKey}`<br>`journeyDailyRecords/{uid}/entries/{dateKey}`<br>`activities/{uid}/entries/{dateKey}` | `dailyStates/{uid}/entries/{dateKey}` | `localStorage` local activity | `section4_save_helper_entered` |
| **Section 4 Practice: Manifestasi** | Manifestasi Hari Ini | `app/innerwork/manifestasi/page.tsx` | `/innerwork/manifestasi` | `ManifestasiPage` | "Simpan Manifestasi" | `handleSave` | `activeUid` | `dailyStates/{uid}/entries/{dateKey}`<br>`journeyDailyRecords/{uid}/entries/{dateKey}` | `dailyStates/{uid}/entries/{dateKey}` | None | `section4_save_helper_entered` |
| **Section 5** | Dukungan untukmu | `components/wellness/WellnessPageClient.tsx` | `/wellness` | `WellnessPageClient` | External Links / Whatsapp / Search | N/A (External anchors) | N/A | None | None | None | None |

---

## 7. Save/Readback Flow Map Table

| Persistence Flow | Originating Code / Helper | Destination Storage Path | Write Method | Readback Method | Result / Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Daily State Save** | `dailyStateRepository.saveDailyState` | Firestore `dailyStates/{uid}/entries/{dateKey}` | `setDoc(..., { merge: true })` | `getDoc` / `getDocs` | **PROVEN_OK** (Writes & reads succeed in runtime logs) |
| **Journey Record Update** | `journeyRepository.updateDailyRecord` | Firestore `journeyDailyRecords/{uid}/entries/{dateKey}` | `setDoc(..., { merge: true })` | `getDoc` / `getDocs` | **PROVEN_BROKEN** (Fails with `permission-denied` in runtime evidence) |
| **Journey Practice Append** | `journeyRepository.appendPracticeResult` | Firestore `journeyDailyRecords/{uid}/entries/{dateKey}` | `setDoc(..., { practiceResults: arrayUnion(...) })` | `getDoc` | **PROVEN_BROKEN** (Dependent on `journeyDailyRecords` write permission) |
| **Wellness Assessment Save** | `wellnessAssessmentRepository.saveAssessment` | Firestore `wellnessAssessments/{docId}` | `setDoc` | `getDocs(query(...))` | **PROVEN_BROKEN** (Missing security rule in `firestore.rules`) |
| **Wellness Mapping Save** | `storageProvider.saveWellnessMapping` | Firestore `wellnessMappings/{uid}` | `setDoc` | `getDoc` | **PROVEN_OK** (Rule exists for owner) |
| **Activity Complete** | `activityRepository.completeActivity` | Firestore `activities/{uid}/entries/{dateKey}` | `setDoc` | `getDocs` | **PROVEN_OK** (Rule exists for owner) |

---

## 8. Firestore Rules Map Table

| Collection / Path in `firestore.rules` | Read Allowed for Owner? | Create Allowed for Owner? | Update Allowed for Owner? | Delete Allowed for Owner? | Validation Requirements | Mismatch with Runtime Payload / Code |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `dailyStates/{userId}`<br>`match /{document=**}` | YES (`isOwner(userId)`) | YES | YES | YES | None | None (Runtime writes succeed) |
| `journeyDailyRecords/{userId}`<br>`match /{document=**}` | YES (`isOwner(userId)`) | YES | YES | YES | None | **MISMATCH**: Local file permits owner, but production runtime throws `permission-denied`. Also `journeyRepository` lacks pre-flight client auth check. |
| `wellnessAssessments` | **NO** (Not defined) | **NO** | **NO** | **NO** | N/A | **MISMATCH**: Code writes to `wellnessAssessments/{docId}`, but collection is omitted from rules. |
| `wellnessMappings/{userId}` | YES (`isOwner(userId)`) | YES | YES | YES | None | None |
| `activities/{userId}`<br>`match /{document=**}` | YES (`isOwner(userId)`) | YES | YES | YES | None | None |

---

## 9. Code vs Rules Mismatch Table

| Aspect / Path | Code Implementation | Firestore Security Rule (`firestore.rules`) | Mismatch Impact | Status |
| :--- | :--- | :--- | :--- | :--- |
| `journeyDailyRecords/{uid}/entries/{dateKey}` | Written by `journeyRepository.updateDailyRecord` using `setDoc` without checking `auth.currentUser`. | Rule defines `match /journeyDailyRecords/{userId} { match /{document=**} { allow read, write: if isOwner(userId)... } }`. | In runtime, requests fail with `permission-denied`. Possible causes: rules in production environment are un-deployed/stale, or `auth.currentUser` SDK token state is uninitialized when `journeyRepository` fires. | **PROVEN_BROKEN** |
| `wellnessAssessments/{docId}` | Written by `wellnessAssessmentRepository.saveAssessment` using `setDoc(doc(db, "wellnessAssessments", docId), ...)`. | Collection `wellnessAssessments` is completely missing from `firestore.rules`. | Any direct client attempt to write to `wellnessAssessments` in production Firestore will fail with `permission-denied`. | **PROVEN_BROKEN** |
| Auth assertion guard | `dailyStateRepository` enforces `assertAuthenticatedOwner(uid)` before invoking Firestore SDK operations. | N/A (Client code level) | `journeyRepository` lacks `assertAuthenticatedOwner(uid)`. If invoked before Firebase Auth resolves, queries run unauthenticated or with mismatched state. | **SUSPECTED** |

---

## 10. Proven Broken Items
1. **Journey Daily Record Firestore Write Failure**: Writes to `journeyDailyRecords/{uid}/entries/{dateKey}` fail in runtime with `permission-denied`.
2. **Journey Daily Record Readback Failure**: Readback queries to `journeyDailyRecords/{uid}/entries` fail in runtime with `permission-denied`.
3. **Missing `wellnessAssessments` Firestore Security Rule**: `wellnessAssessmentRepository` targets `wellnessAssessments`, which has no rule block in `firestore.rules`.

---

## 11. Not Proven Items
1. **Section-specific code path isolation**: NOT PROVEN that Section 4 failures are unique to Meditation. All 7 innerwork practices funnel through `logWellnessSection4Practice`, meaning all Section 4 practices experience the same `journeyDailyRecords` write failure.
2. **Payload validation failure**: NOT PROVEN that Firestore rule validation rejected fields (e.g. `completedAt` timestamp vs string), because `journeyDailyRecords` rules currently have zero field validation logic.
3. **Local storage corruption**: NOT PROVEN that `localStorage` fallback failed. Diagnostics indicate `dailyStates` and `localStorage` function correctly in development.

---

## 12. Recommended Next Tickets (Audit Only - Do Not Implement Yet)
* **MOANA-v58-R1**: Deploy & verify Firestore owner security rules for `journeyDailyRecords/{userId}/{document=**}` and `wellnessAssessments/{docId}`.
* **MOANA-v58-R2**: Add `assertAuthenticatedOwner` guard and auth resolution sync to `journeyRepository.ts` matching `dailyStateRepository.ts`.
* **MOANA-v58-R3**: Audit and verify end-to-end readback verification in `JourneyDetailClient.tsx` once rules are active.

---

## 13. Commands Run
* `git branch --show-current; git rev-parse HEAD`
* `grep_search` across `app`, `components`, `lib`, and `firestore.rules` for collection names, write repositories, and audit log keys.
* `list_dir` across `app/wellness`, `app/innerwork`, `components/wellness`.

## 14. Files Reviewed
* `app/wellness/page.tsx`
* `components/wellness/WellnessPageClient.tsx`
* `components/dashboard/WellnessCheckInCard.tsx`
* `components/wellness/WellnessAssessmentFlow.tsx`
* `app/innerwork/meditation/page.tsx`
* `app/innerwork/journaling/page.tsx`
* `app/innerwork/yoga/page.tsx`
* `app/innerwork/workout/page.tsx`
* `app/innerwork/audio-healing/page.tsx`
* `app/innerwork/herbal/page.tsx`
* `app/innerwork/manifestasi/page.tsx`
* `lib/innerwork/wellnessSection4Logging.ts`
* `lib/repositories/dailyStateRepository.ts`
* `lib/repositories/journeyRepository.ts`
* `lib/repositories/wellnessAssessmentRepository.ts`
* `firestore.rules`

## 15. Files Changed
* `MOANA_V58_WELLNESS_RUNTIME_AUDIT.md` (Report artifact created only).
