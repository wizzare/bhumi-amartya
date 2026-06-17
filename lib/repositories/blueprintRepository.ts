import { db } from "../firebase/firebase";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { Blueprint } from "@/lib/types/blueprint";
import { sanitizeForFirestore } from "@/lib/firebase/sanitizeForFirestore";
import { debugFirestoreOperation } from "@/lib/firebase/debugFirestore";
import { calculateLifePath } from "@/lib/calculations/calculateLifePath";
import { calculateDestinyMatrix } from "@/lib/calculations/calculateDestinyMatrix";
import calculateSunSign from "@/lib/calculations/calculateSunSign";
import { createPendingHumanDesignChart, type HumanDesignChart } from "@/lib/humandesign/types";
import { normalizeDestinyMatrixIntelligence } from "@/lib/engines/destinyMatrixIntelligence";

const userBlueprintDoc = (uid: string) => doc(db, "blueprints", uid);
const userBlueprintPath = (uid: string) => `blueprints/${uid}`;

const normalizeBlueprint = (uid: string, data: Partial<Blueprint>): Blueprint => {
  const input = data.input ?? {
    birthDate: "",
    birthTime: "12:00",
    birthCity: "",
  };
  const birthDate = input.birthDate || "";
  const lifePath = data.numerology ?? (birthDate ? calculateLifePath(birthDate) : {
    number: 0,
    role: "Pending",
    positiveTraits: [],
    negativeTraits: [],
  });
  const calculatedDestinyMatrix = birthDate
    ? (calculateDestinyMatrix(birthDate) as Blueprint["destinyMatrix"])
    : undefined;
  const destinyMatrix: Blueprint["destinyMatrix"] = data.destinyMatrix ?? calculatedDestinyMatrix ?? {
    dayPoint: 0,
    monthPoint: 0,
    yearPoint: 0,
    destinyPoint: 0,
    arcanaCenter: 0,
    center: 0,
    calculationStatus: "pending",
  };

  const astrology = {
    sunSign: data.natalChart?.sunSign ?? data.astrology?.sunSign ?? (birthDate ? calculateSunSign(birthDate) : "Pending"),
    moonSign: data.natalChart?.moonSign ?? data.astrology?.moonSign ?? "Pending",
    risingSign: data.natalChart?.risingSign ?? data.astrology?.risingSign ?? "Pending",
    calculationStatus: data.natalChart?.calculationStatus ?? data.astrology?.calculationStatus ?? "pending",
  };
  const fallbackHumanDesign = createPendingHumanDesignChart("Human Design engine is being prepared.");
  const savedHumanDesign = data.humanDesign as Partial<HumanDesignChart> | undefined;
  const humanDesignStatus =
    savedHumanDesign?.status === "ready" ||
    savedHumanDesign?.status === "error" ||
    savedHumanDesign?.status === "needs_verified_engine" ||
    savedHumanDesign?.status === "verified" ||
    savedHumanDesign?.status === "needs_verified_timezone"
      ? savedHumanDesign.status
      : "pending";

  const humanDesign: Blueprint["humanDesign"] = {
    ...fallbackHumanDesign,
    ...savedHumanDesign,
    type: savedHumanDesign?.type ?? null,
    strategy: savedHumanDesign?.strategy ?? null,
    authority: savedHumanDesign?.authority ?? null,
    profile: savedHumanDesign?.profile ?? null,
    definition: savedHumanDesign?.definition ?? null,
    incarnationCross: {
      name: savedHumanDesign?.incarnationCross?.name ?? null,
      gates: savedHumanDesign?.incarnationCross?.gates ?? [],
    },
    centers: {
      ...fallbackHumanDesign.centers,
      ...savedHumanDesign?.centers,
    },
    gates: savedHumanDesign?.gates ?? [],
    channels: savedHumanDesign?.channels ?? [],
    variables: savedHumanDesign?.variables ?? null,
    digestion: savedHumanDesign?.digestion ?? null,
    cognition: savedHumanDesign?.cognition ?? null,
    motivation: savedHumanDesign?.motivation ?? null,
    environment: savedHumanDesign?.environment ?? null,
    status: humanDesignStatus,
    source:
      savedHumanDesign?.source === "hdkit" || savedHumanDesign?.source === "error" || savedHumanDesign?.source === "local-fallback" || savedHumanDesign?.source === "human-design-py" || savedHumanDesign?.source === "verified-override"
      || savedHumanDesign?.source === "manual_verified"
        ? savedHumanDesign.source
        : "pending",
    calculationStatus:
      savedHumanDesign?.calculationStatus ??
      (humanDesignStatus === "ready" || humanDesignStatus === "verified" ? "completed" : humanDesignStatus),
    // BUILD 31: Preserve metadata
    timezone: savedHumanDesign?.timezone ?? null,
    timezoneSource: (savedHumanDesign as any)?.timezoneSource ?? null,
    inputHash: (savedHumanDesign as any)?.inputHash ?? null,
    calculatedAt: (savedHumanDesign as any)?.calculatedAt ?? null,
  };

  return {
    uid,
    status: data.status ?? "ready",
    input,
    lifePath,
    natalChart: astrology,
    numerology: lifePath,
    astrology,
    humanDesign,
    destinyMatrix: {
      ...destinyMatrix,
      center: destinyMatrix.center ?? destinyMatrix.arcanaCenter ?? 0,
      arcanaCenter: destinyMatrix.arcanaCenter ?? destinyMatrix.center ?? 0,
      destinyIntelligence: normalizeDestinyMatrixIntelligence({ destinyMatrix }),
    },
    generatedAt: data.generatedAt ?? new Date().toISOString(),
    updatedAt: data.updatedAt ?? new Date().toISOString(),
  };
};

const saveUserBlueprint = async (uid: string, blueprint: Partial<Blueprint>) => {
  const blueprintRef = userBlueprintDoc(uid);
  const ensuredHumanDesign = blueprint.humanDesign ?? createPendingHumanDesignChart(
    "Human Design requires precise time zone and birth location.",
  );
  const normalizedPayload = normalizeBlueprint(uid, {
    ...blueprint,
    humanDesign: ensuredHumanDesign,
  });
  const payload = sanitizeForFirestore({
    ...normalizedPayload,
    uid,
    updatedAt: Timestamp.now(),
    generatedAt: Timestamp.now(),
  });

  console.log("[BLUEPRINT REPO SAVE]", {
    uid,
    hasHumanDesign: !!(payload as any).humanDesign,
    humanDesignType: (payload as any).humanDesign?.type ?? null,
    humanDesignProfile: (payload as any).humanDesign?.profile ?? null,
    humanDesignStatus: (payload as any).humanDesign?.status ?? null,
    inputHash: (payload as any).humanDesign?.inputHash ?? null,
  });

  await debugFirestoreOperation(
    { operation: "setDoc", path: userBlueprintPath(uid), uid, payloadKeys: Object.keys(payload as object) },
    () => setDoc(blueprintRef, payload, { merge: true }),
  );
};

const getUserBlueprint = async (uid: string): Promise<Blueprint | null> => {
  const blueprintRef = userBlueprintDoc(uid);
  const docSnap = await debugFirestoreOperation(
    { operation: "getDoc", path: userBlueprintPath(uid), uid },
    () => getDoc(blueprintRef),
  );
  if (docSnap.exists()) {
    return normalizeBlueprint(uid, docSnap.data() as Partial<Blueprint>);
  }

  return null;
};

const updateBlueprintStatus = async (
  uid: string,
  status: "ready" | "generating" | "error",
  error?: string
) => {
  const blueprintRef = userBlueprintDoc(uid);
  await debugFirestoreOperation(
    { operation: "setDoc", path: userBlueprintPath(uid), uid, payloadKeys: ["status", "error", "updatedAt"] },
    () => setDoc(blueprintRef, sanitizeForFirestore({
      status,
      error,
      updatedAt: Timestamp.now(),
    }), { merge: true }),
  );
};

const markBlueprintStale = async (uid: string) => {
  const blueprintRef = userBlueprintDoc(uid);
  await debugFirestoreOperation(
    { operation: "setDoc", path: userBlueprintPath(uid), uid, payloadKeys: ["status", "updatedAt"] },
    () => setDoc(blueprintRef, sanitizeForFirestore({
      status: "stale",
      updatedAt: Timestamp.now(),
    }), { merge: true }),
  );
};

export const blueprintRepository = {
  saveUserBlueprint,
  getUserBlueprint,
  updateBlueprintStatus,
  markBlueprintStale,
};
