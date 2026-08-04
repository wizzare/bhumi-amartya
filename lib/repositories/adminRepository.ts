import { collection, query, where, getDocs, doc, updateDoc, addDoc, serverTimestamp, getDoc, setDoc, orderBy, limit as firestoreLimit, startAfter, documentId, type QueryDocumentSnapshot, type DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { timedQuery } from "@/lib/dev/queryInstrumentation";
import { UserProfile } from "@/lib/repositories/userRepository";
import { blueprintRepository } from "@/lib/repositories/blueprintRepository";
import { calculateHumanDesign } from "@/lib/humandesign/calculateHumanDesign";
import { createPendingHumanDesignChart } from "@/lib/humandesign/types";
import {
  createHdCacheKey,
  getHumanDesignCanonicalFailureReason,
  HD_ENGINE_VERSION,
  isCanonicalHumanDesign,
  type HumanDesignCanonicalFailureReason,
} from "@/lib/humandesign/hdAudit";
import { synthesizeGaiaProfile } from "@/lib/profile/gaia/synthesisEngine";
import { GAIA_ENGINE_VERSION, GAIA_MIGRATION_VERSION, GAIA_PROFILE_VERSION } from "@/lib/profile/gaia/types";

export type AdminHdDiagnostic = {
  status: "Validated" | "Pending" | "Error";
  type: string;
  source: string;
  engineVersion: string;
  rawType: string;
  rawStatus: string;
  rawSource: string;
  rawCalculationQuality: string;
  rawEngineVersion: string;
  canonicalFailureReason: HumanDesignCanonicalFailureReason;
  lastCalculation: string;
  normalizedBirthDate: string;
  birthTime: string;
  timezone: string;
  cityCountry: string;
  utcDateTime: string;
  cacheKey: string;
};

function dateValue(value: unknown): string {
  if (!value) return "-";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value && "toDate" in value && typeof value.toDate === "function") return value.toDate().toISOString();
  return "-";
}

function normalizedBirthDate(value?: string | null): string {
  if (!value) return "-";
  const match = value.match(/^\d{4}-\d{2}-\d{2}/);
  return match?.[0] ?? "-";
}

function utcDateTime(profile: UserProfile): string {
  if (!profile.birthDate || !profile.birthTime || !profile.timezone || !/^[+-]\d{2}:\d{2}$/.test(profile.timezone)) return "-";
  const time = /^\d{2}:\d{2}:\d{2}$/.test(profile.birthTime) ? profile.birthTime : `${profile.birthTime}:00`;
  const date = new Date(`${profile.birthDate}T${time}${profile.timezone}`);
  return Number.isNaN(date.getTime()) ? "-" : date.toISOString();
}

async function logDiagnosticAction(founderUid: string, targetUid: string, action: string) {
  await addDoc(collection(db, "adminAuditLogs"), { reviewedBy: founderUid, targetUid, action, reviewDate: new Date().toISOString(), reason: "Founder HD diagnostic action" });
}

export interface AdminAuditLog {
  reviewDate: string;
  reviewedBy: string;
  targetUid: string;
  previousTier: string;
  newTier: string;
  reason: string;
}

export const adminRepository = {
  async getHdDiagnostic(user: UserProfile): Promise<AdminHdDiagnostic> {
    const snapshot = await getDoc(doc(db, "blueprints", user.uid));
    const blueprint = snapshot.exists() ? snapshot.data() : null;
    const hd = blueprint?.humanDesign as Record<string, unknown> | undefined;
    const canonical = isCanonicalHumanDesign(hd);
    const rawStatus = String(hd?.status || "pending").toLowerCase();
    const status = rawStatus === "error" ? "Error" : canonical ? "Validated" : "Pending";
    const birthProfile = { birthDate: user.birthDate, birthTime: user.birthTime, birthCity: user.birthCity || user.birthPlace, birthCountry: user.birthCountry, latitude: user.latitude, longitude: user.longitude, timezone: user.timezone };
    return {
      status,
      type: canonical ? String(hd?.type || "-") : "Human Design sedang diproses.",
      source: String(hd?.source || "pending"),
      engineVersion: String(hd?.hdEngineVersion || "-"),
      rawType: String(hd?.type || "-"),
      rawStatus: String(hd?.status || "-"),
      rawSource: String(hd?.source || "-"),
      rawCalculationQuality: String(hd?.calculationQuality || "-"),
      rawEngineVersion: String(hd?.hdEngineVersion || "-"),
      canonicalFailureReason: getHumanDesignCanonicalFailureReason(hd),
      lastCalculation: dateValue(hd?.calculatedAt || hd?.updatedAt || hd?.generatedAt),
      normalizedBirthDate: normalizedBirthDate(user.birthDate),
      birthTime: user.birthTime || "-",
      timezone: user.timezone || "-",
      cityCountry: [user.birthCity || user.birthPlace, user.birthCountry].filter(Boolean).join(" / ") || "-",
      utcDateTime: utcDateTime(user),
      cacheKey: createHdCacheKey(birthProfile),
    };
  },

  async rerunHdAudit(founderUid: string, user: UserProfile): Promise<void> {
    const blueprint = await blueprintRepository.getUserBlueprint(user.uid);
    if (!blueprint) throw new Error("Blueprint user tidak ditemukan.");
    const humanDesign = await calculateHumanDesign({ birthDate: user.birthDate, birthTime: user.birthTime, birthCity: user.birthCity || user.birthPlace, birthCountry: user.birthCountry, latitude: user.latitude, longitude: user.longitude, timezone: user.timezone });
    await blueprintRepository.saveUserBlueprint(user.uid, { ...blueprint, humanDesign });
    await logDiagnosticAction(founderUid, user.uid, "RE_RUN_HD_AUDIT");
  },

  async clearHdCache(founderUid: string, user: UserProfile): Promise<void> {
    const pending = { ...createPendingHumanDesignChart("Human Design sedang diproses."), hdEngineVersion: HD_ENGINE_VERSION, hdAuditStatus: "pending" as const, needsUpgrade: true };
    await setDoc(doc(db, "blueprints", user.uid), { humanDesign: pending, updatedAt: serverTimestamp() }, { merge: true });
    await logDiagnosticAction(founderUid, user.uid, "CLEAR_HD_CACHE");
  },

  async rerunGaiaMigration(founderUid: string, user: UserProfile): Promise<UserProfile> {
    const blueprint = await blueprintRepository.getUserBlueprint(user.uid);
    if (!blueprint) throw new Error("Blueprint user tidak ditemukan.");
    const gaiaProfile = synthesizeGaiaProfile(blueprint, user);
    const migrated = {
      ...user,
      gaiaProfile,
      profileVersion: GAIA_PROFILE_VERSION,
      engineVersion: GAIA_ENGINE_VERSION,
      migrationVersion: GAIA_MIGRATION_VERSION,
      gaiaGeneratedAt: gaiaProfile.generatedAt,
    };
    await setDoc(doc(db, "users", user.uid), {
      gaiaProfile,
      profileVersion: GAIA_PROFILE_VERSION,
      engineVersion: GAIA_ENGINE_VERSION,
      migrationVersion: GAIA_MIGRATION_VERSION,
      gaiaGeneratedAt: gaiaProfile.generatedAt,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    await logDiagnosticAction(founderUid, user.uid, "RE_RUN_GAIA_MIGRATION");
    return migrated;
  },
  // Zero current callers (confirmed by repo-wide grep). Bounded here as preventative
  // hardening — guardian queries must never re-introduce a full users collection scan.
  async getCoreGuardianCandidates(pageSize = 25, cursor?: QueryDocumentSnapshot<DocumentData>): Promise<{ users: UserProfile[]; nextCursor?: QueryDocumentSnapshot<DocumentData>; hasMore: boolean }> {
    return timedQuery({ name: "getCoreGuardianCandidates", component: "adminRepository", expectedMax: pageSize }, async () => {
      try {
        const constraints = [orderBy(documentId()), ...(cursor ? [startAfter(cursor)] : []), firestoreLimit(pageSize)];
        const snapshot = await getDocs(query(collection(db, "users"), ...constraints));
        const users = snapshot.docs
          .map(d => ({ ...d.data(), uid: d.id } as UserProfile))
          .filter((user) => user.guardianCandidate === true || user.recognitionTier === "CORE_GUARDIAN_CANDIDATE");
        return { users, nextCursor: snapshot.docs[snapshot.docs.length - 1], hasMore: snapshot.docs.length === pageSize };
      } catch (error: unknown) {
        console.error("[ADMIN REPO] getCoreGuardianCandidates failed:", error);
        throw error;
      }
    });
  },

  async getCoreGuardians(pageSize = 25, cursor?: QueryDocumentSnapshot<DocumentData>): Promise<{ users: UserProfile[]; nextCursor?: QueryDocumentSnapshot<DocumentData>; hasMore: boolean }> {
    return timedQuery({ name: "getCoreGuardians", component: "adminRepository", expectedMax: pageSize }, async () => {
      try {
        const constraints = [where("recognitionTier", "==", "CORE_GUARDIAN"), orderBy(documentId()), ...(cursor ? [startAfter(cursor)] : []), firestoreLimit(pageSize)];
        const q = query(collection(db, "users"), ...constraints);
        const snapshot = await getDocs(q);
        const users = snapshot.docs.map(d => ({ ...d.data(), uid: d.id } as UserProfile));
        return { users, nextCursor: snapshot.docs[snapshot.docs.length - 1], hasMore: snapshot.docs.length === pageSize };
      } catch (error: unknown) {
        console.error("[ADMIN REPO] getCoreGuardians failed:", error);
        throw error;
      }
    });
  },

  async getAllUsersForMonitoring(pageSize = 25, cursor?: QueryDocumentSnapshot<DocumentData>): Promise<{ users: UserProfile[]; nextCursor?: QueryDocumentSnapshot<DocumentData>; hasMore: boolean }> {
    return timedQuery({ name: "getAllUsersForMonitoring", component: "adminRepository", expectedMax: pageSize }, async () => {
      try {
        const constraints = [orderBy(documentId()), ...(cursor ? [startAfter(cursor)] : []), firestoreLimit(pageSize)];
        const q = query(collection(db, "users"), ...constraints);
        const snapshot = await getDocs(q);
        const users = snapshot.docs.map(d => ({ ...d.data(), uid: d.id } as UserProfile));
        return { users, nextCursor: snapshot.docs[snapshot.docs.length - 1], hasMore: snapshot.docs.length === pageSize };
      } catch (error: unknown) {
        console.error("[ADMIN REPO] getAllUsersForMonitoring failed:", error);
        throw error;
      }
    });
  },

  // Unbounded fetch retained ONLY for broadcast targeting, which must reach every
  // eligible recipient. Callers must paginate/cache — see communicationCenterService.
  async getAllUsersUnbounded(): Promise<UserProfile[]> {
    return timedQuery({ name: "getAllUsersUnbounded", component: "communicationCenterService.sendBroadcast", expectedMax: Infinity }, async () => {
      try {
        const snapshot = await getDocs(query(collection(db, "users")));
        return snapshot.docs.map(d => ({ ...d.data(), uid: d.id } as UserProfile));
      } catch (error: unknown) {
        console.error("[ADMIN REPO] getAllUsersUnbounded failed:", error);
        throw error;
      }
    });
  },

  async processValidation(
    founderUid: string,
    targetUid: string,
    action: "APPROVE" | "REJECT" | "EXTEND",
    data: {
      previousTier: string;
      reason: string;
      extensionDays?: number;
    }
  ): Promise<void> {
    const userRef = doc(db, "users", targetUid);
    const now = new Date();

    let update: Record<string, unknown> = {
      updatedAt: serverTimestamp()
    };

    let newTier = data.previousTier;

    if (action === "APPROVE") {
      newTier = "CORE_GUARDIAN";
      update = {
        ...update,
        recognitionTier: "CORE_GUARDIAN",
        guardianBadge: "core_guardian",
        guardianCandidate: false,
        guardianApproved: true,
        guardianApprovedAt: serverTimestamp(),
        guardianApprovedBy: founderUid,
        membershipType: "PENJAGA_BHUMI_INTI",
        recognitionDate: now.toLocaleDateString("id-ID", { month: "long", year: "numeric" })
      };
    } else if (action === "REJECT") {
      newTier = "GUARDIAN";
      update = {
        ...update,
        recognitionTier: "GUARDIAN",
        guardianBadge: "guardian",
        guardianCandidate: false,
        guardianApproved: false,
        membershipType: "FREE"
      };
    } else if (action === "EXTEND") {
      // Logic for extension - could update a 'trialEndsAt' or similar
      if (data.extensionDays) {
        // Implementation depends on where evaluation deadline is stored
      }
    }

    await updateDoc(userRef, update);

    // Audit Log
    await addDoc(collection(db, "adminAuditLogs"), {
      reviewDate: now.toISOString(),
      reviewedBy: founderUid,
      targetUid,
      previousTier: data.previousTier,
      newTier,
      reason: data.reason,
      action
    });
  }
};
