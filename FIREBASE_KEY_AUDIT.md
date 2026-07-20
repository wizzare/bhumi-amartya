# Firebase Service Account Key Consumer Audit

| Consumer | Current Auth Method | Old Key Dependency | Runtime Critical | Required Change |
| :--- | :--- | :--- | :--- | :--- |
| scripts/cleanup-pre-july20-inbox.mjs | Hardcoded SA_PATH (Downloads) | YES | NO (Script inactive) | Update path or use Env |
| scripts/activate-v64-force-update-admin.js | require("../secure/...") | YES | NO (Admin tool) | Update path or use Env |
| scripts/check_widhi_hd.js | require("../bhumi-service-account.json") | YES | NO (Debug tool) | Update path or use Env |
| scripts/auditProfileDirect.js | .env.local (FIREBASE_SERVICE_ACCOUNT) | YES | NO (Audit tool) | Rotate value in .env.local |
| services/billing-verifier/lib/firebaseAdmin.ts | FIREBASE_SERVICE_ACCOUNT (Env) | YES | YES (Production) | Rotate Vercel/Local Env Var |

## Migration Steps:
1. Create new key for same service account in Firebase Console.
2. Store outside repository (e.g., `~/.bhumi/` or secure vault).
3. Set `GOOGLE_APPLICATION_CREDENTIALS` or rotate `FIREBASE_SERVICE_ACCOUNT` env-based auth.
4. Update hardcoded paths in scripts to use environment variables where possible.
5. Validate Admin SDK read-only access.
6. Disable old key in Google Cloud Console.
7. Verify all consumers work with the new key.
8. Delete old key after 24h stability period.
