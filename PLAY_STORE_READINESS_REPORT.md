# Google Play Store Readiness Report - Bhumi Amartya

**Date:** March 2024  
**Project:** Bhumi Amartya (com.bhumiamartya.app)  
**Status Overview:** ⚠️ NEEDS WORK

---

## 1. Android Release Configuration
| Item | Status | Details |
|------|--------|---------|
| **applicationId** | ✅ READY | `com.bhumiamartya.app` is correctly configured. |
| **versionCode** | ✅ READY | Set to `1`. |
| **versionName** | ✅ READY | Set to `1.0`. |
| **minSdk** | ✅ READY | Set to `24` (Android 7.0). |
| **targetSdk** | ✅ READY | Set to `35` (Android 15). |
| **compileSdk** | ✅ READY | Set to `36`. |
| **Release Signing** | ⚠️ NEEDS WORK | `signingConfigs` is missing in `app/build.gradle`. Need to generate a keystore and configure automatic signing for release builds. |
| **AAB Readiness** | ⚠️ NEEDS WORK | `minifyEnabled` is currently `false` in release build type. Recommended to enable for code shrinking and obfuscation. |

---

## 2. Play Store Required Assets
| Item | Status | Details |
|------|--------|---------|
| **App Icon (512x512)** | ✅ READY | Adaptive icon exists in `mipmap-anydpi-v26`. |
| **Feature Graphic** | ⚠️ NEEDS WORK | 1024x500 graphic not found in project assets. |
| **Screenshots** | ⚠️ NEEDS WORK | Need at least 2-8 phone screenshots. |
| **Privacy Policy URL** | ✅ READY | Link added to Settings. URL: `https://wedhaswara.my.id/privacy-policy-bhumi-amartya` |
| **Descriptions** | ⚠️ NEEDS WORK | Short (80 chars) and Long (4000 chars) descriptions need to be finalized for Play Console. |
| **Content Rating** | ⚠️ NEEDS WORK | Needs questionnaire completion in Play Console. |

---

## 3. Policy & Compliance Audit
| Category | Status | Details |
|----------|--------|---------|
| **Birth Data** | ⚠️ NEEDS WORK | App collects birth date, time, and location. Needs clear disclosure in Privacy Policy and Data Safety form. |
| **Journal Data** | ⚠️ NEEDS WORK | App stores personal reflections. Triggers strict Data Safety requirements. |
| **Account Deletion** | ✅ PASS | **Flow verified end-to-end.** Deletes Firestore data (profile, blueprint, journal, etc.), LocalStorage, and Auth account. |
| **Billing Readiness** | 🛑 BLOCKER | `lib/billing/googlePlayBilling.ts` is a stub. Real Google Play Billing integration is required for the "Pro Plan". |
| **AI Disclosure** | ⚠️ NEEDS WORK | Uses OpenAI and Google Generative AI. Must disclose AI-generated content and provide a user reporting mechanism. |
| **Health Claims** | ⚠️ NEEDS WORK | Audit app copy for medical claims. "Healing" terminology is used. |

---

## 4. Technical Checklist
- [x] `google-services.json` present.
- [x] Account Deletion flow verified.
- [x] Privacy Policy link in Settings.
- [x] Cleartext traffic disabled (`android:usesCleartextTraffic="false"`).
- [ ] Firebase Native Android Auth setup (currently web-based fallback).
- [ ] SHA-1/SHA-256 fingerprints registered in Firebase.

---

## Summary of Remaining Actions
1. **[BLOCKER]** Replace **Play Billing** stubs with `@capacitor/google-play-billing`.
2. **[NEEDS WORK]** Configure **Release Signing** in `app/build.gradle`.
3. **[NEEDS WORK]** Finalize **Play Store listing assets** (screenshots, feature graphic).
4. **[NEEDS WORK]** Finalize **Data Safety Form** in Play Console.
