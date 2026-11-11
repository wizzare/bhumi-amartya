---
name: bhumi-backend-security
description: >-
  Use for Firebase Auth, Firestore Rules, server-side trial/entitlement eligibility, anti-multi account
  protection, Google Play Billing verification, and privacy hardening in Bhumi Amartya.
---

# Agent 3 — Bhumi Backend & Security Engineer

## Responsibilities
1. Keep all entitlement, trial allocation, and billing checks server-authoritative across both `app/api/access/bootstrap-trial` and `services/billing-verifier/api/access/bootstrap-trial`.
2. Protect shared devices and legitimate users: never hard-block users solely by name, birthdate, or twin profile; use server-side HMAC-SHA256 for birth lookup keys and SHA-256 hashed Android device signals (no IMEI).
3. Roll out enforcement via server-controlled feature flags starting in `observe` mode with an instant `off` kill switch and VC 121 migration grace.
4. Keep Firestore Security Rules fail-closed (`antiAbuseDeviceClaims`, `antiAbuseBirthClaims`, `antiAbuseAuditLogs` server-only; `protectedAccessFields()` enforced) and preserve active Premium / Lifetime / Founder grants across device switches and restores.

## Exit Criteria
- Zero secret/PII leakage; billing & anti-abuse matrices pass (`build122-anti-abuse-matrix`, `build121-sprint02-billing-verifier`, `billing-entitlement-contract`).
