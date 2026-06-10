# Bhumi Amartya - Play Store Internal Testing Plan

## 1) Current Readiness Audit (Android Wrapper)
- Platform state: Web app (Next.js), no Android project committed yet (`android/` not found).
- Auth state: Firebase Google Auth is implemented on web flow; Android-native Google Sign-In is not set up yet.
- Billing state: Google Play billing is placeholder-only (`lib/billing/googlePlayBilling.ts` has `GOOGLE_PLAY_BILLING_ENABLED = false` and TODO stub).
- Offline/PWA state: No production PWA packaging setup found for the main app.
- Build health: Web build is passing and can be used as baseline before packaging.

## 2) Recommended Android Path
Recommended: **Capacitor**.

Why Capacitor is best for this app:
- Supports wrapping the existing web app quickly for internal testing.
- Allows native Android plugins when needed (Google Sign-In, Play Billing, push notifications).
- Better long-term path than PWA-to-APK for production-grade Play requirements.
- More flexible than TWA for advanced native integration.

Why not TWA as primary path:
- TWA is strong for pure web delivery, but native billing/auth integrations are more constrained and often require extra architecture.
- Your app roadmap needs Firebase Auth + Play Billing hardening, which is cleaner with Capacitor native bridge.

Why not PWA-to-APK:
- Useful only for quick demos; weaker control for Play policy-sensitive integrations (billing, auth, notifications, device behavior).

## 3) Android Packaging Plan (Capacitor)
1. Freeze baseline:
- Ensure `npm run build` passes.
- Tag this state for rollback.

2. Initialize Capacitor:
- Install `@capacitor/core` + `@capacitor/cli`.
- Create Capacitor config with app id/package name (for example `com.bhumiamartya.app`).
- Add Android platform via Capacitor CLI.

3. App hosting mode:
- Start with bundled web assets in `www` (stable for internal test).
- Optionally migrate to remote-hosted web assets later after QA.

4. Android project setup:
- Open Android project in Android Studio.
- Set min/target SDK per current Play requirements.
- Configure signing for internal app bundle generation (`.aab`).

5. Firebase Android setup:
- Register Android app in Firebase project.
- Add SHA-1 and SHA-256 fingerprints.
- Download and place `google-services.json` in Android app module.
- Add Firebase Auth Android dependencies.

6. Google Sign-In (Android native):
- Configure OAuth client(s) in Firebase/Google Cloud (Android + Web where required).
- Validate login session persistence and return path back to app screen.

7. Play Billing integration:
- Replace placeholder billing with Google Play Billing Library flow.
- Map plan state from Play entitlement to app plan model.

8. QA for internal track:
- Test login, setup, dashboard, journal, meditation, audio healing.
- Test subscription purchase/restore/cancel flows.
- Verify crash-free startup, back navigation, and cold start.

9. Release to internal testing:
- Build signed `.aab`.
- Upload to Internal testing track in Play Console.
- Add tester emails/group and distribute opt-in link.

## 4) Required Play Store Assets (Internal Testing Prep)
- App icon: **512 x 512 PNG** (32-bit, no alpha background per Play guidance).
- Feature graphic: **1024 x 500 PNG/JPG**.
- Phone screenshots: at least 2, recommended 1080 x 1920 or higher (16:9 or similar).
- Privacy policy URL: public HTTPS page.
- App category: likely **Health & Fitness** (confirm final category in console).
- Content rating questionnaire: complete in Play Console before wider rollout.
- App access declaration (if login required): provide test credentials/instructions for review phases.

Reference: Play listing and testing setup guidance on Play Console Help.

## 5) Firebase Auth Requirements for Android
- Add Android app in Firebase project.
- Register **SHA-1 and SHA-256** certificate fingerprints.
- Enable Google provider in Firebase Auth.
- Download updated `google-services.json` after SHA setup.
- Ensure correct OAuth client wiring (Android client + server/web client id where required by sign-in flow).
- Ensure authorized domains include required web domains for web fallback flows.

Reference: Firebase Auth Android Google Sign-In docs.

## 6) Google Play Billing Readiness (Subscription)
- Current code is **not ready** (stub implementation).
- Required setup:
  - Create subscription in Play Console (for example `bhumi_pro_monthly`).
  - Base plan: monthly recurring.
  - Price: **Rp50.000 / month**.
  - Trial config: define free trial in base plan (for example 7 days) and ensure app logic follows Play entitlement, not only local trial flags.
  - Handle purchase states: purchased, pending, canceled, grace period, account hold, restored.
  - Add server-side or secure client verification strategy for purchase token where feasible.

## 7) Internal Testing Checklist (Go/No-Go)
- Android app installs from internal testing link.
- Google login works on Android device.
- Setup and dashboard routes work after cold start and refresh/reopen.
- Protected routes accessible by correct role/plan.
- Subscription purchase + restore validated on test account.
- No blocker bugs in known bug tracker.

## 8) Risks and Mitigation
- Risk: Auth mismatch between web and Android clients.
  - Mitigation: complete SHA + OAuth setup early and verify with physical device.
- Risk: Billing regression due placeholder logic.
  - Mitigation: implement Play Billing before inviting broad testers.
- Risk: Policy metadata incomplete.
  - Mitigation: prepare privacy policy, data safety form, and rating before closed/open testing.

## 9) Immediate Next Actions
1. Initialize Capacitor + Android project.
2. Configure Firebase Android app (SHA-1/SHA-256 + `google-services.json`).
3. Implement real Google Play Billing integration replacing current stub.
4. Prepare Play assets and privacy policy URL.
5. Publish first `.aab` to Internal testing (up to 100 testers).
