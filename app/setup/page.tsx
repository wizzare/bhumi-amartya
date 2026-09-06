"use client";

import { FormEvent, useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "@/lib/data/translations";
import { isEnlEdition } from "@/lib/config/edition";
import CityAutocomplete from "@/components/ui/CityAutocomplete";
import type { CitySelection } from "@/components/ui/CityAutocomplete";
import { useAuth } from "@/context/AuthContext";
import { APP_MODE } from "@/lib/config/appMode";
import {
  generateLocalBlueprint,
  type LocalHumanDesign,
} from "@/lib/local/generateLocalBlueprint";
import { calculateHumanDesignTypeFromBirthData } from "@/lib/humandesign/calculateHumanDesignType";
import { userRepository } from "@/lib/repositories/userRepository";
import { blueprintRepository } from "@/lib/repositories/blueprintRepository";
import { isCompletedProfileForUser, verifySetupPersisted } from "@/lib/auth/authoritativeProfileGate";
import { resolveActiveProfile } from "@/lib/auth/resolveActiveProfile";
import { generateBlueprint } from "@/lib/engines/generateBlueprint";
import { Timestamp } from "firebase/firestore";
import { resolveNatalLocation } from "@/lib/astrology/calculateNatalBasics";
import { canonicalizeNatalTimezone } from "@/lib/astrology/resolveIanaTimezone";
import { storageProvider } from "@/lib/storage/storageProvider";

interface SetupDebugState {
  authUid: string | null;
  profileWrite: string;
  blueprintWrite: string;
  finalProfileWrite: string;
  verifyStatus: string;
  errorMessage: string | null;
}

function deepClean<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(deepClean) as any;
  const result: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = (obj as any)[key];
      if (value !== undefined) result[key] = deepClean(value);
    }
  }
  return result;
}

export default function SetupPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language] || translations["en"];
  const auth = useAuth();
  const user = auth?.user;
  const authRef = useRef(auth);
  useEffect(() => {
    authRef.current = auth;
  }, [auth]);

  // P1 AUDIT BYPASS (Dev Only) — consistent with ProtectedRoute
  const [devUser, setDevUser] = useState<{ uid: string; email: string; displayName: string } | null>(null);

  useEffect(() => {
    if (!(process.env.NODE_ENV === "development" && !user && typeof window !== "undefined")) return;
    const auditKey = localStorage.getItem("bhumi_audit_user");
    if (!auditKey) return;
    let cancelled = false;

    console.log("[SETUP AUDIT] Initializing audit identity:", auditKey);

    import("@/lib/dailyGuidance/auditMocks").then(({ getMockProfile }) => {
      if (cancelled) return;
      const mock = getMockProfile(auditKey);
      if (mock) {
        setDevUser({ uid: mock.uid, email: mock.email || "", displayName: mock.fullName || "" });
        // BUILD 31: Track active audit UID for storageProvider fallback
        localStorage.setItem("bhumi_active_uid", mock.uid);
        console.log("[SETUP AUDIT] Audit identity established:", mock.uid);
      } else {
        console.error("[SETUP AUDIT] No mock found for key:", auditKey);
      }
    }).catch((err) => {
      if (cancelled) return;
      console.error("[SETUP AUDIT] Dynamic import failed:", err);
    });

    return () => { cancelled = true; };
  }, [user]);

  const effectiveUser = useMemo(() => {
    if (user) return { uid: user.uid, email: user.email || "", displayName: user.displayName || "" };
    if (devUser) return devUser;
    return null;
  }, [user, devUser]);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [selectedCity, setSelectedCity] = useState<CitySelection | null>(null);
  const [preferredLanguage, setPreferredLanguage] = useState<"id" | "en" | "ms">(language);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mountGuard, setMountGuard] = useState<"checking" | "ready" | "redirecting" | "unavailable">("checking");
  const [mountGuardAttempt, setMountGuardAttempt] = useState(0);

  const [debug, setDebug] = useState<SetupDebugState>({
    authUid: null,
    profileWrite: "pending",
    blueprintWrite: "pending",
    finalProfileWrite: "pending",
    verifyStatus: "pending",
    errorMessage: null,
  });

  const initializedRef = useRef(false);
  const mountGuardReconciledUidRef = useRef<string | null>(null);

  useEffect(() => {
    const currentAuth = authRef.current;
    if (devUser) {
      setMountGuard("ready");
      return;
    }
    if (!currentAuth?.authStateResolved || currentAuth.authLoading || currentAuth.profileLoading) {
      setMountGuard("checking");
      return;
    }
    if (!user) {
      setMountGuard("ready");
      return;
    }
    if (isCompletedProfileForUser(user.uid, currentAuth.userProfile)) {
      setMountGuard("redirecting");
      router.replace("/dashboard");
      return;
    }
    if (mountGuardReconciledUidRef.current === user.uid) {
      setMountGuard("ready");
      return;
    }

    let cancelled = false;
    mountGuardReconciledUidRef.current = user.uid;
    setMountGuard("checking");
    void resolveActiveProfile(currentAuth).then((resolved) => {
      if (cancelled || resolved.isLoading) return;
      if (resolved.isUnavailable) {
        setMountGuard("unavailable");
        return;
      }
      if (isCompletedProfileForUser(user.uid, resolved.profile)) {
        setMountGuard("redirecting");
        router.replace("/dashboard");
        return;
      }
      setMountGuard("ready");
    });

    return () => {
      cancelled = true;
    };
  }, [auth?.authLoading, auth?.authStateResolved, auth?.userProfile, devUser, mountGuardAttempt, router, user]);

  useEffect(() => {
    if (effectiveUser && !initializedRef.current) {
      console.log("[SETUP INIT] User:", effectiveUser.uid);
      setFullName(effectiveUser.displayName || "");
      setEmail(effectiveUser.email || "");
      setDebug(prev => ({ ...prev, authUid: effectiveUser.uid }));
      initializedRef.current = true;
    }
  }, [effectiveUser]);

  /**
   * CDI-108-01A: canonical timezone resolution.
   * Deterministic IANA zone from the selected city's coordinates (DST-correct
   * downstream). No `longitude / 15` inference, no browser guess, no `+07:00`
   * default. If nothing resolves, `timezone` is null and the natal chart stays
   * pending until a real timezone is available.
   */
  const resolveFinalTimezone = (city: CitySelection | null, fallback: any) => {
    return canonicalizeNatalTimezone({
      storedTimezone: fallback?.timezone ?? null,
      latitude: city?.latitude ?? fallback?.latitude ?? null,
      longitude: city?.longitude ?? fallback?.longitude ?? null,
    });
  };

  const finalizeSetup = async () => {
    if (!effectiveUser) return;
    const uid = effectiveUser.uid;
    console.log("[SETUP SUBMIT START] UID:", uid);

    if (!birthTime || !birthTime.trim()) {
      setFormError(t.setup?.birthTimeRequired || "Birth time is required for accurate Human Design mapping.");
      return;
    }

    if (!selectedCity || selectedCity.latitude == null || selectedCity.longitude == null) {
      setFormError(t.setup?.cityRequired || "Select a birth city from the list so location coordinates are detected.");
      return;
    }

    setLoading(true);
    setFormError(null);
    setDebug(prev => ({ ...prev, errorMessage: null }));

    try {
      const trimmedBirthCity = birthPlace.trim();

      // BUILD 31: Improved location resolution
      const cityFallback = resolveNatalLocation({
        birthDate, birthTime, birthCity: trimmedBirthCity,
        timezone: null, latitude: null, longitude: null,
      });

      const nextLatitude = selectedCity?.latitude ?? cityFallback?.latitude ?? null;
      const nextLongitude = selectedCity?.longitude ?? cityFallback?.longitude ?? null;

      // CDI-108-01A: canonical IANA timezone from the selected city's coordinates.
      const { timezone: nextTimezone, source: timezoneSource } = resolveFinalTimezone(selectedCity, cityFallback);

      if (!nextTimezone) {
        setLoading(false);
        setFormError(t.setup?.cityRequired || "Select a birth city from the list so location coordinates are detected.");
        return;
      }

      const birthCountry = selectedCity?.country ?? null;

      console.log("[SETUP TIMEZONE RESOLVED]", { timezone: nextTimezone, source: timezoneSource });

      // 1. Profile Draft
      const profilePayload = deepClean({
        uid,
        fullName,
        displayName: fullName,
        email: effectiveUser.email || "",
        birthDate,
        birthTime,
        birthCity: trimmedBirthCity,
        birthPlace: trimmedBirthCity,
        birthCountry,
        latitude: nextLatitude,
        longitude: nextLongitude,
        timezone: nextTimezone,
        timezoneSource, // BUILD 31 Metadata
        language: preferredLanguage,
        setupCompleted: false,
        blueprintStatus: "generating" as any,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      console.log("[PROFILE WRITE ATTEMPT]");
      try {
        await userRepository.upsertUserProfile(uid, profilePayload);
        await userRepository.updatePresence(uid, {
          email: effectiveUser.email || "",
          displayName: fullName,
          role: "user",
          registered: true,
        });
        setDebug(prev => ({ ...prev, profileWrite: "success" }));
        console.log("[PROFILE WRITE SUCCESS]");
      } catch (err: any) {
        if (devUser && err?.code === "permission-denied") {
          console.warn("[SETUP AUDIT] Firestore write blocked (expected), continuing with local fallback");
          setDebug(prev => ({ ...prev, profileWrite: "local-only" }));
        } else {
          throw err;
        }
      }

      // 2. Generate Blueprint
      console.log("[BLUEPRINT GEN START]");
      const blueprint = await generateBlueprint({
        uid, fullName, birthDate, birthTime, birthCity: trimmedBirthCity,
        birthCountry, latitude: nextLatitude, longitude: nextLongitude, timezone: nextTimezone,
        email: effectiveUser.email
      });
      console.log("[BLUEPRINT GEN SUCCESS]");

      // 3. Save Blueprint
      console.log("[BLUEPRINT WRITE ATTEMPT]");
      let bpSaved = false;
      try {
        await blueprintRepository.saveUserBlueprint(uid, deepClean(blueprint));
        setDebug(prev => ({ ...prev, blueprintWrite: "success" }));
        console.log("[BLUEPRINT WRITE SUCCESS]");
        bpSaved = true;
      } catch (err: any) {
        if (devUser && err?.code === "permission-denied") {
          console.warn("[SETUP AUDIT] Firestore blueprint write blocked, continuing with local fallback");
          setDebug(prev => ({ ...prev, blueprintWrite: "local-only" }));
          bpSaved = true;
        } else {
          console.error("[SETUP] Blueprint save failed:", err);
          // Move to recovery_required — but never downgrade an already-finalized
          // profile (DEFECT-8D-2): a stale / cross-tab / delayed failure here must
          // not undo a concurrent successful finalize.
          await userRepository.markBlueprintRecoveryRequired(uid, profilePayload).catch(() => {});
          throw new Error(t.setup?.blueprintSaveFailed || "Failed to save blueprint. Your birth data has been saved, please try again.");
        }
      }

      // 4. Final Profile (ONLY if blueprint saved)
      console.log("[FINAL PROFILE WRITE ATTEMPT]");
      const finalProfile = {
        ...profilePayload,
        setupCompleted: bpSaved,
        blueprintStatus: bpSaved ? ("ready" as any) : ("recovery_required" as any),
        updatedAt: Timestamp.now(),
      };
      try {
        await userRepository.upsertUserProfile(uid, finalProfile);
        await userRepository.updatePresence(uid, {
          email: effectiveUser.email || "",
          displayName: fullName,
          role: "user",
        });
        setDebug(prev => ({ ...prev, finalProfileWrite: "success" }));
        console.log("[FINAL PROFILE WRITE SUCCESS]");
      } catch (err: any) {
        if (devUser && err?.code === "permission-denied") {
          setDebug(prev => ({ ...prev, finalProfileWrite: "local-only" }));
        } else {
          throw err;
        }
      }

      // 5. Refresh AuthContext so route guards see the finalized profile
      // (setupCompleted / blueprintStatus) before we route. The redirect must not
      // occur against a stale AuthContext value. Historical provenance: 0f0ad14e
      // ("await auth.refreshUserProfile() before redirect; failure blocks redirect").
      if (auth?.refreshUserProfile) {
        await auth.refreshUserProfile();
      }

      // 6. Explicit Owner Repair (Ensure Firestore write for wizzare@gmail.com)
      try {
        const { repairOwnerHumanDesign } = await import("@/lib/humandesign/ownerOverride");
        await repairOwnerHumanDesign(uid, effectiveUser.email || "");
      } catch (err: any) {
        if (devUser && err?.code === "permission-denied") {
          console.log("[SETUP AUDIT] Owner repair skipped (unauthenticated)");
        } else {
          console.warn("[SETUP] Owner repair failed", err);
        }
      }

      // 6. Scoped Cache
      await storageProvider.saveUserProfile(finalProfile as any);
      // Re-read blueprint after potential repair
      const latestBlueprint = await blueprintRepository.getUserBlueprint(uid).catch(() => null);
      if (latestBlueprint) {
        await storageProvider.saveUserBlueprint(latestBlueprint as any);
      } else {
        // Use the one we just generated if Firestore read fails
        await storageProvider.saveUserBlueprint(blueprint as any);
      }

      // 8. Verify against AUTHORITATIVE persisted state (Build 106, Invariant D).
      // localStorage success is not proof of persistence. Real users are verified
      // from a fresh Firestore read of users/{uid} + blueprints/{uid}; audit/dev
      // identities (Firestore writes permission-denied) fall back to the local mirror.
      const vProfileStr = typeof window !== 'undefined' ? localStorage.getItem(`bhumiProfile:${uid}`) : null;
      const vBlueprintStr = typeof window !== 'undefined' ? localStorage.getItem(`bhumiBlueprint:${uid}`) : null;
      const vProfile = vProfileStr ? JSON.parse(vProfileStr) : null;
      const vBlueprint = vBlueprintStr ? JSON.parse(vBlueprintStr) : null;

      // `latestBlueprint` (read above, after the blueprint save + owner repair) is
      // already an authoritative server read of blueprints/{uid}; reuse it.
      const serverProfile = devUser
        ? null
        : await userRepository.getUserProfile(uid).catch(() => null);

      const verdict = verifySetupPersisted({
        uid,
        isAudit: Boolean(devUser),
        serverProfile,
        serverBlueprintPresent: Boolean(latestBlueprint),
        localProfile: vProfile,
        localBlueprintPresent: Boolean(vBlueprint),
      });

      if (verdict.ok) {
        console.log("[POST SETUP VERIFY PASSED]", { source: verdict.source });
        setDebug(prev => ({ ...prev, verifyStatus: `success:${verdict.source}` }));

        // Ensure audit UID is tracked for storageProvider fallback
        if (devUser) {
          localStorage.setItem("bhumi_active_uid", uid);
        }

        console.log("[SETUP ROUTE TO DASHBOARD]");
        router.replace("/dashboard/");
      } else {
        throw new Error(`${t.setup?.verificationFailed || "Data verification failed"} (${verdict.reason}).`);
      }

    } catch (err: any) {
      console.error("[SETUP ERROR]", err);
      setDebug(prev => ({ ...prev, errorMessage: err.message || String(err) }));
      setFormError(err.message || t.setup?.genericError || "An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  if (mountGuard === "checking" || mountGuard === "redirecting") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#FCFAF5]">
        <p className="text-sm text-[#7B8776]">{t.setup?.aligningProfile || "Aligning profile..."}</p>
      </main>
    );
  }

  if (mountGuard === "unavailable") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#FCFAF5] px-6">
        <div className="bhumi-card w-full max-w-md p-8 text-center">
          <p className="text-sm text-[#7B8776] mb-6">{t.setup?.profileLoadError || "Profile could not be loaded. Check your connection and try again."}</p>
          <button
            type="button"
            onClick={() => {
              mountGuardReconciledUidRef.current = null;
              setMountGuardAttempt((attempt) => attempt + 1);
            }}
            className="bhumi-button w-full"
          >
            {t.welcome?.reload || "Try Again"}
          </button>
        </div>
      </main>
    );
  }

  if (!effectiveUser) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#FCFAF5]">
        <div className="text-center p-8 bhumi-card max-w-md">
          <p className="text-[#4F5E52] mb-6">{t.setup?.mustLogin || "You must log in first."}</p>
          <button onClick={() => router.push("/login")} className="bhumi-button">{t.setup?.goToLogin || "Go to Login Page"}</button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#FCFAF5] px-6 py-12">
      <div className="bhumi-card w-full max-w-md p-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-serif text-[#4F5E52] mb-2">{t.setup.title}</h1>
          <p className="text-[#7B8776]">{t.setup.subtitle}</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); finalizeSetup(); }} className="space-y-4">
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder={t.setup?.fullName || (isEnlEdition() ? "Full Name" : "Nama Lengkap")}
            className="bhumi-input w-full"
            required
          />
          <input
            type="email"
            value={email}
            readOnly
            className="bhumi-input w-full opacity-60 bg-gray-50"
          />
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="bhumi-input w-full"
            required
          />
          <input
            type="time"
            value={birthTime}
            onChange={(e) => setBirthTime(e.target.value)}
            className="bhumi-input w-full"
            required
          />
          <CityAutocomplete
            value={birthPlace}
            placeholder={t.setup?.birthPlace || (isEnlEdition() ? "Birth Place" : "Kota Kelahiran")}
            onInputChange={(val) => {
              setBirthPlace(val);
              setSelectedCity(null);
            }}
            onCitySelect={(city) => { setBirthPlace(city.formattedCity); setSelectedCity(city); }}
          />

          {formError && (
            <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-2xl">{formError}</p>
          )}

          <button
            type="submit"
            disabled={loading || !birthDate || !birthTime || !birthPlace || !selectedCity}
            className="bhumi-button w-full pt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? (t.setup?.saving || (isEnlEdition() ? "Saving..." : "Menyimpan..."))
              : (t.setup?.goToDashboard || (isEnlEdition() ? "Continue to Dashboard" : "Lanjut ke Dashboard"))}
          </button>
        </form>

        {process.env.NODE_ENV === "development" && (
          <div className="mt-10 p-6 bg-slate-900 text-white rounded-3xl text-[10px] font-mono space-y-1">
            <h3 className="text-xs font-bold text-yellow-400 mb-2">SETUP STATUS</h3>
            <p>UID: {debug.authUid || "null"}</p>
            <p>Profile: {debug.profileWrite}</p>
            <p>Blueprint: {debug.blueprintWrite}</p>
            <p>Final Write: {debug.finalProfileWrite}</p>
            <p>Verify: {debug.verifyStatus}</p>
            {debug.errorMessage && <p className="text-red-400 mt-2">Error: {debug.errorMessage}</p>}
          </div>
        )}
      </div>
    </main>
  );
}
