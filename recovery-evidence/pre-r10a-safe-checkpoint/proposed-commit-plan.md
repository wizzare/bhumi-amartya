# Proposed Commit Plan

This plan is a proposal only. NO commit is created in this
preparation phase. Founder must approve before execution.

---

## COMMIT 1
feat(blueprint): complete eleven-system runtime and validation

GROUP 1: Eleven Blueprint systems and approved remediation.

### Source modules (lib/)
- lib/numerology/**
- lib/humandesign/presentation.ts
- lib/astrology/{presentation.ts,fixtures.ts}
- lib/weton/{presentation.ts,presentation.fixtures.ts,calculateWeton.ts}
- lib/bazi/baziMeaning.ts
- lib/vedic/{presentation.ts,presentation.fixtures.ts,calculateVedic.ts,types.ts}
- lib/tzolkin/{presentation.ts,presentation.fixtures.ts,calculateTzolkin.ts}
- lib/destiny-matrix/**
- lib/astrocartography/**
- lib/whole-sign/**
- lib/zi-wei/**
- lib/calculations/destinyMatrix/**
- lib/engines/{destinyMatrixGraph,destinyMatrixProjection,
   generateBlueprint}.ts
- lib/visual/destinyMatrixVisualModel.ts
- lib/types/blueprint.ts
- lib/data/types.ts

### Routes (app/blueprint/)
- app/blueprint/numerology/page.tsx (M)
- app/blueprint/human-design/page.tsx (M)
- app/blueprint/natal-chart/page.tsx (M)
- app/blueprint/destiny-matrix/page.tsx (M)
- app/blueprint/tzolkin/page.tsx (M)
- app/blueprint/vedic/page.tsx (M)
- app/blueprint/weton/page.tsx (M)
- app/blueprint/bazi/page.tsx (M)
- app/blueprint/astrocartography/** (new)
- app/blueprint/whole-sign/** (new)
- app/blueprint/zi-wei/** (new)

### Components
- components/blueprint/DestinyMatrixVisual.tsx (M)
- components/blueprint/AstrocartographyMap.tsx (new)
- components/zi-wei/** (new)

### Validators
- scripts/validateAstrocartography*.ts (new, owned by Group 1)
- scripts/auditAstrocartographyForensic.ts (new)
- scripts/validateWholeSignR7A.ts (new)
- scripts/checkZiWei.ts (new)
- scripts/validateTzolkinR5.ts (new)
- scripts/validateVedicR5.ts (new)
- scripts/validateWetonR5.ts (new)
- scripts/validateDestinyMatrix*.ts (new)
- scripts/verifyBaziSimilarity.ts (new)
- scripts/simulateSameLifePathUniqueness.ts (new)

### Documentation
- (See COMMIT 6 for documentation handling.)

### Excluded from this commit
- app/blueprint/bazi/page_new.tsx (scratch)
- lib/engines/test.js, lib/bazi/test_echo.ts (scratch)
- All *_test.* and *_copy.* files

---

## COMMIT 2
feat(wellness): restore and validate v4 wellness runtime

GROUP 2: Wellness V4.

### Modules
- lib/engines/wellnessRecommendationEngine.ts
- lib/engines/longitudinalWellnessEngine.ts
- lib/engines/longitudinalWellnessEngine.test.ts
- lib/engines/canonicalResonanceEngine.ts
- lib/data/wellnessRecommendationLibrary.ts
- lib/services/wellnessCurationService.ts
- lib/repositories/longitudinalWellnessRepository.ts
- lib/innerwork/wellnessSection4Logging.ts
- lib/innerwork/zoneBContext.ts

### UI
- components/wellness/WellnessPageClient.tsx
- components/dashboard/WellnessCheckInCard.tsx

### Excluded
- components/admin/CoreGuardianValidation.tsx (admin excluded)
- Wellness-related fixtures under lib/engines/*_read.txt,
  *_full.txt (scratch)

---

## COMMIT 3
feat(journey): restore journey v2 runtime and integration

GROUP 3: Journey V2.

### Modules
- lib/repositories/journeyRepository_v2.ts
- lib/services/journeyReadAdapter.ts
- lib/types/longitudinalWellness.ts (if shared with wellness, defer)
- lib/types/weeklyRecommendation.ts (if shared, defer)

### UI
- app/journey/page.tsx
- lib/v4_prompts/JourneyPrompt.tsx

### Excluded
- lib/types/journeyDailyRecord_copy.ts (duplicate)

---

## COMMIT 4
feat(profile): restore v4 human meaning and profile runtime

GROUP 4: Human Meaning, Profile, Daily Note, Mirror.

### Modules
- lib/humanMeaningRuntime/**
- lib/services/canonicalHumanMeaningService.ts
- lib/profile/dailyShareCardEngineV2.tsx
- lib/engines/dailyGuidanceEngine.ts
- lib/services/audit.ts, lib/services/audit_runtime.ts
- lib/firebase/service.ts
- lib/repositories/dailyStateRepository.ts
- lib/access/accessControl.ts

### UI
- components/dashboard/DailyNoteV2.tsx
- components/dashboard/DashboardClient.tsx
- components/dashboard/IntelligenceCard.tsx (new — admin?
  re-classify; admin admin/* is excluded; dashboard/* is in)
- app/profile/page.tsx
- app/profile/[section]/page.tsx

### Prompts
- lib/v4_prompts/MirrorPrompt.tsx

### Excluded
- lib/firebase/service_backup.ts (backup)
- lib/services/dailyGuidanceService.r1b.test.ts (test variant;
  defer to Group 5 only if proven canonical)
- lib/services/dailyGuidanceServiceCore.ts and .V4.ts (parallel
  variants — UNFINISHED)
- lib/prompts/dailyGuidancePrompt*.txt and *_read.txt and
  *_verify.txt and *_clean.txt (scratch)

---

## COMMIT 5
fix(v4): restore gateway guidance and identity intelligence

GROUP 5: AI Gateway, Weekly Guidance, Identity Intelligence.

### Modules
- lib/ai/{config,gateway,errors,types,identitySnapshot,
  providerCascade,providerHealth,geminiProvider,minimaxProvider,
  nvidia,openrouterProvider,provider,dailyGuidanceForensics}.ts
- lib/ai/prompts/**
- lib/services/weeklyRecommendationService.ts
- lib/repositories/weeklyRecommendationRepository.ts
- lib/v4_prompts/{CompassPrompt,WeeklyPrompt}.tsx
- app/api/ai/daily-guidance/route.ts

### UI
- components/dashboard/WeeklyGuidanceCard.tsx

### Excluded
- components/WeeklyFix.tsx (admin-only experimental; deferred)
- components/admin/CoreGuardianValidation.tsx (admin)
- components/admin/FounderDebugHD.tsx (admin/debug)

---

## COMMIT 6
docs(recovery): preserve validated v4 recovery evidence

GROUP 6: Reviewed recovery evidence and documentation.

### Files (V4 source-of-truth governance docs only)
- BHUMI_V4_BUILD_MANIFEST.md
- BHUMI_V4_DEVELOPER_RULES.md
- BHUMI_V4_GOVERNANCE_REPORT.md
- BHUMI_V4_PHASE_EXIT_CRITERIA.md
- BHUMI_V4_PRODUCT_LIFECYCLE.md
- BHUMI_V4_RELEASE_CHECKLIST.md
- BHUMI_V4_RELEASE_GOVERNANCE.md
- BHUMI_V4_RUNTIME_GOVERNANCE.md
- BHUMI_V4_SOURCE_OF_TRUTH.md
- CHANGELOG.md
- DAILY_NOTE_PRESENTATION_HOTFIX_REPORT.md
- E1_COMMUNICATION_FOUNDATION_SPEC.md (COMM-EXCLUDED? — KEEP if V4 spec; EXCLUDE if comm-only)
- E1_IMPLEMENTATION_REPORT.md
- E2_COMMUNICATION_PERSISTENCE_SPEC.md (same caveat)
- E2_IMPLEMENTATION_REPORT.md
- E3_INTEGRATION_REPORT.md (same caveat)
- E3_MODULE_MAPPING.md
- E4_INBOX_EXPERIENCE_REPORT.md (INBOX-EXCLUDED — EXCLUDE)
- E5_FEEDBACK_HUB_REPORT.md (EXCLUDED — feedback/comm)
- JOURNEY_SHARE_CARD_REFINEMENT_REPORT.md
- PHASE_D_EXIT_REPORT.md
- PHASE_D_PRODUCTION_DELIVERABLES.md
- BHUMI_V4_AI_PROVIDER.md
- BHUMI_V4_ARCHITECTURE.md
- BHUMI_V4_DEPENDENCY_GRAPH.md
- BHUMI_V4_HUMAN_MEANING_KNOWLEDGE_OPERATING_SYSTEM.md
- BHUMI_V4_MIGRATION_PLAN.md
- BHUMI_V4_PHASE_C_AUDIT_REPORT.md
- BHUMI_V4_ROADMAP.md
- BHUMI_V4_TODO.md
- BHUMI_VERSIONING_POLICY.md
- BUILD68_FORENSIC_AUDIT.md
- BUILD68_RELEASE_REPORT.md
- BUILD69_RELEASE_REPORT.md
- BUILD69_WELLNESS_ROUTING_HOTFIX_REPORT.md
- BUILD70_*.md (Build 70 release reports and audits)
- BUILD71_*.md
- BUILD72_RELEASE_NOTES.md
- BUILD_V4_AI_AUDIT.md
- HOTFIX-70.md
- MOANA_BUILD66/67_QA_REPORT.md, MOANA_BUILD67_RELEASE_REPORT.md
- PHASE_A_COMPLETE.md, PHASE_B_COMPLETE.md
- PRODUCTION_HOTFIX_001_REPORT.md
- PRODUCTION_USER_DELETE_REPORT.md
- SPRINT_I_EXISTING_RUNTIME_AUDIT.md
- HD_ARCHITECTURE_RECOMMENDATION.md
- TIMEZONE_AUDIT.md
- docs/SECURITY_CHECKLIST.md
- docs/ADR/ADR_TEMPLATE.md, docs/RFC/RFC_TEMPLATE.md
- docs/V4_D1_IMPLEMENTATION_REPORT.md
- docs/BHUMI_V4_AI_PROVIDER.md
- docs/BHUMI_V4_HUMAN_MEANING_RUNTIME_CONTRACT.md
- docs/MOANA_V4_SOURCE_OF_TRUTH.md
- android/PROFILE_V4_RUNTIME_REPORT.md
- evidence.ts (NOT evidence.js — UNFINISHED)
- R1A_TEST.txt (SCRATCH — EXCLUDE despite V4 naming)

### Excluded from documentation commit
- All *_test.*, *_copy.*, *_read.*, *_verify.*, *_clean.* files
- *_dump.xml files
- *_backup.* files
- v4_dev/** (scratch)
- v4_presentation_audit.txt, v4_refactor_test.txt, simple.txt,
  test.txt, test_perm.txt, normalize_copy.txt, normalize_v2.txt,
  translations_copy.txt, time_copy.txt, version_copy.txt

---

## OPTIONAL ISOLATED COMMIT (Founder approval required)
security(repo): remove tracked Firebase admin credential

This commit MUST be standalone and MUST NOT be mixed into
feature commit groups.

### Files
- secure/bhumiamartya-adminsdk.json.json (deletion)

### Rationale
- Documented web-only credential (BUILD70_ADMIN_RECOVERY.md).
- Android production does not consume this file.

### Founder decision required
The Founder may also include the other three destructive deletions
(src/app/founder/page.tsx, app/api/humandesign/calculate/route.ts,
lib/founder/founderMetrics.ts) in this isolated commit or in a
separate chore commit. Default: EXCLUDE for safety.

---

## UNCONDITIONAL EXCLUSIONS (not in any commit)

By Founder Phase 7, the following are excluded without exception
unless proven canonical:
- .idea/caches/
- .audit/, audit/, phase-a-audit/, phase-b-validation/
- test-results/, snapshots/, recovery_backups/
- aab_check/, v4_dev/
- tsconfig.tsbuildinfo
- response.html
- All *_dump.xml
- All *_copy.*, *_read.*, *_clean.*, *_backup.*
- All *.tmp
- Root test or scratch files (test.txt, simple.txt, R1A_TEST.txt,
  evidence.js, normalize_*.txt, time_copy.txt, translations_copy.txt,
  version_copy.txt, temp_audit*.txt, summary_debug*.txt,
  temp_final_audit.txt, auditMocks_copy.txt)
- local log captures (build_log.txt, gradle_build_log.txt,
  cap_sync_log.txt)
- generated build output
- local browser output (*_dump.xml)
- ad hoc runtime-proof scripts (run-real-*.{js,ts},
  run-runtime-verification.js, scratch_run_verification.ts,
  test-runtime-verification.ts, test-wellness-verification.spec.ts)
- Android packaging artifacts (android/test.java, android/test.txt,
  android/test_write.txt, android/v4_test.txt,
  android/app/src/main/java/com/bhumiamartya/app/Test.java,
  android/app/src/main/java/com/bhumiamartya/app/ReviewPlugin.java,
  android/PROFILE_V4_RUNTIME_REPORT.md — DEFER unless proven V4 doc)
- AAB verification artifacts (aab_check/, build_aab.bat,
  verify_aab.ps1, BHUMI_BUILD68_AAB_BUILD_GUIDE.md,
  BHUMI_BUILD68_FINAL_VERIFICATION.md,
  BHUMI_V3_BUILD68_FINAL_REPORT.md)

By Founder Phase 6, the following areas are also excluded:
- Communication / Inbox work (app/inbox/**, E4/E5 specs,
  lib/services/communicationCenterService.ts,
  lib/utils/communicationSimulation.ts,
  lib/orchestrators/communicationIntegration.tsx,
  lib/types/communication.{ts,tsx},
  lib/repositories/{behaviorMemoryRepository,
  communicationRepository, feedbackRepository}.ts,
  lib/firebase/behaviorSyncLogger.ts)
- Admin / Metrics (app/admin/**, components/admin/**,
  components/WeeklyFix.tsx)
- Governance scaffolding (likely excluded — to be re-evaluated
  per file; many docs above are governance docs but are
  explicitly authorized in this V4 source-of-truth cycle)
- Copied modules (DUPLICATE_SOURCE — lib/types/journeyDailyRecord_copy.ts)
- Backup modules (lib/firebase/service_backup.ts,
  lib/founder/founderMetrics.ts already deleted in working tree,
  lib/services/dailyGuidanceServiceCore.ts,
  lib/services/dailyGuidanceServiceV4.ts — UNFINISHED variants)
- Experimental alternate pages (app/blueprint/bazi/page_new.tsx,
  app/inbox/page.tsx, app/inbox/loading.tsx, app/inbox/error.tsx)

By Founder Phase 8 default:
- src/app/founder/page.tsx (deleted)
- app/api/humandesign/calculate/route.ts (deleted)
- lib/founder/founderMetrics.ts (deleted)

These four destructive deletions remain unstaged unless the
Founder explicitly approves inclusion in an isolated commit.