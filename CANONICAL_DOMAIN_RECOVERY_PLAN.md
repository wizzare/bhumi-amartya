# CANONICAL DOMAIN RECOVERY PLAN

## 1. Missing Canonical Fields

To satisfy the `PROFILE_V4_FINAL_IDENTITY_WAREHOUSE.md`, the `CanonicalIdentity` interface must be expanded with two new domains:

### `CanonicalHealthDomain`
- `chakraMatrix` (from Destiny Matrix)
- `hdDigestion` (from Human Design)
- `hdEnvironment` (from Human Design)
- `hdType` (from Human Design, for sleep/rhythm)
- `baziElement` (from BaZi, for elemental health)

### `CanonicalSpiritualityDomain`
- `vedicNinthHouse` (from Vedic Astrology)
- `vedicAtmakaraka` (from Vedic Astrology)
- `destinyHighArcana` (from Destiny Matrix)
- `destinyTalents` (from Destiny Matrix)
- `hdCognition` (from Human Design)
- `hdHeadAjnaDefined` (from Human Design)
- `hdAura` (from Human Design)
- `clairIndicators` (from Destiny Matrix + Human Design)

---

## 2. Translator Dependencies (`CanonicalTranslatorService.ts`)

**Must implement:**
- `buildHealth(blueprint: Blueprint): CanonicalHealthDomain`
- `buildSpirituality(blueprint: Blueprint): CanonicalSpiritualityDomain`

**Action:** Map raw blueprint values into the newly created `health` and `spirituality` properties of the `CanonicalIdentity` return object.

---

## 3. HumanMeaning Dependencies (`HumanMeaningService.ts`)

**Must implement:**
- `generateHealth(domain: CanonicalHealthDomain): HumanNarrative`
- `generateSpirituality(domain: CanonicalSpiritualityDomain): HumanNarrative`

**Action:** Consume the canonical data to produce authentic `short`, `medium`, and `long` narratives for each required card in Section 6 and Section 7. Update `HumanMeaning` interface to include the `health` and `spirituality` fields.

---

## 4. Runtime Dependencies (`ProfileRuntimeAdapter.ts`)

**Must implement:**
- Rewrite `buildSection6()` to strictly return the 5 expected cards (`Peta Chakra`, `Sistem Cerna`, `Lingkungan Ideal`, `Ritme Tubuh`, `Energi Dominan`) consuming `meaning.health`.
- Rewrite `buildSection7()` to strictly return the 8 expected cards (`Jalur Spiritual`, `Evolusi Jiwa`, `Potensi Spiritual`, `Bakat Spiritual`, `Jejak Intuisi`, `Potensi Channeling`, `Aura Dominan`, `Clair Potential`) consuming `meaning.spirituality`.

**Action:** Remove all "Graceful Derivation" fallback cards. Enforce absolute conformance with the `PROFILE_V4_FINAL_IDENTITY_WAREHOUSE.md` inventory.
