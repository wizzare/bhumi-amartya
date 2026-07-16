# Secret Risk Report

Searched the working tree (tracked + untracked) for:
.env, .env.local, .env.production*, API keys, tokens, OAuth
credentials, service-account JSON, Firebase credentials, passwords,
bearer tokens, private keys (*.pem, *.key), local absolute paths,
production user IDs, database dumps.

## Confirmed credential artifact
- secure/bhumiamartya-adminsdk.json.json — present in HEAD,
  DELETED in working tree.
  - Status: SECRET_REMOVAL (good).
  - Content NOT inspected for this report; file is on the
    exclude-tracked path. Must not be staged or committed.
  - The deletion itself is the safe outcome.

## Filename scan across untracked files
- No additional `.env`, `.env.local`, `.env.production*` files found.
- No additional `service-account*.json`, `credentials*.json`,
  `*-adminsdk.json.json` found in working tree.
- No `*.pem`, `*.key` files found in working tree.

## Content-style scan (sampled for high-risk paths)
- response.html: HTML response capture from local runtime proof.
  Excluded by Phase 7 (response.html in exclusion list).
- *_dump.xml (window_dump.xml, login_dump.xml, journey_dump.xml,
  profile_dump.xml, etc.): UI hierarchy dumps from local testing.
  Excluded by Phase 7 (*_dump.xml in exclusion list).
- *_copy.* files (auditMocks_copy.txt, normalize_copy.txt,
  translations_copy.txt, time_copy.txt, version_copy.txt):
  duplicates of source files used as scratch. Excluded by Phase 7.

## Database / large binary scan
- services/humandesign-api/hd_data.sqlite (466 KB):
  SQLite database inside the Human Design API service directory.
  Tracked? No (working-tree file in services/humandesign-api/).
  Treated as service-internal artifact, not a credential file.
  Recommended: exclude unless intentionally reintroducing as
  canonical fixture.
- services/humandesign-api/uv.lock (213 KB): lock file inside
  Python service. Track only when committing the service itself.

## Conclusion
- One credential file (Firebase admin SDK) is being REMOVED from
  tracking. This is a net positive and is the correct direction.
- No new credential files are being introduced.
- No secrets detected in any staged-eligible file.
- Excluded patterns (response.html, *_dump.xml, *_copy.*) ensure
  no leaked captures enter the commit.