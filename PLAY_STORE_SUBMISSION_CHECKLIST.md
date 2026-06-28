# Play Store Submission Checklist - Bhumi Amartya (Updated)

**Date:** 2026-06-26  
**Status:** ✅ **READY FOR SUBMISSION**

---

## 1. Human Design (HD) Calculation
| Item | Status | Details |
|------|--------|---------|
| **Localhost Dependency** | ✅ PASS | Added error handling to automatically fallback to local calculation if service is unreachable. |
| **Pending Screens** | ✅ PASS | Updated fallback logic to return "ready" status. Profile now shows "(Beta)". |
| **Onboarding Completion** | ✅ PASS | Users always receive a valid local approximation during setup. |

---

## 2. Billing & Monetization
| Item | Status | Details |
|------|--------|---------|
| **UI Mentions** | ✅ PASS | Removed "Pro Plan" and "Upgrade" text from core navigation and settings. |
| **Google Play Billing** | ✅ PASS | Replaced sales page CTA with "Coming Soon" information. No dead-end purchase logic. |
| **Trial Lock-out** | ✅ PASS | Settings now shows "Beta Access" with full access during the preview period. |

---

## 3. Legal & Content
| Item | Status | Details |
|------|--------|---------|
| **Privacy Policy Page** | ✅ PASS | Replaced "Draft" text with finalized Indonesian privacy policy. |
| **Terms & Conditions** | ✅ PASS | Replaced "Draft" text with finalized Indonesian terms and conditions. |
| **Placeholder Routes** | ✅ PASS | Cleaned up `/status`, `/changelog`, and `/kontak` of irrelevant project data. |
| **Stale Template Text** | ✅ PASS | Removed "Studio Caption", "Content Strategy", etc. |

---

## 4. Metadata Verification
| Item | Value | Status |
|------|-------|--------|
| **App Name** | Bhumi Amartya | ✅ PASS |
| **Package Name** | `com.bhumiamartya.app` | ✅ PASS |
| **Version** | `3.1.12-RC` (Code 53) | ✅ PASS |
| **Privacy Policy URL** | `https://wedhaswara.my.id/privacy-policy-bhumi-amartya` | ✅ PASS |
| **Contact Email** | `hello@wedhaswara.my.id` | ✅ PASS |

---

## Build Result
- **Next.js Build:** Success
- **Capacitor Android Project:** Present
- **Environment:** Production Preview Ready
