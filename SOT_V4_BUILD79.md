# Source of Truth: Bhumi Amartya V4 Build 79 FINAL

**Status:** Canonical V4 FINAL Baseline
**Product:** Bhumi Amartya Platform
**Target Release:** Version 4.4.4 (Build 79 — 444 The Builder)
**Current Branch:** `hotfix/v4-build78-wellness-journey-sync`

---

## 1. FOUNDER DECISION: INBOX CLEANUP
- **Inbox cleanup:** REMOVED FROM SCOPE BY FOUNDER DECISION
- **Cleanup dry-run:** NOT REQUIRED
- **Cleanup execute:** NOT REQUIRED
- **Firestore quota:** NOT A BUILD 79 BLOCKER
- Do NOT delete Inbox messages created before 20 July 2026.
- Existing Inbox messages remain untouched.

## 2. REPOSITORY & SECURITY
- **Firebase Key Rotation:** READY (Audit complete)
- **Credential Deletion:** secure/bhumiamartya-adminsdk.json.json (REMOVED)
- **Security Hardening:** .gitignore updated to exclude secure/ and *adminsdk*.json

## 3. ANDROID METADATA
- **versionCode:** 79
- **versionName:** "4.4.4"

## 4. CONFIRMED STATUS
- Inbox query/index: PASS
- Inbox list: PASS
- Inbox long-message modal: PASS
- Journey Share Cards: PASS
- Human Design timeout: PASS
- HD suite: 11/11 PASS
- HOTFIX-011: 24/24 PASS
- HOTFIX-017: 41/41 PASS
- TypeScript: PASS
- Recovery lint: PASS
- Production Inbox cleanup: REMOVED FROM SCOPE
- Firebase service-account key exposure: OPEN (Mitigation in progress)
- Android metadata: ALIGNED (79 / 4.4.4)
- Working tree: IN RECONCILIATION
- Profile missing-HD browser verification: PENDING
