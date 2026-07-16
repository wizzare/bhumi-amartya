# Destructive Change Review

Each of the four tracked-file deletions in the working tree
was investigated against HEAD.

---

## 1. secure/bhumiamartya-adminsdk.json.json

- HEAD: PRESENT (git cat-file -e exit 0)
- Working tree: DELETED
- Classification: SECRET_REMOVAL
- Rationale:
  - File is a Firebase Admin SDK service-account credential.
  - Documented in BUILD70_ADMIN_RECOVERY.md and BUILD70_WEB_FILE_CLEANUP_REPORT.md
    as web-only (used by web CMS APIs and Firebase Functions).
  - Android production pipeline does not consume this file.
  - Removing it from HEAD tracking is a security improvement.
- Importers/runtime impact in Android: NONE (documented audit).
- Proposed handling: include as ISOLATED security commit, NOT mixed
  into feature commit groups. Commit message suggestion:
  `security(repo): remove tracked Firebase admin credential`
- Founder decision required before inclusion.

---

## 2. src/app/founder/page.tsx

- HEAD: PRESENT
- Working tree: DELETED
- Classification: APPROVED_REPLACEMENT
- Rationale:
  - Documented in BUILD70_WEB_FILE_CLEANUP_REPORT.md
    and BUILD70_ADMIN_RECOVERY.md as web-only Founder content
    management dashboard (article editing, e-book PDF management).
  - Documented in BUILD70_BACKEND_DEPENDENCY_AUDIT.md
    as not used by Android.
  - File exists only in web/Next.js path. Android does not import it.
- Runtime impact on Android: NONE.
- Proposed handling: include deletion in a web-cleanup commit
  (Founder approval required) — or keep excluded for safety.
- Safest default: EXCLUDE from feature commit; isolate in dedicated
  cleanup commit if Founder approves.

---

## 3. app/api/humandesign/calculate/route.ts

- HEAD: PRESENT
- Working tree: DELETED
- Classification: APPROVED_REPLACEMENT
- Rationale:
  - Next.js dev/web-only fallback route.
  - Production Android client uses
    `NEXT_PUBLIC_HUMAN_DESIGN_API_URL` env var pointing to the
    Cloud Run HTTPS endpoint (FastAPI service
    services/humandesign-api/main.py v4.0.0, engine gaia-hd-v1).
  - Documented in HD_ARCHITECTURE_RECOMMENDATION.md,
    BUILD70_WEB_FILE_CLEANUP_REPORT.md,
    BUILD70_BACKEND_DEPENDENCY_AUDIT.md.
  - Canonical FastAPI service confirmed present
    (services/humandesign-api/main.py exists in working tree).
- Runtime impact on production Android: NONE.
- Dev/web fallback: removed (acceptable for production).
- Proposed handling: include deletion in web-cleanup commit,
  or EXCLUDE for safety. Safest default: EXCLUDE.

---

## 4. lib/founder/founderMetrics.ts

- HEAD: PRESENT
- Working tree: DELETED (1-line deletion)
- Classification: APPROVED_REPLACEMENT
- Rationale:
  - Documented in BUILD70_WEB_FILE_CLEANUP_REPORT.md and
    BUILD70_BACKEND_DEPENDENCY_AUDIT.md as web-only Founder
    metrics compiler.
  - Not used by Android runtime.
- Runtime impact on Android: NONE.
- Proposed handling: include deletion in web-cleanup commit,
  or EXCLUDE for safety. Safest default: EXCLUDE.

---

## Default recommendation
None of these destructive deletions should be mixed into the
eleven-system / wellness / journey V4 commit groups.

Two safe disposition paths:
A. EXCLUDE all four destructive deletions from the checkpoint
   and leave them in the working tree as further Founder review.
B. ISOLATE all four into a single, separate commit:
   `chore(build70): remove web-only routes, pages, and credentials`
   AFTER independent Founder approval of the web-cleanup intent.

This preparation chooses path A (exclude by default) to keep
the checkpoint narrow and reviewable.