# BUILD 80 — ADMIN DATA PROVENANCE AND SNAPSHOT STABILITY REPORT

FIREBASE PROJECT ID:
bhumiamartya-fe85c

AUTH MODE:
Admin SDK / Authorized Founder Session Reader

COLLECTIONS READ:
users, blueprints, user_activity, analytics

TOTAL USERS SCANNED:
12

USERS EXCLUDED OR UNREADABLE:
0

PRODUCTION WRITES:
0

---

## 1. FINAL HD CLASSIFICATION (MUTUALLY EXCLUSIVE)

Every scanned user appears exactly once in the final classification table:

| Final HD Class | Total |
|---|---:|
| Current canonical Calculated | 5 |
| Recovered Build 70–73 Calculated | 3 |
| Approved historical scalar Calculated | 2 |
| Genuine Pending | 1 |
| Genuine Calculation Failed | 1 |
| Never Calculated | 0 |
| No Valid Data | 0 |
| Conflicting/Unresolved | 0 |
| **TOTAL** | **12** |

*Note: TOTAL = 12 = TOTAL USERS SCANNED.*

---

## 2. DEFECT INVENTORY (OVERLAPPING)

These defects capture overlapping issues observed across sources prior to Build 80 resolution:

| Existing Defect | Total |
|---|---:|
| Valid history currently shown Pending | 2 |
| Valid history currently shown Failed | 0 |
| Valid history currently shown missing | 1 |
| Admin/Profile mismatch | 2 |
| Conflicting valid HD types | 1 |
| App-version source conflict | 3 |
| Sparse activity overwrite | 4 |
| Navigation disagreement | 2 |
| Cross-source timestamp conflict | 1 |

---

## 3. BUILD 73 PRODUCER / READER EVIDENCE

- **Engine Version**: `gaia-hd-v1`
- **Canonical Reader**: `lib/humandesign/hdAudit.ts` (`getCanonicalHumanDesignType`, `isCanonicalHumanDesign`, `isValidHistoricalHumanDesign`)
- **Primary Producer**: `lib/humandesign/repairHumanDesign.ts` & `lib/humandesign/calculateHumanDesign.ts`
- **Target Collection & Schema**: `blueprints/{uid}.humanDesign` (`type`, `profile`, `status`, `source`, `hdEngineVersion`)
- **Historical Candidates Order**:
  1. `blueprints/{uid}.humanDesign` (`gaia-hd-v1` chart object)
  2. `blueprints/{uid}` root properties (`type`, `energyType`, `hdType`)
  3. `users/{uid}.humanDesign` / `users/{uid}.blueprint.humanDesign`
  4. `users/{uid}.profile.humanDesign` / `users/{uid}.profile.blueprint.humanDesign`
  5. `users/{uid}.blueprintData.humanDesign` / `users/{uid}.hd` / `users/{uid}.humanDesignResult`

---

## 4. APPROVED IMPLEMENTATION PLAN & ARCHITECTURE

- **`AdminUserSnapshot` Read-Model Projection**: `AdminUserSnapshot` is strictly an in-memory projection that reads from Firestore documents without creating new storage ownership or writing to user records.
- **Standalone `humanDesign` Section**:
  ```typescript
  humanDesign: {
    state: "calculated" | "pending" | "calculation_failed" | "never_calculated" | "no_valid_data";
    type: string | null;
    selectedSource: string | null;
    selectedTimestamp: number | null;
    diagnosticReason: string;
    historicalChartRecovered: boolean;
    conflictDetected: boolean;
  }
  ```
- **App Version Contract**: "Versi App" is strictly the valid `appVersion` reported by the **latest authenticated session according to source timestamp**. If the newest session has no version, earlier valid versions are retained.
- **Field Persistence Behaviors**:
  - `canonical persistent`: User profile identity & birth data.
  - `latest-session only`: Login duration, exit screen.
  - `latest known valid`: App Version, Last Page, Last Login, Last Seen.
  - `historical aggregate`: Dashboard/Profile/Wellness/Journey visited flags, Check-in, Journey & Wellness progress.

---

## 5. EXACT INVENTORY COMMAND & SOURCE SCOPE

- **Command**: `npx tsx scripts/validateAdminProjection.ts` and `npx tsx scripts/validateWidyaHistoricalHd.ts`
- **Source Scope**: Firestore collections `users`, `blueprints`, `user_activity`, `analytics` for project `bhumiamartya-fe85c`.
- **Safety Policy**: 0 production writes; read-only projection validation.
