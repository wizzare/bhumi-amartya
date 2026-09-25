import type { HumanDesignChart } from "./types";
import { getHumanDesignCompleteness } from "./completeness";
import { validateHumanDesignBirthData } from "./normalizedAudit";

export type IdentityCorrectionStatus =
  | "IDENTITY_CORRECTION_CONFIRMED"
  | "IDENTITY_CORRECTION_REVIEW_REQUIRED"
  | "IDENTITY_CORRECTION_BLOCKED";

export interface HumanDesignIdentitySnapshot {
  type: string | null;
  strategy: string | null;
  authority: string | null;
  profile: string | null;
  definition?: string | null;
}

export interface HumanDesignAuditMetadata {
  previousHumanDesignIdentity: HumanDesignIdentitySnapshot;
  identityCorrectedAt: string;
  identityCorrectionReason: string;
  identityCorrectionStatus: IdentityCorrectionStatus;
  clientSchemaStamp: string;
  verifiedDeploymentProvenance: null;
}

export interface IdentityEvaluationInput {
  existingChart: Partial<HumanDesignChart> | null | undefined;
  freshCalculatedChart: Partial<HumanDesignChart>;
  birthData: {
    birthDate?: string | null;
    birthTime?: string | null;
    birthCity?: string | null;
    timezone?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  };
  founderApproved?: boolean;
}

export interface IdentityEvaluationResult {
  status: IdentityCorrectionStatus;
  hasIdentityChange: boolean;
  identityDiff: {
    typeChanged: boolean;
    strategyChanged: boolean;
    authorityChanged: boolean;
    profileChanged: boolean;
  };
  previousIdentity: HumanDesignIdentitySnapshot;
  targetIdentity: HumanDesignIdentitySnapshot;
  reason: string;
  blockingReasons: string[];
}

function normalizeIdentityString(v: unknown): string {
  if (typeof v !== "string") return "";
  return v.trim().toLowerCase().split(":")[0].trim();
}

export function evaluateIdentityCorrection(
  input: IdentityEvaluationInput
): IdentityEvaluationResult {
  const blockingReasons: string[] = [];

  const { existingChart, freshCalculatedChart, birthData } = input;

  if (validateHumanDesignBirthData(birthData).length > 0) {
    blockingReasons.push("Incomplete or invalid authoritative birth data");
  }

  const freshCompleteness = getHumanDesignCompleteness(freshCalculatedChart);
  if (
    freshCompleteness.coreState !== "CANONICAL_CORE_COMPLETE" &&
    freshCompleteness.coreState !== "CANONICAL_CORE_COMPLETE_ADVANCED_PARTIAL"
  ) {
    blockingReasons.push(`Fresh calculation is structurally incomplete: ${freshCompleteness.coreState}`);
  }

  const prevSnap: HumanDesignIdentitySnapshot = {
    type: existingChart?.type || null,
    strategy: existingChart?.strategy || null,
    authority: existingChart?.authority || null,
    profile: existingChart?.profile || null,
    definition: existingChart?.definition || null,
  };

  const nextSnap: HumanDesignIdentitySnapshot = {
    type: freshCalculatedChart?.type || null,
    strategy: freshCalculatedChart?.strategy || null,
    authority: freshCalculatedChart?.authority || null,
    profile: freshCalculatedChart?.profile || null,
    definition: freshCalculatedChart?.definition || null,
  };

  const typeChanged = normalizeIdentityString(prevSnap.type) !== normalizeIdentityString(nextSnap.type);
  const strategyChanged = normalizeIdentityString(prevSnap.strategy) !== normalizeIdentityString(nextSnap.strategy);
  const authorityChanged = normalizeIdentityString(prevSnap.authority) !== normalizeIdentityString(nextSnap.authority);
  const profileChanged = normalizeIdentityString(prevSnap.profile) !== normalizeIdentityString(nextSnap.profile);

  const hasIdentityChange = typeChanged || strategyChanged || authorityChanged || profileChanged;

  if (blockingReasons.length > 0) {
    return {
      status: "IDENTITY_CORRECTION_BLOCKED",
      hasIdentityChange,
      identityDiff: { typeChanged, strategyChanged, authorityChanged, profileChanged },
      previousIdentity: prevSnap,
      targetIdentity: nextSnap,
      reason: blockingReasons.join("; "),
      blockingReasons,
    };
  }

  if (hasIdentityChange) {
    return {
      status: "IDENTITY_CORRECTION_REVIEW_REQUIRED",
      hasIdentityChange: true,
      identityDiff: { typeChanged, strategyChanged, authorityChanged, profileChanged },
      previousIdentity: prevSnap,
      targetIdentity: nextSnap,
      reason: "Identity difference detected between stored chart and fresh calculation. Founder sign-off required.",
      blockingReasons: ["Awaiting Founder authorization for identity-changing mutation"],
    };
  }

  return {
    status: "IDENTITY_CORRECTION_CONFIRMED",
    hasIdentityChange: false,
    identityDiff: { typeChanged: false, strategyChanged: false, authorityChanged: false, profileChanged: false },
    previousIdentity: prevSnap,
    targetIdentity: nextSnap,
    reason: "No core identity change detected; this evaluation does not authorize writes.",
    blockingReasons: [],
  };
}

export function buildIdentityCorrectionAuditPayload(
  evalResult: IdentityEvaluationResult,
  clientSchemaStamp: string,
  reason: string
): HumanDesignAuditMetadata {
  return {
    previousHumanDesignIdentity: evalResult.previousIdentity,
    identityCorrectedAt: new Date().toISOString(),
    identityCorrectionReason: reason,
    identityCorrectionStatus: evalResult.status,
    clientSchemaStamp,
    verifiedDeploymentProvenance: null,
  };
}
