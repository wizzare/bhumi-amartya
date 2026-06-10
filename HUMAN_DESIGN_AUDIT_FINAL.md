# Human Design Pipeline Audit - Bhumi Amartya

**Date:** 2026-06-06  
**Status:** ✅ **Harden & Audited**

---

## 1. Trace Overview

| Phase | Component | Logic |
|-------|-----------|-------|
| **Setup** | `app/setup/page.tsx` | Validates birth date, time, and city via Google Autocomplete. |
| **Storage** | `storageProvider.ts` | Stores birth data in `bhumiProfile:{uid}`. |
| **Generation**| `generateBlueprint.ts`| Orchestrates the calculation sequence. |
| **Calculation**| `calculateHumanDesign.ts`| Primary entry point; attempts Kit then Fallback. |
| **Fallback** | `calculateHumanDesignType.ts`| Uses `astronomy-engine` for local planetary math. |
| **Rendering** | `CoreIdentity.tsx` | Displays "Human Design (Beta)" and the calculated Type. |

---

## 2. Calculation Paths

### Current Primary Path (Approximation)
**Path:** `calculateLocalFallback`  
**Mechanism:** 
1. Calculates Personality Sun Longitude.
2. Finds Design Date (-88 degrees solar longitude).
3. Calculates planetary positions for both dates.
4. Maps to 64 Gates.
5. Checks 36 Channels for center definition.
6. Determines Type via Sacral/Motor-to-Throat logic.

### Verified Path (Experimental)
**Path:** `calculateWithHdkit`  
**Status:** **STUB**. Currently unreachable in production due to lack of local ephemeris files.

### Manual Path (Owner Only)
**Path:** `ownerOverride.ts`  
**Status:** Applied to `wizzare@gmail.com` to ensure verified results for development/demo.

---

## 3. Data Integrity & Resilience

| Risk | Status | Mitigation |
|------|--------|------------|
| **Invalid Birth Time** | ✅ SAFE | `birthDateTimeToUtcDate` uses `Date.UTC` with range checks; returns null on NaN. |
| **Missing City** | ✅ SAFE | `resolveNatalLocation` defaults to Jakarta or uses user-provided lat/lng. |
| **Missing Timezone** | ✅ SAFE | Defaults to `+07:00` or approximates based on `longitude / 15`. |
| **Missing HD Engine** | ✅ SAFE | Local fallback ensures a valid `HumanDesignChart` structure is always returned. |

---

## 4. UI Transparency
- **Labeling:** All user-facing Human Design headers are now labeled **"Human Design (Beta)"**.
- **Pending States:** Replaced "Pending" with "(Beta)" local results to prevent a "broken app" feel.
- **Internal Tagging:** All approximated results are internally tagged with `source: "local-fallback"` and `accuracy: "approximate"`.

---

## 5. Recommended Architecture
1. **Public API:** Move the Python `hdkit` service to a secure public HTTPS endpoint.
2. **Hybrid Logic:** Continue using the local fallback as an "Instant Result" while the high-precision API calculates in the background.
3. **Data Quality:** Store `calculationQuality` in Firestore to track which users have verified vs approximated data.

---

## 6. Estimated Effort to Verified HD
- **Public API Setup:** 2 days (Docker/HuggingFace/GCP).
- **Client Implementation:** 1 day (Async polling logic).
- **Accuracy Audit:** 3 days (Comparing 100+ charts against authoritative sources).
- **Total:** ~1 week.
