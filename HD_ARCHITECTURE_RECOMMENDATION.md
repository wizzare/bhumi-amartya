# Human Design Verified Engine Architecture Recommendation

Date: 2026-06-06

Status: architecture recommendation only. No implementation in this phase.

## Goal

Replace the current Human Design fallback approximation with a verifiable architecture that works for:

- Android APK
- Web
- Future iOS
- Production deployment without `localhost`
- Production deployment without relying on internal Next.js API routes from mobile

Required chart fields:

- Type
- Strategy
- Authority
- Profile
- Gates
- Channels
- Centers
- Incarnation Cross

## Existing HD Paths

### 1. `hdkitAdapter`

Source:

- `lib/humandesign/hdkitAdapter.ts`
- bundled files under `lib/humandesign/hdkit*`

Current behavior:

- `calculateWithHdkit()` always returns pending.
- Code note says the included `hdkit-main.zip` does not provide an installable root package or exported calculator.
- Existing normalizer can map a bodygraph-like response into app shape, but no real local calculator is available.

Strengths:

- Could normalize a complete bodygraph if a real hdkit output existed.
- No external API cost if a full engine were available and licensed.

Weaknesses:

- Not currently a working engine.
- Browser sample depends on remote ephemeris JSON.
- Node sample requires Swiss Ephemeris/runtime assets.
- High risk of licensing/runtime complexity.

Verdict:

Do not use as Bhumi V1 verified engine. Keep only as a normalization reference if useful.

### 2. Python Service

Sources:

- `services/humandesign-api/main.py`
- `app/api/humandesign/calculate/route.ts`

Current behavior:

- FastAPI service exposes `POST /calculate`.
- Uses `humandesign.features.calc_single_hd_features`.
- Uses `utc_offset`.
- Next route points to `http://localhost:8000/calculate`.

Current output fields:

- Type
- Profile
- Authority
- Strategy
- Not-self theme
- Signature
- Defined centers
- Open centers
- Personality gates
- Design gates

Missing or incomplete for V1 requirement:

- Channels
- Incarnation Cross
- Possibly normalized center names/shape matching app `HumanDesignChart`
- Explicit calculation metadata and versioning

Strengths:

- Already present in repo.
- Uses a dedicated HD library and data file.
- Dockerfile exists, so it can be hosted.
- Likely lower per-call cost than paid provider if self-hosted.

Weaknesses:

- Current Next integration uses `localhost`, not production compatible.
- License files include AGPL/commercial notices; legal/product usage must be clarified before production.
- Requires Python hosting and operational ownership.
- Needs extension to return channels and incarnation cross.
- Accuracy must be validated against known authoritative charts.

Verdict:

Promising as a controlled backend only if license is cleared and output is expanded. Not ready as-is for V1 verified production.

### 3. Human Design Hub

Source:

- `app/api/humandesign/bodygraph/route.ts`

Current behavior:

- Calls `https://api.humandesignhub.app/v1/bodygraph`.
- Uses `HUMAN_DESIGN_HUB_API_KEY`.
- Builds `datetime = birthDate + birthTime + timezone`.
- Current response parser only extracts type.

Strengths:

- External provider avoids maintaining ephemeris/math engine.
- Natural fit for Android/Web/iOS if called through a secure backend proxy.
- Potentially returns full bodygraph when `verbose: true`.
- Lowest engineering risk if provider response includes all required fields.

Weaknesses:

- API cost and vendor dependency.
- Current adapter only reads type.
- Provider contract, quotas, uptime, privacy, and terms must be reviewed.
- Needs backend proxy; mobile must not hold API key.

Verdict:

Best candidate for Bhumi V1 if provider supports all required fields.

### 4. Local Fallback

Sources:

- `lib/humandesign/calculateHumanDesign.ts`
- `lib/humandesign/calculateHumanDesignType.ts`

Current behavior:

- Uses `astronomy-engine` to estimate planetary gates.
- Uses static gates/channels/centers and type heuristic.
- Returns `status: "needs_verified_engine"`, `source: "fallback_approximation"`, `accuracy: "approximate"`.

Strengths:

- Offline.
- No API cost.
- Useful as a degraded internal placeholder.

Weaknesses:

- Not authoritative.
- Does not return complete chart.
- Does not reliably match external calculators.
- Should not drive confident personalization.

Verdict:

Keep only as non-authoritative fallback/diagnostic. Do not use as V1 verified engine.

## Comparison Matrix

| Path | Accuracy | Android | Web | iOS | Maintenance | API Cost | Required fields |
| --- | --- | --- | --- | --- | --- | --- | --- |
| hdkitAdapter | Not working | Poor unless bundled engine fixed | Poor | Poor | High | Low | No |
| Python service via localhost | Potentially good, unverified | No | Dev only | No | Medium/high | Low infra cost | Partial |
| Python service hosted | Potentially good after validation | Yes | Yes | Yes | Medium/high | Infra cost | Partial until extended |
| Human Design Hub direct from client | Potentially good | Bad, exposes key | Bad, exposes key | Bad, exposes key | Low | Provider cost | Unknown until contract mapped |
| Human Design Hub via backend proxy | Potentially good | Yes | Yes | Yes | Low/medium | Provider cost | Likely, must confirm |
| Local fallback | Approximate | Yes | Yes | Yes | Medium | Low | No |

## Recommended Architecture for Bhumi V1

Use a hosted Human Design Calculation Backend as the single source of truth, deployed outside Next.js and consumed by Android, Web, and future iOS.

Recommended stack:

1. Firebase HTTPS Callable Function or Cloud Run HTTPS service as `bhumi-hd-service`.
2. Backend service calls Human Design Hub first.
3. Backend normalizes provider response into Bhumi `HumanDesignChart`.
4. Backend stores calculation metadata:
   - `source: "human-design-hub"`
   - `accuracy: "verified"`
   - `engineVersion`
   - `providerVersion` if available
   - `calculatedAt`
   - `inputHash`
5. Optional later fallback: hosted Python service only after license clearance, validation, and full output expansion.

Preferred deployment choice:

- V1 fastest and safest: Firebase HTTPS Function wrapping Human Design Hub.
- If Python self-hosting becomes necessary: Cloud Run service for Python, called by Firebase/Next/web through the same public backend contract.

Why this is the recommendation:

- Android APK compatible: mobile calls HTTPS backend, not `/api` and not `localhost`.
- Web compatible: same HTTPS backend contract.
- Future iOS compatible: same HTTPS backend contract.
- API key stays server-side.
- No internal Next.js route dependency.
- Provider maintenance cost is lower than maintaining ephemeris and HD rules internally.
- A single normalized response prevents different platforms from calculating different charts.

## Target Contract

Endpoint:

`POST https://<bhumi-backend>/human-design/calculate`

Input:

```json
{
  "birthDate": "1987-06-09",
  "birthTime": "09:00",
  "birthCity": "Bangil",
  "birthCountry": "Indonesia",
  "timezone": "+07:00",
  "latitude": -7.5995,
  "longitude": 112.8186
}
```

Output:

```json
{
  "type": "Manifestor",
  "strategy": "Inform Before Action",
  "authority": "Emotional",
  "profile": "x/x",
  "definition": "Single Definition",
  "incarnationCross": {
    "name": "Right Angle Cross ...",
    "gates": [20, 34, 57, 10]
  },
  "centers": {
    "head": false,
    "ajna": false,
    "throat": true,
    "g": true,
    "ego": false,
    "spleen": true,
    "sacral": false,
    "solarPlexus": true,
    "root": true
  },
  "gates": [10, 20, 34, 57],
  "channels": ["20-57"],
  "variables": null,
  "digestion": null,
  "cognition": null,
  "motivation": null,
  "environment": null,
  "status": "verified",
  "source": "human-design-hub",
  "accuracy": "verified",
  "calculationStatus": "completed",
  "engineVersion": "bhumi-hd-v1",
  "calculatedAt": "2026-06-06T00:00:00.000Z"
}
```

Note: exact values above are contract shape examples, not asserted chart results.

## Migration Path From Current Fallback

Phase 0: Contract and validation

- Confirm Human Design Hub response includes Type, Strategy, Authority, Profile, Gates, Channels, Centers, Incarnation Cross.
- Build a normalizer that maps provider fields to `HumanDesignChart`.
- Create a fixed validation dataset with known charts from at least two external calculators.

Phase 1: Backend service

- Create Firebase Function or Cloud Run endpoint.
- Store provider API key in server secret manager.
- Add request validation.
- Add cache by input hash to reduce API cost.
- Return normalized `HumanDesignChart`.

Phase 2: App integration

- Update `generateBlueprint` to call backend service.
- Keep local fallback only when backend fails, marked approximate.
- Prevent approximate HD from being used as verified identity in daily guidance.

Phase 3: Data migration

- Find existing blueprints where:
  - `humanDesign.source === "fallback_approximation"`
  - or `humanDesign.accuracy === "approximate"`
  - or `humanDesign.status === "needs_verified_engine"`
- Queue recalculation after user opens dashboard or via admin batch.
- Save verified result with `source`, `accuracy`, `engineVersion`, and `calculatedAt`.

Phase 4: Rollout

- Internal test with known charts.
- Beta tester recalculation for the Bangil case.
- Enable for new signups.
- Backfill active beta users.
- Monitor failure rate and provider latency.

## Estimated Implementation Effort

| Work item | Estimate |
| --- | --- |
| Provider contract discovery and response mapping | 0.5-1 day |
| Firebase Function or Cloud Run endpoint | 1-2 days |
| Secret management, validation, cache/input hash | 0.5-1 day |
| App integration in blueprint generation | 0.5-1 day |
| Existing blueprint backfill flow | 1-2 days |
| Validation dataset and regression script | 0.5-1 day |
| Production monitoring/error handling | 0.5 day |

Total estimate:

- Fast provider-backed V1: 4-7 engineering days.
- Self-hosted Python path with license review and full field expansion: 7-14+ engineering days plus legal/validation time.

## Risks

P0:

- Provider may not return all required fields.
- Provider output may disagree with user's reference calculator.
- Existing approximate HD might continue influencing user text if not gated.

P1:

- Timezone and location quality can still produce wrong charts if city selection lacks true timezone.
- Birth time precision and historical timezone handling are not yet robust.

P2:

- Vendor API cost or quota limits.
- Provider downtime.
- Data privacy and terms review needed before sending birth data.

P3:

- Backfill UX: users may see changed HD result after verification.
- Need admin support tooling to inspect HD source/accuracy.

## Rollout Plan

1. Keep current fallback marked approximate.
2. Add verified backend behind feature flag.
3. Validate provider results with fixed dataset.
4. Enable backend for internal users.
5. Recalculate beta tester Bangil case.
6. Enable backend for new users.
7. Backfill existing approximate charts.
8. Disable any UI or guidance logic that treats approximate HD as verified.
9. Add monitoring:
   - provider status
   - latency
   - calculation failures
   - cache hit rate
   - mismatch reports

## Final Recommendation

Bhumi V1 should use a Firebase HTTPS Function or Cloud Run HTTPS service as the only Human Design calculation endpoint, with Human Design Hub as the first verified provider if its response contract covers all required fields.

Do not use:

- Client-side provider calls
- Internal Next.js `/api` as the mobile dependency
- `localhost`
- Local fallback as verified result
- Current hdkit bundle as production engine

Keep the Python service as a secondary research path only after license clearance and extension to channels/incarnation cross.
