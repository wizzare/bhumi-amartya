"use client";

import { FormEvent, useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "@/lib/data/translations";
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
import { generateBlueprint } from "@/lib/engines/generateBlueprint";
import { Timestamp } from "firebase/firestore";
import { resolveNatalLocation } from "@/lib/astrology/calculateNatalBasics";
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
  const t = translations[language];
  const auth = useAuth();
  const user = auth?.user;

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
  const [preferredLanguage, setPreferredLanguage] = useState<"id" | "en">(language);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [debug, setDebug] = useState<SetupDebugState>({
    authUid: null,
    profileWrite: "pending",
    blueprintWrite: "pending",
    finalProfileWrite: "pending",
    verifyStatus: "pending",
    errorMessage: null,
  });

  const initializedRef = useRef(false);

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
   * BUILD 31: Advanced Timezone Resolution
   */
  const resolveFinalTimezone = (city: CitySelection | null, fallback: any) => {
    // 1. If fallback matched a major city, use its verified offset
    if (fallback?.timezone) {
      return { timezone: fallback.timezone, source: "city-fallback" as const };
    }

    // 2. If we have coordinates from autocomplete, approximate from longitude
    if (city?.longitude !== undefined) {
      const hours = Math.round(city.longitude / 15);
      const sign = hours >= 0 ? "+" : "-";
      const offset = `${sign}${Math.abs(hours).toString().padStart(2, '0')}:00`;
      return { timezone: offset, source: "longitude-approx" as const };
    }

    // 3. Browser guess as last resort
    try {
      const offsetMinutes = -new Date().getTimezoneOffset();
      const hours = Math.floor(Math.abs(offsetMinutes) / 60);
      const minutes = Math.abs(offsetMinutes) % 60;
      const sign = offsetMinutes >= 0 ? "+" : "-";
      const offset = `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      return { timezone: offset, source: "browser-guess" as const };
    } catch {
      return { timezone: "+07:00", source: "default" as const };
    }
  };

  const finalizeSetup = async () => {
    if (!effectiveUser) return;
    const uid = effectiveUser.uid;
    console.log("[SETUP SUBMIT START] UID:", uid);
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

      // BUILD 31: Fix P0 Volatility - Remove hardcoded +07:00
      const { timezone: nextTimezone, source: timezoneSource } = resolveFinalTimezone(selectedCity, cityFallback);

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
      try {
        await blueprintRepository.saveUserBlueprint(uid, deepClean(blueprint));
        setDebug(prev => ({ ...prev, blueprintWrite: "success" }));
        console.log("[BLUEPRINT WRITE SUCCESS]");
      } catch (err: any) {
        if (devUser && err?.code === "permission-denied") {
          console.warn("[SETUP AUDIT] Firestore blueprint write blocked, continuing with local fallback");
          setDebug(prev => ({ ...prev, blueprintWrite: "local-only" }));
        } else {
          throw err;
        }
      }

      // 4. Final Profile
      console.log("[FINAL PROFILE WRITE ATTEMPT]");
      const finalProfile = { ...profilePayload, setupCompleted: true, blueprintStatus: "ready" as any, updatedAt: Timestamp.now() };
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

      // 5. Explicit Owner Repair (Ensure Firestore write for wizzare@gmail.com)
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

      // 6. Verify
      // BUILD 31: Robust verification for Audit/Dev mode
      const vProfileStr = typeof window !== 'undefined' ? localStorage.getItem(`bhumiProfile:${uid}`) : null;
      const vBlueprintStr = typeof window !== 'undefined' ? localStorage.getItem(`bhumiBlueprint:${uid}`) : null;
      const vProfile = vProfileStr ? JSON.parse(vProfileStr) : null;
      const vBlueprint = vBlueprintStr ? JSON.parse(vBlueprintStr) : null;

      if (vProfile?.setupCompleted === true && vBlueprint && (vProfile.uid === uid || devUser)) {
        console.log("[POST SETUP VERIFY PASSED]");
        setDebug(prev => ({ ...prev, verifyStatus: "success" }));

        // Ensure audit UID is tracked for storageProvider fallback
        if (devUser) {
          localStorage.setItem("bhumi_active_uid", uid);
        }

        console.log("[SETUP ROUTE TO DASHBOARD]");
        router.replace("/dashboard/");
      } else {
        throw new Error(`Verifikasi data gagal. Profile: ${!!vProfile}, Blueprint: ${!!vBlueprint}`);
      }

    } catch (err: any) {
      console.error("[SETUP ERROR]", err);
      setDebug(prev => ({ ...prev, errorMessage: err.message || String(err) }));
      setFormError(err.message || "Terjadi kesalahan saat menyimpan data.");
      setLoading(false);
    }
  };

  if (!effectiveUser) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#FCFAF5]">
        <div className="text-center p-8 bhumi-card max-w-md">
          <p className="text-[#4F5E52] mb-6">Kamu harus login terlebih dahulu.</p>
          <button onClick={() => router.push("/login")} className="bhumi-button">Ke Halaman Login</button>
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
            placeholder="Nama Lengkap"
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
            placeholder="Kota Kelahiran"
            onInputChange={(val) => setBirthPlace(val)}
            onCitySelect={(city) => { setBirthPlace(city.formattedCity); setSelectedCity(city); }}
          />

          {formError && (
            <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-2xl">{formError}</p>
          )}

          <button type="submit" disabled={loading} className="bhumi-button w-full pt-4">
            {loading ? "Menyimpan..." : "Lanjut ke Dashboard"}
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
