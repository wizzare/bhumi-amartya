# Numerology to Gaia Integration Plan

This plan details how we will integrate the newly completed Numerology signals into the Gaia AI Engines without creating new formulas or changing meanings.

## Current Gaia Usage Map (Audit Result)
1. **Life Path**: Used heavily across Daily Guidance, Profile Echo, and Insight Synthesis.
2. **Personal Year**: Consumed by Daily Guidance (`Catatan Hari Ini`, `Mentor Hari Ini`, `Innerwork Recommendation`).
3. **Expression**: Sourced in `normalizeSources.ts` (Insight Synthesis) for Career/Talent insights, but **fails** for legacy users because it lacks dynamic fallback calculation. Not sent to Daily Guidance.
4. **Soul Urge**: Sourced in `normalizeSources.ts` for Relationship/Shadow insights, but **fails** for legacy users (no fallback). Not sent to Daily Guidance.
5. **Personality**: Sourced in `normalizeSources.ts` for Career/Shadow insights, but **fails** for legacy users (no fallback). Not sent to Daily Guidance.
6. **Birth Day**: Not consumed by any Gaia engine.

## Proposed Changes

### 1. `lib/dailyGuidance/unifiedBlueprintSynthesis.ts`
- **Goal**: Feed all 6 numerology signals to Daily Guidance AI.
- **Changes**:
  - Update `FullLifePathSignals` type to include `expression`, `soulUrge`, and `personality`.
  - In `prepareSynthesisContext`, import and use `calculateNumerology` and `calculateLifePath` to dynamically generate any missing fields on the fly using `input.profile.fullName` and `input.profile.birthDate`, ensuring 100% coverage even for legacy databases.
  - Expose these fields in the final JSON context that goes to the LLM.

### 2. `lib/profile/gaia/normalizeSources.ts`
- **Goal**: Ensure Profile Insight (Talent DNA, Core Motivation, Social Style, etc.) gets all numerology signals consistently.
- **Changes**:
  - Implement the same dynamic fallback calculation using `calculateNumerology` and `calculateLifePath` if `root.numerology` is empty.
  - Emit `birthDay` signals (mapped to `"natural-strength"` for Talents and `"work-style"` for Career).
  - Emit `personalYear` signals (mapped to `"evolution-direction"` and `"growth-edge"`).
  - Add explicit routing so `Expression` feeds into Talent DNA, `Soul Urge` into Core Motivation, and `Personality` into Social Style.

## User Review Required
> [!IMPORTANT]
> The dynamic fallback requires calculating `calculateNumerology(userProfile.fullName)` on the server-side during the Gaia request. This ensures complete parity. Do you approve injecting these numbers into the LLM context for Daily Guidance (`unifiedBlueprintSynthesis.ts`) and Profile Echo (`normalizeSources.ts`)?

## Verification Plan
1. **TypeScript**: Run `npx tsc --noEmit` to ensure type safety.
2. **Build**: Run `npm run build`.
3. **Audit Artifact**: Generate the final `NUMEROLOGY_GAIA_INTEGRATION_AUDIT.md` confirming full consumption.
