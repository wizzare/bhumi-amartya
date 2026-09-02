# Bhumi Amartya - Documentation Index

**Status:** Master Index — reconciled for Build 106 (2026-09-02)
**Related:** [V5_SOURCE_OF_TRUTH.md](V5_SOURCE_OF_TRUTH.md), [V5_PRD.md](V5_PRD.md), [V5_EXPERIENCE_ARCHITECTURE.md](V5_EXPERIENCE_ARCHITECTURE.md)

---

## Build 106 canonical authority (highest first)

For any Build 106 work these files win over everything below:

| # | Document | Path | Role |
|---|----------|------|------|
| 1 | **Claude Code entrypoint** | [CLAUDE.md](CLAUDE.md) | Operational entrypoint + mandatory reading order |
| 2 | **Build 106 Master SOT** | [BUILD_106_MASTER_SOT.md](BUILD_106_MASTER_SOT.md) | PRIMARY canonical product/recovery authority for Build 106 |
| 3 | **Build 106 Recovery Matrix** | [BUILD_106_RECOVERY_MATRIX.md](BUILD_106_RECOVERY_MATRIX.md) | R-PRD-01..46 execution/status ledger + provenance ledgers |
| 4 | **Build 106 Agent Protocol** | [BUILD_106_AGENT_PROTOCOL.md](BUILD_106_AGENT_PROTOCOL.md) | Recovery / evidence / safety / release-gate procedure |
| 5 | **Agent Operating Contract** | [AGENTS.md](AGENTS.md) / [RULES.md](RULES.md) | Repository operating guidance |

The V5 documents listed below are **provenance-verified recovered canonical context** (source:
checkpoint CP-036 `036225f23b4c07636ab875f9939afbebdbdad9d7`; see the V5 documentation provenance
ledger in `BUILD_106_RECOVERY_MATRIX.md`). They define the product requirement model
(`R-PRD-01..46`) but are **subordinate to `BUILD_106_MASTER_SOT.md`** wherever the two disagree.

---

## Core Canonical V5 Documents (recovered, provenance-verified, subordinate to Build 106 Master SOT)

| Document | Path | Purpose |
|----------|------|---------|
| **Source of Truth** | [V5_SOURCE_OF_TRUTH.md](V5_SOURCE_OF_TRUTH.md) | Highest product and architectural authority. |
| **Primary PRD** | [V5_PRD.md](V5_PRD.md) | Functional product requirements and feature specs. |
| **Product Philosophy** | [V5_PRODUCT_PHILOSOPHY.md](V5_PRODUCT_PHILOSOPHY.md) | Core design principles, habit philosophy, Comfort Mode. |
| **Experience Architecture** | [V5_EXPERIENCE_ARCHITECTURE.md](V5_EXPERIENCE_ARCHITECTURE.md) | Synthesized experience-level authority (USER-BHUMI-MEMORY-DAILY LIFE). |
| **Daily Rhythm Spec** | [V5_DAILY_RHYTHM_SPEC.md](V5_DAILY_RHYTHM_SPEC.md) | Adaptive daily loop, check-in, Catatan on Dashboard, Tiny Step. |
| **Journal Spec** | [V5_JOURNAL_INNER_WORK_SPEC.md](V5_JOURNAL_INNER_WORK_SPEC.md) | Five journal modes + shared JournalEntry foundation. |
| **CBT Journal Design** | [V5_CBT_JOURNAL_DESIGN.md](V5_CBT_JOURNAL_DESIGN.md) | Structured cognitive reflection framework (non-diagnostic). |
| **Comfort Mode UX** | [V5_COMFORT_MODE_UX_SPEC.md](V5_COMFORT_MODE_UX_SPEC.md) | First-class interaction path for tired/overwhelmed users. |
| **Memory Spec** | [V5_MEMORY_LIVING_INTELLIGENCE_SPEC.md](V5_MEMORY_LIVING_INTELLIGENCE_SPEC.md) | Living Intelligence memory continuity, scope & privacy. |
| **i18n Spec** | [V5_I18N_SPEC.md](V5_I18N_SPEC.md) | Locale handling, react-i18next, fallback strategy. CURRENT scope: id-ID (default), en-US, ms-MY; es-ES/pt-BR/fr-FR deferred (D-V5-35). ("Six canonical locales" phrasing elsewhere is superseded.) |
| **Architecture** | [V5_ARCHITECTURE.md](V5_ARCHITECTURE.md) | Tech stack, system layers, gateway enforcement. |
| **Data Model** | [V5_DATA_MODEL.md](V5_DATA_MODEL.md) | Schema definitions for User, JournalEntry, Memory, DailyState. |
| **FCM Spec** | [V5_NOTIFICATION_FCM_SPEC.md](V5_NOTIFICATION_FCM_SPEC.md) | Guilt-free, timezone-aware push notifications. |
| **Security & Privacy** | [V5_SECURITY_PRIVACY.md](V5_SECURITY_PRIVACY.md) | P0 release blockers (prompt injection, PII logging, rules). |
| **Implementation Roadmap** | [V5_IMPLEMENTATION_ROADMAP.md](V5_IMPLEMENTATION_ROADMAP.md) | Phased execution plan (Phase 0 through Phase 7). |
| **Master TODO** | [V5_TODO.md](V5_TODO.md) | Detailed actionable task breakdown (P0-P8 + DROP). |
| **Decision Log** | [V5_DECISION_LOG.md](V5_DECISION_LOG.md) | Ratified decisions (D-V5-01 through D-V5-35+; the "D-V5-12" upper bound is a stale index note). |
| **Gap / Closure Report** | [V4_TO_V5_GAP_CLOSURE_REPORT.md](V4_TO_V5_GAP_CLOSURE_REPORT.md) | V4 audit findings and closure requirements. |
| **Experience Audit** | [V5_USER_HABIT_EXPERIENCE_AUDIT.md](V5_USER_HABIT_EXPERIENCE_AUDIT.md) | Product-level habit & experience audit. |

---

## Historical / Superseded Documents (Do Not Use as Authority)

| Document(s) | Build 106 classification | Note |
|---|---|---|
| `SOT_V5_BHUMI_AMARTYA_APLIKASI.md` | SUPERSEDED | by `V5_SOURCE_OF_TRUTH.md` |
| `PRD_V5_BHUMI_AMARTYA_APLIKASI.md` | SUPERSEDED | by `V5_PRD.md` |
| `TODO_V5_BHUMI_AMARTYA_APLIKASI.md` | SUPERSEDED | by `V5_TODO.md` |
| `V4_V5_DECISION_LOG.md` | SUPERSEDED | by `V5_DECISION_LOG.md` |
| Root `SOT.md`, `PRD.md`, `TODO.md` | SUPERSEDED / REFERENCE_ONLY | Build 80/85 era; retained as history, not product authority |
| `BUILD_100_*.md` | HISTORICAL | retained as historical governance artifacts; superseded by the Build 106 set |
| `SOT_V4_BUILD*.md`, `PRD_V4_BUILD*.md`, `TODO_V4_BUILD*.md` | HISTORICAL | V4 build-era snapshots |

Deletion is intentionally avoided — supersession notices are preferred so historical context is
preserved (Build 106 legacy-document handling rule).
