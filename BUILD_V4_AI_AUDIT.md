# BUILD V4 AI AUDIT

This document performs the pre-migration audit of the Bhumi Amartya codebase before any code modification is conducted.

---

## 1. AI ENTRY POINTS
*   **Daily Guidance API Endpoint**: `/api/ai/daily-guidance` (`app/api/ai/daily-guidance/route.ts`). Intercepts regular requests (calls `dailyGuidanceEngine.generateLanguageFace`) and stable soul identity requests (`mode === "soul-identity"`, which calls `buildSoulIdentityPrompt` and `generateGeminiJson`).
*   **Daily Guidance Engine**: `dailyGuidanceEngine` (`lib/engines/dailyGuidanceEngine.ts`). Compiles prompts and triggers `generateGeminiJson`.
*   **Daily Guidance Orchestrator**: `generateDailyGuidance` (`lib/orchestrators/dailyGuidanceOrchestrator.ts`). Calls `generateGeminiJson<DailyGuidanceOutput>` and runs normalization.
*   **Soul Reflection Generation (Legacy/Unused)**: `generateSoulReflection` (`lib/engines/generateSoulReflection.ts`). Wraps an OpenRouter call to `deepseek/deepseek-chat-v3`. Currently unused in the production build.

---

## 2. GEMINI DEPENDENCIES
*   **Gemini Wrapper**: `lib/ai/gemini.ts`
    *   Imports `@google/generative-ai`.
    *   Loads `GEMINI_API_KEY` and `GEMINI_MODEL`.
    *   Implements `generateGeminiText`, `generateGeminiJson`, and an unused `generateSoulReflection`.
*   **Gemini References**:
    *   `app/api/ai/daily-guidance/route.ts` imports `generateGeminiJson`.
    *   `lib/engines/dailyGuidanceEngine.ts` imports `generateGeminiJson`.
    *   `lib/orchestrators/dailyGuidanceOrchestrator.ts` imports `generateGeminiJson`.

---

## 3. OPENROUTER DEPENDENCIES
*   **OpenRouter Wrapper**: `lib/ai/openrouter.ts`
    *   Imports `openai` client.
    *   Initializes client with `baseURL: "https://openrouter.ai/api/v1"` and `apiKey: process.env.OPENROUTER_API_KEY`.
*   **OpenRouter Callers**:
    *   `lib/engines/generateSoulReflection.ts` imports `client` from `../ai/openrouter` and makes chat completion calls to model `"deepseek/deepseek-chat-v3"`.

---

## 4. HARDCODED API KEYS
*   No hardcoded API key strings were found in the source codebase.
*   All keys are loaded securely from environment variables:
    *   `GEMINI_API_KEY`
    *   `OPENROUTER_API_KEY`
    *   `NVIDIA_API_KEY`

---

## 5. PROMPT BUILDERS
All active prompt builders are located under `lib/prompts/`:
1.  **`buildSoulIdentityPrompt`** (`lib/prompts/soulIdentityPrompt.ts`): Builds prompt to synthesize the user's stable 8-system blueprint into an archetype, mission, gifts, lessons, shadow, and purpose description.
2.  **`buildBhumiSoulMirrorPrompt`** (`lib/prompts/bhumiSoulMirrorPrompt.ts`): Builds the prompt for Refleksi Jiwa (Mirror), focusing on identity essence, weekday atmosphere, and companion tone.
3.  **`buildBhumiDailyReflectionPrompt`** (`lib/prompts/bhumiDailyReflectionPrompt.ts`): Builds the prompt for Catatan Hari Ini (Compass), integrating house activations, planetary positions, transit details, and memory context.
4.  **`buildBhumiManifestationPrompt`** (`lib/prompts/bhumiManifestationPrompt.ts`): Builds the prompt for Manifestasi Hari Ini, creating grounded first-person affirmations, assumptions, and attractions.
5.  **`buildDailyGuidancePrompt`** (`lib/prompts/dailyGuidancePrompt.ts`): The master prompt builder that merges the templates for Mirror, Compass, and Manifestation, and formats them into a single stringified JSON instruction set.

---

## 6. AI RESPONSE PARSERS
1.  **JSON Blocks Extraction** (`lib/ai/gemini.ts`):
    ```typescript
    const cleaned = text
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim();
    ```
2.  **Daily Note Hydration / Mapping** (`lib/engines/dailyGuidanceEngine.ts#mapToGuidance`): Maps fields from the parsed JSON response (e.g. `output.soulReflectionText`, `output.companionReflection`, `output.categories`, `output.manifestation`) to build the unified face object.
3.  **Assertion / Normalization Parser** (`lib/orchestrators/dailyGuidanceOrchestrator.ts#normalizeOutput`): Asserts that required fields are present in the parsed JSON response and hydrates default/missing fields from the offline blueprint synthesis.
