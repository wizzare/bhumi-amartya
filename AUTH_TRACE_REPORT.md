# Forensic Audit: Google Authentication Trace

| File | Line | Value | Purpose |
| :--- | :--- | :--- | :--- |
| `lib/auth/authActions.ts` | 92 | `59259824153-vldlev9s91l6sss3ulqbh8mnaah4n4c9.apps.googleusercontent.com` | Hardcoded Web Client ID passed to native `signInWithGoogle` |
| `google-services.json` | 44 | `59259824153-vldlev9s91l6sss3ulqbh8mnaah4n4c9.apps.googleusercontent.com` | Primary Web Client ID (`client_type: 3`) |
| `google-services.json` | 57 | `59259824153-lf1aej0rshgaidnvs209671sg42efnp3.apps.googleusercontent.com` | Secondary Web Client ID (`appinvite_service`) |
| `GoogleAuthProviderHandler.java` | 277 | `call.getString("webClientId")` | serverClientId used in `GetGoogleIdOption` |
| `GoogleAuthProviderHandler.java` | 283 | `.setFilterByAuthorizedAccounts(false)` | Disables filtering to force account picker |
| `GoogleAuthProviderHandler.java` | 311 | `pluginImplementation.getPlugin().getContext().getString(R.string.default_web_client_id)` | Native fallback for serverClientId |
| `capacitor.config.ts` | 13 | N/A | Plugin config (currently missing `webClientId`) |

### Key Findings
1. The `webClientId` sent from the frontend matches the primary Web Client ID in `google-services.json`.
2. The native Android layer is patched to accept this `webClientId` and correctly configures the Credential Manager with `setFilterByAuthorizedAccounts(false)`.
3. The error "No credentials available" persists despite these settings.

### Conclusion
The client ID sent to Google is `59259824153-vldlev9s91l6sss3ulqbh8mnaah4n4c9.apps.googleusercontent.com`.
This ID is recognized by Firebase as the Web Client ID for the project.
The failure likely lies in the signature verification (SHA-1) or a mismatch between the Android Client ID and the Web Client ID in the Google Cloud project.
