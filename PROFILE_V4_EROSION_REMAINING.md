# PROFILE V4 EROSION REMAINING

* remaining orphan data
  - Section 6: `Peta Chakra` and `Sistem Cerna` exist in Inventory but are completely missing from the Runtime pipeline.
  - Section 7: `Jalur Spiritual`, `Evolusi Jiwa`, `Potensi Spiritual`, `Bakat Spiritual`, `Jejak Intuisi`, `Potensi Channeling`, `Aura Dominan`, and `Clair Potential` exist in Inventory but are completely missing from the Runtime pipeline.
  - `HumanMeaningService` only generates 7 domains (identity, purpose, energy, shadow, talents, relationships, timing). It is entirely missing domains for Health, Spirituality, and State, creating an architectural gap between Canonical data and the expected Runtime cards.

* remaining orphan runtime
  - `ProfileRuntimeAdapter` dynamically outputs Section 6 (`Cara Tubuh Memulihkan Diri`), which is not in the Official Inventory.
  - `ProfileRuntimeAdapter` dynamically outputs Section 7 (`Jalur Pertumbuhan`, `Pelajaran Jiwa Saat Ini`, `Tema Evolusi Diri`, `Arah Pengembangan Diri`), none of which exist in the Official Inventory.
  - `lib/profile/gaia/*` completely orphaned from the Profile UI but still lives in the codebase.
  - `GaiaTheme` still remains and is actively used by `lib/engines/innerworkIntelligence.ts`.
  - `synthesizeGaiaProfile` still remains and is actively used by `lib/repositories/adminRepository.ts`.

* remaining hidden cards
  - No hidden cards were found in the UI layer. `ProfileSectionClient.tsx` accurately loops and renders every single card array passed to it by the Runtime.

* remaining unused meaning
  - No unused meaning was found. Everything returned by `HumanMeaningService` is mapped by the Runtime Adapter. (The issue is the reverse: missing meaning).
