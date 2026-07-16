# Bhumi V4 — AI Provider Stack

## Build Manifest

- **Build**: 4.1.4
- **Component**: AI Provider Layer
- **Architecture**: V4 Provider Abstraction (Unidirectional)

---

## Provider Stack (Current)

| Priority | Provider     | Role                | Default? |
| -------- | ------------ | ------------------- | -------- |
| 1        | **MiniMax** | Default Cloud LLM   | ✅ YES    |
| 2        | Gemini       | Secondary Cloud LLM | No       |
| 3        | OpenRouter   | Tertiary Cloud LLM  | No       |
| 4        | NVIDIA       | Legacy              | No       |
| 5        | Local        | Deterministic Fallback | Always-on (last resort) |

---

## Current Default

**MiniMax** (`AI_PROVIDER=minimax`)

- **Base URL**: `https://api.minimax.chat/v1` (configurable via `MINIMAX_BASE_URL`)
- **Model**: `MiniMax/MiniMax-M2` (configurable via `MINIMAX_MODEL`)
- **API Key**: `Bearer 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` (required)
- **SDK**: OpenAI-compatible (uses `openai` package)

---

## Legacy

**NVIDIA** (`AI_PROVIDER=nvidia`)

- Still available in the registry for rollback
- No longer the default
- Configured via `NVIDIA_API_KEY`, `NVIDIA_BASE_URL`

---

## Architecture Invariants (Unchanged)

```
Feature
  ↓
Orchestrator
  ↓
AI Gateway          ← unchanged
  ↓
Provider Registry   ← MiniMax added here
  ↓
MiniMax             ← NEW default
  ↓
OpenAI-compatible API
```

**Rules**:
1. The AI Gateway MUST NOT contain provider-specific branching.
2. All providers MUST implement the `AIProvider` interface.
3. Features MUST go through Orchestrator → Gateway → Registry. No direct provider calls.
4. Local Deterministic Fallback MUST remain unchanged.
5. Provider failure MUST trigger retry → fallback (unchanged).

---

## Environment Variables

| Variable             | Required | Default                          | Description                    |
| -------------------- | -------- | -------------------------------- | ------------------------------ |
| `AI_PROVIDER`        | No       | `minimax`                        | Active provider ID             |
| `MINIMAX_API_KEY`    | **Yes**  | —                                | MiniMax API key                |
| `MINIMAX_BASE_URL`   | No       | `https://api.minimax.chat/v1`   | MiniMax base URL               |
| `MINIMAX_MODEL`      | No       | `MiniMax/MiniMax-M2`            | MiniMax model name             |
| `AI_MODEL`           | No       | `MiniMax/MiniMax-M2`            | Override default model         |
| `AI_TIMEOUT_MS`      | No       | `15000`                          | Per-request timeout            |
| `AI_MAX_RETRIES`     | No       | `1`                              | Retries on transient errors    |

Legacy (still supported):

| Variable             | Description                    |
| -------------------- | ------------------------------ |
| `NVIDIA_API_KEY`     | NVIDIA API key                 |
| `NVIDIA_BASE_URL`    | NVIDIA base URL                |
| `GEMINI_API_KEY`     | Gemini API key                 |
| `GEMINI_MODEL`       | Gemini model                   |
| `OPENROUTER_API_KEY` | OpenRouter API key             |

---

## Logging Conventions

Provider logs follow these tags (no API key values ever logged):

```
[AI_PROVIDER] minimax
[AI_PROVIDER_REQUEST] model=MiniMax/MiniMax-M2 timeoutMs=15000
[AI_PROVIDER_RESPONSE] model=MiniMax/MiniMax-M2 length=1234
[AI_PROVIDER_ERROR] minimax model=... code=...
[AI_GATEWAY] Requesting daily-guidance via minimax (MiniMax/MiniMax-M2) - Attempt 1/2
[AI_GATEWAY_FALLBACK] Executing local fallback for daily-guidance
[AI_PROVIDER_HEALTH] MiniMax API Key: ✓ Present (ACTIVE) | model: MiniMax/MiniMax-M2
```

---

## Startup Health Check

On module load, the gateway logs a health banner:

```
========================================================
[AI_PROVIDER_HEALTH] Startup validation
========================================================
[AI_PROVIDER_HEALTH] Active provider: minimax
[AI_PROVIDER_HEALTH] MiniMax API Key: ✓ Present (ACTIVE) | model: MiniMax/MiniMax-M2
[AI_PROVIDER_HEALTH] NVIDIA API Key: ✗ Missing | model: moonshotai/kimi-k2.6
[AI_PROVIDER_HEALTH] Gemini API Key: ✓ Present | model: gemini-2.0-flash
[AI_PROVIDER_HEALTH] OpenRouter API Key: ✗ Missing | model: moonshotai/kimi-k2.6
========================================================
```

**Never logs the actual API key value.** Only presence.

---

## Rollback Plan

To revert to NVIDIA (legacy):

```bash
# Option 1: Environment override
AI_PROVIDER=nvidia
NVIDIA_API_KEY=...

# Option 2: Edit config.ts activeProvider default
# Change: activeProvider: process.env.AI_PROVIDER || "minimax"
# To:     activeProvider: process.env.AI_PROVIDER || "nvidia"
```

No code changes required in the gateway, prompt registry, or orchestrators.

---

## Files Changed

| File                                  | Change                            |
| ------------------------------------- | --------------------------------- |
| `lib/ai/config.ts`                    | Default provider → MiniMax        |
| `lib/ai/minimaxProvider.ts`           | **NEW** — MiniMax provider        |
| `lib/ai/gateway.ts`                   | Register MiniMax; health check    |
| `lib/ai/providerHealth.ts`            | **NEW** — Startup validation      |
| `docs/BHUMI_V4_AI_PROVIDER.md`        | **NEW** — This document           |

No changes to:
- Prompt Registry
- Identity / Reflection / Journey / Wellness / Potential Engines
- Orchestrators
- Presentation Layer
