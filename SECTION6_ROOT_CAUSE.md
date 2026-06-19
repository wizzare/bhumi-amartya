# SECTION 6 (RAGA & RUANG) ROOT CAUSE ANALYSIS

| Card Name | Warehouse | Runtime | UI | Problem Type | Root Cause |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Peta Chakra** | Yes | No | No | TYPE A (Never mapped into Runtime) | Missing architectural foundation. `CanonicalIdentity` lacks a `health` domain, preventing `HumanMeaningService` from synthesizing the data, leading `ProfileRuntimeAdapter` to omit it entirely. |
| **Sistem Cerna** | Yes | No | No | TYPE A (Never mapped into Runtime) | Same as Peta Chakra. The data pipeline does not support health metrics. |
| **Lingkungan Ideal** | Yes | Yes | Yes | TYPE D (Wrong HumanMeaning mapping) / TYPE E (Wrong Canonical Domain source) | The card exists, but its content is hardcoded as a "Graceful derivation" inside `ProfileRuntimeAdapter`. It does not consume actual User Blueprint data because the `health` pipeline does not exist. |
| **Ritme Tubuh** | Yes | Yes | Yes | TYPE D / TYPE E | The card exists but uses hardcoded placeholder strings instead of authentic `HumanMeaning`. |
| **Energi Dominan** | Yes | Yes | Yes | TYPE D / TYPE E | The card exists but uses hardcoded placeholder strings instead of authentic `HumanMeaning`. |
| **Cara Tubuh Memulihkan Diri** | No | Yes | Yes | TYPE B (Generated but not in Warehouse) | `ProfileRuntimeAdapter` artificially created this card during a graceful fallback operation, completely ignoring the strict `PROFILE_V4_FINAL_IDENTITY_WAREHOUSE.md` inventory. |
