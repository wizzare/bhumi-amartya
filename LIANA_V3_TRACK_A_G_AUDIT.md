# LIANA V3 Track A-G Audit

Status: LIANA V3 RC stabilization reference. No new calculation engine. No KARA structure change. No redesign.

## LIANA V3 RC Current Queue

* Tracks A-G: CLOSED.
* Share Card Sync: CLOSED.
* Anda -> kamu audit: CLOSED.
* Feature 01 Kondisi Lingkungan: ACTIVE.
* Catatan Hari Ini structure restore to 8 sections: PASS / Founder QA accepted.
* Dashboard Guidance Quality / Refleksi Jiwa + Catatan Hari Ini grounding fix: ACTIVE.
* Daily Guidance cache invalidation after grounding fix: ACTIVE.
* Journey Persistence / Daily Theme / Wellness Readback: CODE FIXED, internal verification passed, staged QA passed, Play Store validation later.
* Next after Feature 01 and Catatan 8-section restore: Dashboard Guidance Quality, then Wellness Runtime Validation.
* Google Play Billing / Monetization: PRIORITY 4 backlog only. No runtime billing implementation before core stability and production readiness.

## Implementation Status

* Track A: COMPLETE
  * Remaining user-facing `Anda` copy in app/lib/components was changed to `kamu/dirimu`.
  * Profile area remains clean.
* Track B: COMPLETE
  * Daily personalization now receives expanded 8-system `unifiedBlueprint.fullBlueprint` context.
  * Refleksi Jiwa, Catatan Hari Ini, and Manifestasi prompts now explicitly use available 8-system differentiators while hiding raw technical labels.
* Track C: COMPLETE
  * Available underused fields from Vedic, Tzolkin, Weton, BaZi, Destiny Matrix, and Natal were routed into daily synthesis and/or Gaia normalization.
* Track D: COMPLETE
  * Founder QA passed for Blueprint utilization across Life Path, Human Design, Destiny Matrix, Natal, Vedic, Weton, BaZi, and Tzolkin.
* Track E: COMPLETE
  * `CanonicalTranslatorService`, `HumanMeaningService`, and `ProfileRuntimeAdapter` now include a Soul Identity translation path.
* Track F: COMPLETE
  * Gudang Identitas now exposes Soul Mission, Soul Gifts, Soul Lessons, Soul Shadow, and Soul Archetype through existing profile runtime sections.
* Track G: COMPLETE
  * Runtime, UI, Founder QA, representative user testing, regression, and final closure are complete.

## Track A - Stabilization

Complete / already covered in Sprint 1:

* Identity Hydration: dashboard `CoreIdentity` reads 8 core stats from blueprint/profile hydration.
* Wellness Save Fix: Yoga and Workout save flows use database/detail fallback before saving.
* Share Card Sync: Share Card receives daily guidance and dynamic Gaia insights.
* Readability: dashboard reminder copy is humanized.
* UI Consistency: no dashboard/profile redesign required for this audit.
* Anda -> Kamu Audit:
  * `app/profile`, `components/profile`, and `lib/profile` have no remaining user-facing `Anda`.
  * Global remaining `Anda` exists outside profile in older engines:
    * `lib/services/auraResultGenerator.ts`
    * `lib/engines/generateAstroInsight.ts`
    * `lib/engines/generateHealingRecommendation.ts`

Needs follow-up:

* Law of Affirmation Sync exists in daily guidance, Share Card, Manifestasi page, and local fallback, but wording consistency should be cleaned as a focused copy pass later.

## Track B - Personalization

Current sources:

* Refleksi Jiwa: driven by `buildDailyGuidancePrompt`, `buildBhumiSoulMirrorPrompt`, and `buildUnifiedBlueprintSynthesis`.
* Catatan Hari Ini: driven by daily guidance categories, astro house activations, current sky, wellness mapping, and journey memory.
* Manifestasi Hari Ini: driven by `buildBhumiManifestationPrompt`, daily guidance `manifestation`, and local fallback `generateLocalManifestation`.
* Companion Consistency: prompt already enforces Companion voice for dashboard and Coach/Navigator for wellness.

Gap:

* `unifiedBlueprint.fullBlueprint` currently exposes Life Path, Human Design, Destiny Matrix, and Natal Chart as first-class daily guidance objects.
* Vedic, Tzolkin, Weton, and BaZi are stored in blueprint and visible on blueprint pages, but are not first-class in daily guidance synthesis.

Allowed next step:

* Extend the existing synthesis/mapping layer to include stored Vedic, Tzolkin, Weton, and BaZi fields.
* Do not create new calculators.

## Track C - KARA Asset Maximization

### Life Path

Used:

* Dashboard CoreIdentity stat.
* Profile Gaia normalization.
* Daily guidance practice themes and archetypes.
* Blueprint numerology page.

Underused:

* Birth day, attitude, maturity, pinnacles, challenges, expression, soul urge, personality are collected or derivable in synthesis but not consistently surfaced in Gudang Identitas.

### Human Design

Used:

* Dashboard CoreIdentity stat, with canonical validation.
* Daily guidance themes: type, authority, strategy, profile, gates/channels where available.
* Gaia profile normalization: type, authority, definition, profile, channels, centers, cognition, digestion, motivation, environment, variables.
* Profile meaning: authority, strategy, vitality, body mechanics.

Underused:

* Incarnation Cross, variables, perspective, motivation, gates/channels are not consistently turned into user-facing profile cards.

### Destiny Matrix

Used:

* Dashboard arcana stat.
* Profile runtime: purpose, shadow, ancestral legacy, talents, wealth flow, relationship pattern.
* Gaia normalization: moneyLine, loveLine, karmicTail, motherLine, fatherLine, ancestorLine, talentsGreat, talentsFather, talentsMother, health/chakra.
* Profile V2 tabs: soulMission, greatestPotential, repeatingPatterns, innerChild, ancestorKarma, moneyAndWork, loveAndRelationships.

Underused:

* `soulSignature` is not present in `DestinyMatrixBlueprint`.
* `soulMission`, `greatestPotential`, and `innerChild` exist as translated narratives in Profile V2, not as raw KARA fields.

### Natal Chart

Used:

* Dashboard sun sign.
* Daily guidance: sun, moon, ascendant, MC, Venus, Saturn, nodes, Chiron, elements, modalities, aspects, patterns.
* Gaia normalization: Sun, Moon, Venus, Mercury, Mars, Saturn, Jupiter, nodes, Uranus, Neptune, Pluto, Chiron, Lilith, Midheaven, modalities, elements.
* Profile canonical meaning: identity, emotional needs, triggers, love language, soul lesson.

Underused:

* Chiron, Lilith, patterns, dominance, house placements are normalized but not consistently visible in Gudang Identitas or daily manifestation/reflection output.

### Vedic

Used:

* Blueprint page displays lagna, moon sign, sun sign, nakshatra, pada, atmakaraka, darakaraka, dasha, planetary strength, yogas, dharma/artha/kama/moksha, styles, summary.
* Canonical translator uses Vedic challenges, Rahu/Ketu, dasha, atmakaraka, darakaraka, major yogas, spiritualStyle, relationshipStyle, careerStyle.

Underused:

* `nakshatra`, `dharmaFocus`, and `mokshaFocus` are not included in Gaia normalization or unified daily guidance as first-class signals.

### Tzolkin

Used:

* Blueprint page displays kin, kinName, solarSeal, galacticTone, wavespell, castle, color, oracle, GAP, strengths/challenges/styles/purpose, summary.
* Canonical translator uses Tzolkin lifePurpose, growthStyle, relationshipStyle, occult seal, occult tone lesson.

Underused:

* `solarSeal.gift`, `solarSeal.challenge`, `galacticTone.gift`, `galacticTone.lesson`, `galacticTone.shadow`, `castle`, `color`, and kin narrative are not included in Gaia normalization or daily guidance as first-class signals.
* Track D uses `solarSeal.shadow`, but the actual model field is `solarSeal.challenge`.

### Weton

Used:

* Dashboard CoreIdentity stat.
* Blueprint Weton page: day, pasaran, neptu, wuku, pranata mangsa, watak, strengths, challenges, lifeMission, relationshipStyle, workStyle, moneyStyle.

Underused:

* Not included in canonical translator, Gaia normalization, profile runtime, or daily guidance synthesis.

### BaZi

Used:

* Dashboard day master stat.
* Blueprint BaZi page: four pillars, day master, five elements, ten gods, luck pillars, strengths, challenges, careerStyle, relationshipStyle, moneyStyle, lifeMission.
* Canonical translator uses day master element, fiveElements, favorable/unfavorable elements, tenGods, careerStyle, relationshipStyle, moneyStyle, lifeMission.

Underused:

* Not included in `unifiedBlueprint.fullBlueprint` as a first-class daily guidance object.
* Not included in Gaia normalization as source `bazi`; only some concepts overlap through elements.

## Track D - Blueprint Utilization Expansion

Ready from existing data:

* Destiny Matrix: talentsGreat, moneyLine, loveLine, karmicTail, motherLine, fatherLine, ancestorLine, chakra/health.
* Tzolkin: solarSeal.gift, solarSeal.challenge, galacticTone.gift, galacticTone.lesson, galacticTone.shadow, castle, color, kinName, summary.
* Vedic: nakshatra, dharmaFocus, mokshaFocus, atmakaraka, darakaraka, dasha, yogas.
* Natal: Chiron, Lilith, aspects, patterns, dominance, house placements.

Requires mapping/narrative, not calculation:

* Destiny Matrix `soulMission`, `greatestPotential`, `innerChild` should be consumed from existing translated profile sections or generated from existing Destiny Matrix numbers.
* `soulSignature` is missing as a stored field and should not be invented without a clear mapping spec.

## Track E - Human Meaning Expansion

Pipeline:

* `CanonicalTranslatorService`: converts raw blueprint to canonical domains.
* `HumanMeaningService`: converts canonical domains to human narratives.
* `ProfileRuntimeAdapter`: turns human narratives into 8 Gudang Identitas sections.

Current strength:

* The pipeline already supports identity, purpose, energy, shadow, talents, relationships, timing, health, and spirituality.

Main gap:

* Canonical domains do not yet include the full 8-system LIANA surface.
* Tzolkin, Vedic, Weton, and BaZi are partially used or absent.

Allowed next step:

* Add non-breaking optional canonical fields or enrich `HumanMeaningService` from existing blueprint data upstream.
* Preserve KARA raw structure.

## Track F - Soul Identity Enrichment

Requested output can be built from existing data:

* Soul Mission:
  * Life Path role, Destiny Matrix purpose/center, Vedic dharmaFocus, Tzolkin lifePurpose, BaZi lifeMission.
* Soul Gifts:
  * Life Path strengths, Destiny talentsGreat, Tzolkin solarSeal.gift, galacticTone.gift, Vedic strengths/yogas, HD channels/gates, Natal supportive aspects.
* Soul Lessons:
  * Tzolkin galacticTone.lesson, Vedic challenges, Natal nodes/Chiron, Destiny karmicTail, HD not-self/open centers.
* Soul Shadow:
  * Destiny karmicTail, Natal Chiron/Lilith/Pluto/South Node, HD not-self/open centers, Tzolkin solarSeal.challenge/galacticTone.shadow.
* Soul Archetype:
  * Existing Life Path archetypes, HD type/profile, Destiny arcanaCenter, Natal Sun/Moon/ASC, Tzolkin seal/tone.

Constraint:

* Build as synthesis/narrative layer only.
* No new calculation engine.
* No KARA flow change.

## Track G - Soul Resonance Layer

Search result:

* No repository dataset/protocol found for Starseed resonance labels:
  * Sirius, Pleiades, Arcturus, Andromeda, Orion, Lyran, Hybrid Resonance.
* No repository dataset/protocol found for civilization resonance labels:
  * Atlantis, Lemuria, Mu, Ancient Egypt, Avalon, Shambhala.
* Existing terms only appear as generic "resonansi/beresonansi" copy, not as a structured dataset.

Feasibility:

* Possible as a future mapping/narrative layer from existing KARA systems only if a mapping protocol is provided.
* Existing fields that could support a mapping layer:
  * Human Design: type, authority, centers, gates/channels, variables, incarnation cross.
  * Destiny Matrix: arcana center, talents, karmic tail, family lines, chakra/health matrix.
  * Natal: outer planets, nodes, Chiron, Lilith, elements, aspects, patterns.
  * Vedic: nakshatra, atmakaraka, moksha/dharma focus, yogas, dasha.
  * Tzolkin: solar seal, tone, castle, color, oracle, GAP.
  * Life Path, Weton, BaZi: grounding, ancestral, element, mission, work/relationship styles.

Blocked:

* Do not implement Starseed or civilization labels until a dataset/protocol exists.
* Do not invent Lemurian or Atlantis mappings.

## Recommended Next Implementation Order

1. Track A cleanup: global `Anda` copy pass in non-profile legacy engines.
2. Track B/D: extend `unifiedBlueprint.fullBlueprint` with Vedic, Tzolkin, Weton, BaZi from stored blueprint data.
3. Track E: enrich `CanonicalTranslatorService` and `HumanMeaningService` with optional existing fields only.
4. Track F: add Soul Identity narrative layer from existing 8-system data.
5. Track G: wait for explicit mapping protocol/dataset before implementation.

## PRIORITY 4 - MONETIZATION & PRODUCTION GROWTH

### Google Play Billing & Monetization Foundation

Status:

BACKLOG / POST-PRODUCTION ACCESS

Policy basis:

Google Play Billing is required for in-app purchases of digital goods and services distributed through Google Play. Google Play Billing supports digital products, one-time purchases, and subscriptions.

Official references:

* Google Play Billing overview: https://developer.android.com/google/play/billing
* Google Play payments policy: https://support.google.com/googleplay/android-developer/answer/10281818
* Google Play payouts: https://support.google.com/googleplay/android-developer/answer/137997

Execution rule:

Do not implement billing before:

1. Production access is approved.
2. Current LIANA stabilization bugs are resolved.
3. First production release is stable as a free app.
4. Billing has been documented, reviewed, and tested on non-production tracks.

Scope:

Implement Google Play Billing only for digital products consumed or unlocked inside the app.

Billing-required product examples:

1. Premium monthly/yearly subscription.
2. Unlock premium in-app features.
3. Paid meditation/audio healing content inside the app.
4. Paid digital reflection/journaling modules inside the app.
5. Any in-app digital unlock, token, or premium access.

Outside Play Billing / off-app service examples:

1. Manual PDF blueprint reading via WhatsApp/form.
2. 1:1 consultation or coaching via WhatsApp/Zoom.
3. Human-delivered advisory service outside the app.
4. Off-app donation, as long as it does not unlock digital in-app content.

Implementation TODO:

1. Set up Play Console merchant/payment profile.
2. Add and verify bank payout account.
3. Complete tax information if requested by Google.
4. Define monetization model: subscription product, one-time in-app product, and free vs premium feature boundary.
5. Create products/subscriptions in Play Console.
6. Integrate Google Play Billing Library.
7. Implement purchase flow.
8. Validate purchase token securely.
9. Unlock entitlement only after valid purchase.
10. Handle subscription lifecycle: active, renewal, grace period if applicable, canceled, expired, refunded, chargeback.
11. Add restore purchase behavior.
12. Add clear premium state in user profile/account.
13. Add payout tracking notes: transactions/refunds/chargebacks from the 1st to end of month are generally paid around the 15th of the following month.
14. Test billing on internal/closed testing track before production rollout.
15. Do not expose paid features until billing behavior is verified.

Guardrails:

* Do not redesign the app.
* Do not alter KARA behavior.
* Do not add a new payment provider for in-app digital goods.
* Do not route in-app digital unlocks to WhatsApp, bank transfer, donation, or external payment links.
* Do not mix manual services and in-app digital products in the same entitlement logic.
* Do not make billing a blocker for the first production release.
* Keep app free first until production access and stabilization are complete.
