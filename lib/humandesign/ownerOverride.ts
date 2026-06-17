import { HumanDesignChart, emptyHumanDesignCenters } from "./types";
import { Timestamp } from "firebase/firestore";
import { blueprintRepository } from "@/lib/repositories/blueprintRepository";
import { storageProvider } from "@/lib/storage/storageProvider";
import { HD_ENGINE_VERSION } from "./hdAudit";

export const OWNER_EMAIL = "wizzare@gmail.com";

export function isOwnerEmail(email?: string | null): boolean {
  return email?.toLowerCase() === OWNER_EMAIL;
}

export function getOwnerManualHumanDesignOverride(): Partial<HumanDesignChart> {
  return {
    type: "Manifesting Generator",
    strategy: "To Respond",
    authority: "Sacral",
    profile: "6/3",
    definition: "Single Definition",
    incarnationCross: {
      name: "Left Angle Cross of Incarnation",
      gates: ["24", "44", "13", "7"]
    },
    status: "verified",
    source: "manual_verified",
    calculationQuality: "manual_verified_owner_override",
    calculationStatus: "completed",
    hdEngineVersion: HD_ENGINE_VERSION,
    note: "Verified manual data for owner account.",
  };
}

export function applyOwnerOverrideIfApplicable(email: string | null, chart: HumanDesignChart): HumanDesignChart {
  if (isOwnerEmail(email)) {
    console.log("[HD OWNER OVERRIDE APPLIED]", { email });
    return {
      ...chart,
      ...getOwnerManualHumanDesignOverride(),
      updatedAt: new Date().toISOString()
    } as HumanDesignChart;
  }
  return chart;
}

export async function repairOwnerHumanDesign(uid: string, email: string) {
  if (!isOwnerEmail(email)) return;

  console.log("[HD OWNER OVERRIDE CHECK]", { uid, email, isOwner: true });

  try {
    const blueprint = await blueprintRepository.getUserBlueprint(uid);
    const storedType = blueprint?.humanDesign?.type;
    const storedSource = blueprint?.humanDesign?.source;
    const storedEngineVersion = blueprint?.humanDesign?.hdEngineVersion;

    console.log("[HD OWNER OVERRIDE CHECK] Current stored values:", { storedType, storedSource });

    if (storedSource === "manual_verified" && storedType === "Manifesting Generator" && storedEngineVersion === HD_ENGINE_VERSION) {
      console.log("[HD OWNER OVERRIDE CHECK] Already correct. No write needed.");
      return;
    }

    const override = getOwnerManualHumanDesignOverride();
    const updatedHD = {
      ...(blueprint?.humanDesign || {}),
      ...override,
      updatedAt: new Date().toISOString()
    };

    const path = `blueprints/${uid}`;
    console.log("[HD OWNER OVERRIDE WRITE] Starting Firestore write:", {
      path,
      type: override.type,
      strategy: override.strategy,
      authority: override.authority,
      profile: override.profile,
      source: override.source,
      calculationQuality: override.calculationQuality
    });

    await blueprintRepository.saveUserBlueprint(uid, {
      ...blueprint,
      uid,
      humanDesign: updatedHD as any,
      updatedAt: new Date().toISOString()
    } as any);

    // Explicit Verification
    const verifiedBlueprint = await blueprintRepository.getUserBlueprint(uid);
    const vType = verifiedBlueprint?.humanDesign?.type;
    const vSource = verifiedBlueprint?.humanDesign?.source;
    const vQuality = (verifiedBlueprint?.humanDesign as any)?.calculationQuality;
    const vEngineVersion = verifiedBlueprint?.humanDesign?.hdEngineVersion;

    const success = vType === "Manifesting Generator" && vSource === "manual_verified" && vEngineVersion === HD_ENGINE_VERSION;

    console.log("[HD OWNER OVERRIDE VERIFY]", {
      path,
      storedType: vType,
      storedSource: vSource,
      storedQuality: vQuality,
      storedEngineVersion: vEngineVersion,
      result: success ? "PASSED" : "FAILED"
    });

    if (!success) {
      console.error("[HD OWNER OVERRIDE ERROR] Verification failed after write.");
    } else {
      // Also update storageProvider local cache
      if (verifiedBlueprint) {
        await storageProvider.saveUserBlueprint(verifiedBlueprint as any);
      }
    }

  } catch (err: any) {
    console.error("[HD OWNER OVERRIDE ERROR]", {
      errorCode: err.code || "unknown",
      message: err.message || String(err)
    });
  }
}
