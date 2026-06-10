# Beta Release Readiness Audit - Bhumi Amartya

**Date:** 2026-06-06  
**Audit Goal:** Determine readiness for 20-50 beta testers.  
**Overall Verdict:** 🛑 **NOT READY (BLOCKERS FOUND)**

---

## 1. Pro Plan & Billing Audit
Current status: **Functional Stub / Experimental**

| Screen / Component | Mention | Recommendation |
|--------------------|---------|----------------|
| `/upgrade` | Full "Pro Plan" sales page. | **Hide temporarily.** CTA button only triggers a browser alert. |
| `/settings` | "Account Status" shows Plan & Trial days. | **Keep visible.** Helps testers know their status. |
| `PremiumLock` | "Perjalanan Berlanjut di Premium" overlay. | **Disable interaction.** Link to `/upgrade` is dead. |
| `FeatureLocked` | Full screen lock for expired trials. | **Disable interaction.** "Tombol Upgrade" is a placeholder. |
| `lib/billing` | Trial logic (7 days). | **Warning.** Testers will be locked out after 1 week. |

**Critical Issue:** The 7-day trial is strictly enforced in code. After 7 days, 80% of the app (Journal, Meditation, Healing, Journey) will lock, rendering the beta test useless for users who don't have "Developer" email overrides.

---

## 2. Feature & Navigation Audit

### 🛑 Blockers
1.  **Trial Lock-out:** Automated 7-day expiration will block testers from core features.
2.  **Human Design Service:** The calculation depends on `http://localhost:8000/calculate`. In a production release, this service is unreachable, leaving the Blueprint profile permanently "In Preparation" (Pending).
3.  **Placeholder Legal Pages:** `/kebijakan-privasi` and `/syarat-ketentuan` are "Draft" placeholders. While an external link exists in Settings, internal navigation might lead to these broken pages.
4.  **Billing Stub:** The "Upgrade" button in `FeatureLocked` is literally labeled "Tombol Upgrade" and has no logic.

### ⚠️ Warnings
1.  **Stale Admin Data:** `/status` and `/changelog` mention features like "Produk Potensial" and "Caption Studio" which do not belong to this project.
2.  **Empty Routes:** `/pricing` and `/tentang` folders are empty, which may cause 404s if users find the paths.
3.  **Local-First Sync:** Heavy reliance on LocalStorage means data might not sync correctly across devices if Firebase Auth is not perfectly configured.

---

## 3. Recommended Tester Count
*   **Current State:** 5-10 internal testers (Alpha).
*   **With Trial Fix:** 20 testers (Beta).
*   **Target 50:** Not recommended until Human Design service and legal placeholders are resolved.

---

## 4. Recommended Release Channel
*   **Google Play Console:** `Internal Testing` or `Closed Beta`.
*   **Distribution:** Invite-only via email list to manage expectations regarding the "Pending" Human Design status.

---

## 5. Required Actions before Beta (Summary)
1.  **Trial Bypass:** Extend `FREE_TRIAL_DAYS` to 30 or 90 days for Beta.
2.  **HD Fallback:** Implement a deterministic local fallback for Human Design if the Python API is unreachable.
3.  **Content Audit:** Remove or update stale template text in `/status` and `/changelog`.
4.  **Billing UX:** Change "Upgrade to Pro" text to "Feature coming soon" to avoid tester confusion.
