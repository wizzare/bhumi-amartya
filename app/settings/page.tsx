"use client";

import Link from "next/link";
import { HD_API_URL } from "@/lib/config/hdApiUrl";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Shield, ShieldCheck, ShieldAlert, User as UserIcon, Info } from "lucide-react";
import { AppNav } from "@/components/navigation/AppNav";
import { BhumiPageHeader } from "@/components/ui/BhumiPageHeader";
import CityAutocomplete from "@/components/ui/CityAutocomplete";
import type { CitySelection } from "@/components/ui/CityAutocomplete";
import { useLanguage } from "@/app/context/LanguageContext";
import { translations } from "@/lib/data/translations";
import { useAuth } from "@/context/AuthContext";
import { getLocalUserSession } from "@/lib/auth/getLocalUserSession";
import { resolveNatalLocation } from "@/lib/astrology/calculateNatalBasics";
import {
  createDefaultUserPlan,
  getOrCreateLocalUserPlan,
  isDeveloperProEmail,
  USER_PLAN_STORAGE_KEY,
  type UserPlan,
} from "@/lib/billing/getUserPlanStatus";
import {
  generateLocalBlueprint,
  type LocalHumanDesign,
  type LocalUserProfile,
} from "@/lib/local/generateLocalBlueprint";
import { safeJsonParse } from "@/lib/storage/safeJson";
import { auth as firebaseAuth } from "@/lib/firebase/firebase";
import { storageProvider } from "@/lib/storage/storageProvider";
import { userRepository } from "@/lib/repositories/userRepository";
import type { UserProfile as StorageUserProfile, UserBlueprint as StorageUserBlueprint } from "@/lib/firebase/service";
import { clearBhumiSessionForSignOut } from "@/lib/auth/onboardingIntent";
import { deleteUser } from "firebase/auth";
import { shouldApplyDefaultRegistrationPolicy } from "@/lib/billing/founderTesterSourceOfTruth";
import { getCurrentBadge } from "@/lib/billing/billingPreparation";
import { getEntitlementStatus } from "@/lib/billing/entitlementService";
import { getBillingPresentation } from "@/lib/billing/entitlementPresentation";
import { cancelDailyReminders, getDailyReminderEnabled, refreshGentleNightReminder, setDailyReminderEnabled } from "@/lib/notifications/gentleNightReminder";
import { Capacitor } from "@capacitor/core";

const LANGUAGE_STORAGE_KEY = "bhumiLanguage";

const HUMAN_DESIGN_PENDING: LocalHumanDesign = {
  type: null,
  profile: null,
  authority: null,
  strategy: null,
  notSelfTheme: null,
  signature: null,
  definedCenters: [],
  openCenters: [],
  gatesPersonality: [],
  gatesDesign: [],
  status: "pending",
  source: "human-design-py",
  note: "Human Design service is not running.",
};

function toDisplayDate(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  }
  if (value instanceof Date) {
    return value.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  }
  if (typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  }
  if (typeof value === "object" && "seconds" in value && typeof value.seconds === "number") {
    return new Date(value.seconds * 1000).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  }
  return null;
}

function daysUntil(value: unknown): number | null {
  let date: Date | null = null;
  if (typeof value === "string") {
    const parsed = new Date(value);
    date = Number.isNaN(parsed.getTime()) ? null : parsed;
  } else if (value instanceof Date) {
    date = value;
  } else if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    date = value.toDate();
  } else if (value && typeof value === "object" && "seconds" in value && typeof value.seconds === "number") {
    date = new Date(value.seconds * 1000);
  }

  if (!date) return null;
  return Math.max(0, Math.ceil((date.getTime() - Date.now()) / 86_400_000));
}

async function fetchHumanDesign(input: {
  fullName: string;
  birthDate: string;
  birthTime: string;
  timezone?: string | null;
}): Promise<LocalHumanDesign> {
  try {
    const response = await fetch(HD_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName: input.fullName,
        birthDate: input.birthDate,
        birthTime: input.birthTime,
        timezone: input.timezone || "+07:00",
      }),
    });

    if (!response.ok) return HUMAN_DESIGN_PENDING;
    const result = await response.json();

    return {
      type: typeof result.type === "string" ? result.type : null,
      profile: typeof result.profile === "string" ? result.profile : null,
      authority: typeof result.authority === "string" ? result.authority : null,
      strategy: typeof result.strategy === "string" ? result.strategy : null,
      notSelfTheme: typeof result.notSelfTheme === "string" ? result.notSelfTheme : null,
      signature: typeof result.signature === "string" ? result.signature : null,
      definedCenters: Array.isArray(result.definedCenters)
        ? result.definedCenters.filter((item: unknown): item is string => typeof item === "string")
        : [],
      openCenters: Array.isArray(result.openCenters)
        ? result.openCenters.filter((item: unknown): item is string => typeof item === "string")
        : [],
      gatesPersonality: Array.isArray(result.gatesPersonality)
        ? result.gatesPersonality.filter((item: unknown): item is string => typeof item === "string")
        : [],
      gatesDesign: Array.isArray(result.gatesDesign)
        ? result.gatesDesign.filter((item: unknown): item is string => typeof item === "string")
        : [],
      status: result.status === "ready" || result.status === "error" || result.status === "pending"
        ? result.status
        : "pending",
      source: "human-design-py",
      note: typeof result.note === "string" ? result.note : undefined,
    };
  } catch (error) {
    console.error("[Settings] Human Design refresh failed", error);
    return HUMAN_DESIGN_PENDING;
  }
}

function Field({
  label,
  value,
  type = "text",
  placeholder,
  disabled = false,
  onChange,
}: {
  label: string;
  value: string;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm text-[#7B8776]">
      {label}
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="w-full rounded-2xl border border-black/5 bg-white px-5 py-4 text-[#33413A] outline-none disabled:bg-[#F5F1E8] disabled:text-[#7B8776]"
      />
    </label>
  );
}

function normalizeProfileDisplay(profile: LocalUserProfile | StorageUserProfile | null | undefined) {
  const displayName = profile?.fullName || profile?.displayName || "";
  const birthCity = profile?.birthPlace || profile?.birthCity || profile?.cityOfBirth || "";

  return {
    uid: profile?.uid ?? null,
    displayName,
    email: profile?.email || "",
    birthDate: profile?.birthDate || "",
    birthTime: profile?.birthTime || "",
    birthCity,
    language: profile?.language === "en" || profile?.language === "id" ? profile.language : "id",
    setupCompleted: profile?.setupCompleted === true,
  };
}

export default function SettingsPage() {
  const router = useRouter();
  const { language: appLanguage, setLanguage } = useLanguage();
  const t = translations[appLanguage];
  const auth = useAuth();
  const googleEmail = auth?.user?.email || "";
  const [originalProfile, setOriginalProfile] = useState<LocalUserProfile | StorageUserProfile | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthCity, setBirthCity] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [selectedCity, setSelectedCity] = useState<CitySelection | null>(null);
  const [language, setLocalLanguage] = useState<"id" | "en">("id");
  const [plan, setPlan] = useState<UserPlan>(createDefaultUserPlan());
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [dailyReminderEnabled, setDailyReminderEnabledState] = useState(true);
  const [notificationState, setNotificationState] = useState("checking");

  useEffect(() => {
    void getDailyReminderEnabled().then((enabled) => setDailyReminderEnabledState(enabled));
  }, []);

  const toggleDailyReminder = async (enabled: boolean) => {
    setDailyReminderEnabledState(enabled);
    await setDailyReminderEnabled(enabled);
    if (!enabled) { setNotificationState("disabled"); return; }
    if (!Capacitor.isNativePlatform()) { setNotificationState("web"); return; }
    const result = await refreshGentleNightReminder();
    setNotificationState(result.status === "permission-denied" ? "denied" : result.status);
  };

  useEffect(() => {
    const loadSettingsProfile = async () => {
    const activeUid = auth?.user?.uid ?? firebaseAuth.currentUser?.uid ?? null;
    const session = getLocalUserSession();
    const savedLanguage = (activeUid ? localStorage.getItem(`${LANGUAGE_STORAGE_KEY}:${activeUid}`) : null)
      || localStorage.getItem(LANGUAGE_STORAGE_KEY)
      || localStorage.getItem("bhumi-language");
    const userPlan = getOrCreateLocalUserPlan();
    const providerProfile = await storageProvider.getUserProfile();
    const sessionProfileMatches = !session.profile?.uid || !activeUid || session.profile.uid === activeUid;
    const safeSessionProfile = sessionProfileMatches ? session.profile : null;
    const profileSource = providerProfile ? "storageProvider" : safeSessionProfile ? "localSession" : "none";
    const activeProfile = providerProfile ?? safeSessionProfile;
    const normalizedProfile = normalizeProfileDisplay(activeProfile);

    console.log("[SETTINGS PROFILE SOURCE]", {
      activeUid,
      source: profileSource,
      uid: activeProfile?.uid ?? null,
      email: activeProfile?.email ?? null,
      fullName: activeProfile?.fullName ?? activeProfile?.displayName ?? null,
      birthDate: activeProfile?.birthDate ?? null,
      birthCity: activeProfile?.birthCity ?? activeProfile?.birthPlace ?? null,
      birthTime: activeProfile?.birthTime ?? null,
      setupCompleted: activeProfile?.setupCompleted ?? null,
    });
    console.log("[SETTINGS DATA SOURCE]", {
      activeUid,
      profileSource,
      cacheUidMatches: !activeProfile?.uid || !activeUid || activeProfile.uid === activeUid,
    });
    console.log("[SETTINGS PROFILE NORMALIZED]", normalizedProfile);

    if (session.profile && !sessionProfileMatches) {
      console.log("[USER ISOLATION CHECK]", {
        key: "bhumiUserProfile",
        activeUid,
        cachedUid: session.profile.uid ?? null,
        valid: false,
      });
    }

    if (activeProfile) {
      if (activeUid && activeProfile.uid !== activeUid) {
        console.error("[USER DATA MISMATCH BLOCKED] Settings profile mismatch");
        return;
      }
      setOriginalProfile(activeProfile);
      setFullName(normalizedProfile.displayName);
      setEmail(normalizedProfile.email || googleEmail || "");
      setBirthDate(normalizedProfile.birthDate);
      setBirthCity(normalizedProfile.birthCity);
      setBirthTime(normalizedProfile.birthTime);
      const normalizedLanguage: "id" | "en" = savedLanguage === "en"
        ? "en"
        : savedLanguage === "id"
          ? "id"
          : normalizedProfile.language === "en"
            ? "en"
            : "id";
      setLocalLanguage(normalizedLanguage);
    } else if (googleEmail) {
      setEmail(googleEmail);
    }

    setPlan(userPlan);
    setLoaded(true);
    };

    if (auth?.authLoading || auth?.profileLoading) return;
    void loadSettingsProfile();
  }, [auth?.authLoading, auth?.profileLoading, googleEmail, auth?.user?.uid]);

  useEffect(() => {
    if (googleEmail) {
      setEmail(googleEmail);
    }
  }, [googleEmail]);

  const effectiveEmail = googleEmail || email;

  const resolvedBadge = useMemo(() => {
    return getCurrentBadge(originalProfile as any) || "Penghuni Bhumi";
  }, [originalProfile]);

  const entitlement = useMemo(() => {
    return getEntitlementStatus(originalProfile as any);
  }, [originalProfile]);

  const billingPresentation = useMemo(() => {
    return getBillingPresentation(entitlement);
  }, [entitlement]);

  const statusBadge = useMemo(() => {
    const isFounder = (originalProfile as any)?.role === "founder" || resolvedBadge === "Founder";

    let label: string = billingPresentation.state === "premium_active" && resolvedBadge === "Penghuni Bhumi"
      ? "Premium Bhumi"
      : resolvedBadge;
    let description = "Akses publik aktif";
    let color = "bg-[#F5F1E8] text-[#7B8776] border-[#E8E9E5]";
    let Icon = Shield;

    if (isFounder) {
      label = "Founder Bhumi";
      description = "Akses Penuh Selamanya";
      color = "bg-[#FDF6E2] text-[#B7791F] border-[#F6E05E]";
      Icon = ShieldCheck;
    } else if (billingPresentation.state === "premium_active") {
      label = resolvedBadge === "Penghuni Bhumi" ? "Premium Bhumi" : resolvedBadge;
      description = "Akses Premium Aktif";
      color = "bg-[#E6FFFA] text-[#319795] border-[#81E6D9]";
      Icon = ShieldCheck;
    } else if (billingPresentation.state === "trial_active") {
      label = resolvedBadge;
      description = "Masa Uji Coba Aktif";
      color = "bg-[#EBF8FF] text-[#2B6CB0] border-[#90CDF4]";
      Icon = Shield;
    } else if (billingPresentation.state === "trial_exhausted" || billingPresentation.state === "premium_expired") {
      label = resolvedBadge;
      description = "Masa Uji Coba Berakhir";
      color = "bg-[#FFF5F5] text-[#C53030] border-[#FEB2B2]";
      Icon = ShieldAlert;
    }

    return {
      key: "status_badge",
      label,
      description,
      color,
      Icon,
    };
  }, [billingPresentation.state, originalProfile, resolvedBadge]);

  const membershipDisplay = useMemo(() => {
    const isFounder = (originalProfile as any)?.role === "founder" || resolvedBadge === "Founder";

    if (isFounder) {
      return {
        title: "Akses Lifetime Founder",
        subtitle: "Terima kasih atas kontribusi Anda membangun Bhumi.",
        remaining: null,
        nextBilling: null,
        pro: true,
      };
    }

    if (billingPresentation.state === "premium_active") {
      return {
        title: "Paket Premium Aktif",
        subtitle: "Akses penuh ke seluruh konten & analisis personal.",
        remaining: null,
        nextBilling: null,
        pro: true,
      };
    }

    if (billingPresentation.state === "trial_active") {
      let daysRemaining = 7;
      if (originalProfile?.trialEndsAt) {
        const trialEnd = new Date(
          typeof originalProfile.trialEndsAt === "object" && originalProfile.trialEndsAt && "seconds" in originalProfile.trialEndsAt
            ? (originalProfile.trialEndsAt as any).seconds * 1000
            : (originalProfile.trialEndsAt as string)
        );
        const diff = trialEnd.getTime() - Date.now();
        daysRemaining = Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
      }
      return {
        title: "Masa Uji Coba Premium",
        subtitle: `Uji coba premium aktif. Sisa ${daysRemaining} hari lagi.`,
        remaining: `${daysRemaining} Hari`,
        nextBilling: null,
        pro: false,
      };
    }

    if (billingPresentation.state === "trial_exhausted" || billingPresentation.state === "premium_expired") {
      return {
        title: "Masa Uji Coba Berakhir",
        subtitle: "Perpanjang akses untuk melanjutkan perjalanan pertumbuhan batinmu.",
        remaining: "0 Hari",
        nextBilling: null,
        pro: false,
      };
    }

    return {
      title: "Akses Publik Bhumi",
      subtitle: "Fitur inti tersedia. Paket premium sedang disiapkan.",
      remaining: null,
      nextBilling: null,
      pro: false,
    };
  }, [billingPresentation.state, originalProfile, resolvedBadge]);

  const handleManualCleanup = async () => {
    const confirmed = window.confirm(
      "Apakah kamu yakin ingin menghapus data Blueprint dan Human Design? Kamu akan diarahkan kembali ke halaman Setup untuk menghitung ulang."
    );
    if (!confirmed) return;

    setSaving(true);
    setMessage("Sedang membersihkan data...");

    try {
      await storageProvider.deleteUserBlueprint();

      // Also mark setup as not completed in the profile so the user is forced to rerun it
      if (originalProfile) {
        const updatedProfile = {
          ...originalProfile,
          setupCompleted: false,
          updatedAt: new Date().toISOString(),
        };
        await storageProvider.saveUserProfile(updatedProfile as unknown as StorageUserProfile);
      }

      router.replace("/setup");
    } catch (error) {
      console.error("[Settings] Cleanup failed", error);
      setMessage("Gagal membersihkan data. Silakan coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    const confirmed = window.confirm("Keluar dari akun?");
    if (!confirmed) return;

    setSigningOut(true);
    setMessage(null);

    try {
      if (auth?.logout) {
        await auth.logout();
      } else {
        // Fallback if context is not ready
        await cancelDailyReminders();
        await firebaseAuth.signOut();
        clearBhumiSessionForSignOut();
      }
      router.replace("/");
    } catch (error) {
      console.error("[Settings] Sign out failed", error);
      setMessage("Gagal keluar akun. Silakan coba lagi.");
      setSigningOut(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "PERINGATAN: Menghapus akun akan menghapus profil, data Blueprint, Journal, dan semua aktivitasmu secara permanen. Tindakan ini tidak dapat dibatalkan.\n\nApakah kamu yakin ingin melanjutkan?"
    );
    if (!confirmed) return;

    const secondConfirmation = window.confirm(
      "Apakah kamu benar-benar yakin? Semua data akan hilang selamanya."
    );
    if (!secondConfirmation) return;

    setSaving(true);
    setMessage("Sedang menghapus akun dan data...");

    try {
      const user = firebaseAuth.currentUser;

      // 1. Delete Firestore Data (Scoped to UID)
      const dataDeleted = await storageProvider.deleteUserDataCompletely();
      if (!dataDeleted) {
        throw new Error("account-data-delete-failed");
      }

      // 2. Delete Auth Account
      if (user) {
        try {
          await deleteUser(user);
        } catch (authError: any) {
          if (authError.code === "auth/requires-recent-login") {
            alert("Untuk keamanan, kamu perlu masuk kembali (re-login) sebelum dapat menghapus akun.");
            if (auth?.logout) {
              await auth.logout();
            } else {
              await cancelDailyReminders();
              await firebaseAuth.signOut();
              clearBhumiSessionForSignOut();
            }
            router.replace("/login");
            return;
          }
          throw authError;
        }
      }

      // 3. Cleanup local state
      clearBhumiSessionForSignOut();
      setMessage("Akun berhasil dihapus.");

      setTimeout(() => {
        router.replace("/");
      }, 2000);
    } catch (error) {
      console.error("[Settings] Delete account failed", error);
      setMessage("Gagal menghapus akun. Silakan hubungi dukungan jika masalah berlanjut.");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    const activeUid = auth?.user?.uid || "local-user";
    const now = new Date().toISOString();
    const currentProfile = originalProfile ?? {
      uid: activeUid,
      displayName: fullName,
      setupCompleted: true,
      authProvider: googleEmail ? "google" : "local",
      createdAt: now,
    } as LocalUserProfile;

    const isBirthFieldEdited = Boolean(
      originalProfile && (
        birthDate !== originalProfile.birthDate ||
        birthTime !== originalProfile.birthTime ||
        birthCity !== originalProfile.birthCity
      )
    );

    if (isBirthFieldEdited) {
      if (!birthTime || !birthTime.trim()) {
        setMessage("Jam kelahiran wajib diisi untuk pemetaan Human Design yang akurat.");
        return;
      }
      if (!selectedCity || selectedCity.latitude == null || selectedCity.longitude == null) {
        setMessage("Pilih kota kelahiran dari daftar autocomplete agar koordinat lokasi terdeteksi.");
        return;
      }
    }

    const cityChanged = birthCity !== currentProfile.birthCity;
    const cityFallback = resolveNatalLocation({
      birthDate,
      birthTime,
      birthCity,
      timezone: null,
      latitude: null,
      longitude: null,
    });
    const nextLatitude = selectedCity?.latitude ?? (cityChanged ? cityFallback?.latitude : currentProfile.latitude) ?? null;
    const nextLongitude = selectedCity?.longitude ?? (cityChanged ? cityFallback?.longitude : currentProfile.longitude) ?? null;

    // BUILD 31: Robust timezone resolution for settings
    let nextTimezone = "timezone" in currentProfile ? (currentProfile as any).timezone : null;
    let timezoneSource = "timezoneSource" in currentProfile ? (currentProfile as any).timezoneSource : "default";

    if (cityChanged || !nextTimezone) {
      if (cityFallback?.timezone) {
        nextTimezone = cityFallback.timezone;
        timezoneSource = "city-fallback";
      } else if (nextLongitude !== null) {
        const hours = Math.round(nextLongitude / 15);
        const sign = hours >= 0 ? "+" : "-";
        nextTimezone = `${sign}${Math.abs(hours).toString().padStart(2, '0')}:00`;
        timezoneSource = "longitude-approx";
      } else {
        nextTimezone = "+07:00";
        timezoneSource = "default";
      }
    }

    const birthDataChanged = Boolean(
      originalProfile &&
        (birthDate !== originalProfile.birthDate ||
          birthTime !== originalProfile.birthTime ||
          birthCity !== originalProfile.birthCity ||
          nextLatitude !== originalProfile.latitude ||
          nextLongitude !== originalProfile.longitude ||
          nextTimezone !== ("timezone" in originalProfile ? (originalProfile as any).timezone : null)),
    );

    const nextProfile: any = {
      ...currentProfile,
      uid: currentProfile.uid || activeUid,
      fullName,
      displayName: fullName,
      email: effectiveEmail || null,
      birthDate,
      birthTime,
      birthCity,
      birthPlace: birthCity,
      cityOfBirth: birthCity,
      latitude: nextLatitude,
      longitude: nextLongitude,
      timezone: nextTimezone,
      timezoneSource, // BUILD 31
      language,
      authProvider: googleEmail ? "google" : currentProfile.authProvider || "local",
      updatedAt: now,
    };

    setSaving(true);
    setMessage(null);

    try {
      const nextPlan: UserPlan = isDeveloperProEmail(effectiveEmail)
        ? {
            plan: "pro",
            startedAt: plan?.startedAt || now,
            source: "developer-override",
          }
        : plan || createDefaultUserPlan();
      const nextBlueprint = generateLocalBlueprint(nextProfile);
      const existingBlueprint = await storageProvider.getUserBlueprint();

      if (birthDataChanged || !existingBlueprint?.humanDesign) {
        nextBlueprint.humanDesign = await fetchHumanDesign({
          fullName,
          birthDate,
          birthTime,
          timezone: nextProfile.timezone,
        });
      } else {
        nextBlueprint.humanDesign = (existingBlueprint as any).humanDesign as LocalHumanDesign;
      }

      await storageProvider.saveUserProfile(nextProfile as unknown as StorageUserProfile);
      await storageProvider.saveUserBlueprint(nextBlueprint as unknown as StorageUserBlueprint);
      if (activeUid !== "local-user") {
        await userRepository.updatePresence(activeUid, {
          email: effectiveEmail || null,
          displayName: fullName,
          role: nextProfile.guardianRole || nextProfile.role || "user",
        }).catch((error) => {
          console.warn("[Settings] Presence update failed", error);
        });
      }

      if (activeUid && activeUid !== "local-user") {
        localStorage.setItem(`${LANGUAGE_STORAGE_KEY}:${activeUid}`, language);
        localStorage.setItem(`${USER_PLAN_STORAGE_KEY}:${activeUid}`, JSON.stringify(nextPlan));
      }
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
      localStorage.setItem(USER_PLAN_STORAGE_KEY, JSON.stringify(nextPlan));

      setLanguage(language);
      setOriginalProfile(nextProfile);
      setPlan(nextPlan);
      setMessage("Data berhasil diperbarui. Blueprint-mu sudah diperbarui.");
    } catch (error) {
      console.error("[Settings] Save failed", error);
      setMessage("Gagal menyimpan pengaturan. Silakan coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#FCFAF5] px-6">
        <div className="rounded-3xl bg-white p-8 shadow-xl text-center max-w-md w-full">
          <p className="text-[#4F5E52] text-lg">Membuka pengaturan...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FCFAF5] px-5 py-8 pb-28">
      <AppNav />
      <div className="mx-auto max-w-3xl space-y-6">
        <BhumiPageHeader />
        <header className="bhumi-card p-7 bg-gradient-to-br from-[#FCFAF5] to-[#F5F1E8]">
          <h1 className="text-3xl font-semibold text-[#4F5E52]">{t.settings.title}</h1>
          <p className="mt-4 text-[#7B8776] leading-relaxed">
            {t.settings.subtitle}
          </p>
        </header>

        <section className="bhumi-card space-y-5 p-6">
          <h2 className="text-xl font-semibold text-[#4F5E52]">{t.settings.userData}</h2>
          <Field label={t.settings.name} value={fullName} placeholder="Belum dilengkapi" onChange={setFullName} />
          <Field
            label="Email"
            value={email}
            type="email"
            disabled={Boolean(googleEmail)}
            onChange={setEmail}
          />
          {googleEmail ? (
            <p className="-mt-3 text-xs text-[#9BB89A]">
              {t.settings.emailFromGoogle}
            </p>
          ) : null}
          <Field label={t.settings.birthDate} value={birthDate} type="date" onChange={setBirthDate} />
          <label className="flex flex-col gap-2 text-sm text-[#7B8776]">
            {t.settings.birthCity}
            <CityAutocomplete
              value={birthCity}
              placeholder={birthCity ? t.settings.birthCity : "Belum dilengkapi"}
              onInputChange={(value) => {
                setBirthCity(value);
                setSelectedCity(null);
              }}
              onCitySelect={(selection) => {
                setBirthCity(selection.formattedCity);
                setSelectedCity(selection);
              }}
            />
          </label>
          <Field label={t.settings.birthTime} value={birthTime} type="time" onChange={setBirthTime} />
        </section>

        <section className="bhumi-card space-y-4 p-6">
          <h2 className="text-xl font-semibold text-[#4F5E52]">{t.settings.language}</h2>
          <select
            value={language}
            onChange={(event) => setLocalLanguage(event.target.value as "id" | "en")}
            className="w-full rounded-2xl border border-black/5 bg-white px-5 py-4 text-[#33413A] outline-none"
          >
            <option value="id">Indonesia</option>
            <option value="en">English</option>
          </select>
          <p className="text-xs text-[#9BB89A]">
            Preferensi bahasa akan disimpan untuk sistem terjemahan yang sudah tersedia.
          </p>
          {/* TODO: apply language preference globally across all app text */}
        </section>

        <section className="bhumi-card space-y-4 p-6">
          <h2 className="text-xl font-semibold text-[#4F5E52]">Dukungan Bhumi</h2>
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#E8E9E5] bg-white px-5 py-4">
            <div><p className="text-sm font-semibold text-[#4F5E52]">Pengingat Harian</p><p className="mt-1 text-xs text-[#7B8776]">Sapa ruangmu sekitar pukul 21.00 waktu perangkat.</p>{notificationState === "denied" && <p className="mt-1 text-xs text-amber-700">Izin notifikasi ditolak di perangkat.</p>}</div>
            <button type="button" role="switch" aria-checked={dailyReminderEnabled} aria-label="Pengingat Harian" onClick={() => void toggleDailyReminder(!dailyReminderEnabled)} className={`relative h-7 w-12 rounded-full transition ${dailyReminderEnabled ? "bg-[#4F5E52]" : "bg-[#D6D8D2]"}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${dailyReminderEnabled ? "left-6" : "left-1"}`} /></button>
          </div>
        </section>

        <section className="bhumi-card space-y-6 p-6">
          <h2 className="text-xl font-semibold text-[#4F5E52]">{t.settings.accountStatus}</h2>

          {statusBadge && (
            <div className="flex items-start gap-4 p-5 rounded-[2rem] bg-white border border-[#E8E9E5]/60 shadow-sm">
              <div className={`p-3 rounded-2xl ${statusBadge.color} shrink-0`}>
                <statusBadge.Icon size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#4F5E52]">
                  {statusBadge.label}
                </h3>
                <p className="text-sm text-[#7B8776] mt-1 leading-relaxed">
                  {statusBadge.description}
                </p>
              </div>
            </div>
          )}

                <div className="pt-4 border-t border-[#F5F1E8]">
            <p className="text-[10px] font-bold text-[#9BB89A] uppercase tracking-widest mb-3">Status Akses</p>
            {membershipDisplay.pro ? (
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-amber-900">{membershipDisplay.title}</p>
                  <p className="text-xs text-amber-700/70 mt-0.5">
                    {membershipDisplay.subtitle}
                  </p>
                </div>
                <ShieldCheck size={24} className="text-amber-600" />
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[#FCFAF5] border border-[#E8E9E5] flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-[#4F5E52]">{membershipDisplay.title}</p>
                  <p className="text-xs text-[#7B8776] mt-0.5">{membershipDisplay.subtitle}</p>
                  {membershipDisplay.remaining !== null ? (
                    <p className="text-xs text-[#7B8776] mt-1">Sisa trial: {membershipDisplay.remaining} hari</p>
                  ) : null}
                  {membershipDisplay.nextBilling ? (
                    <p className="text-xs text-[#7B8776] mt-1">Next billing date: {membershipDisplay.nextBilling}</p>
                  ) : null}
                </div>
                <Info size={24} className="text-[#9BB89A]" />
              </div>
            )}

            <Link
              href="/premium-bhumi"
              className="mt-4 w-full rounded-2xl border border-[#E5DCD0] bg-white px-5 py-3 text-[#4F5E52] transition hover:bg-[#F5F1E8] text-center block font-medium"
            >
              Kelola Langganan Premium
            </Link>
          </div>
        </section>

        <section className="bhumi-card space-y-4 p-6">
          <h2 className="text-xl font-semibold text-[#4F5E52]">{t.settings.account}</h2>
          <p className="text-sm text-[#7B8776]">
            <span className="font-medium text-[#4F5E52]">Email: </span>
            {effectiveEmail || "-"}
          </p>
          <div className="pt-2 space-y-3">
            <Link
              href="/tentang"
              className="w-full rounded-2xl border border-[#E5DCD0] bg-white px-5 py-3 text-[#4F5E52] transition hover:bg-[#F5F1E8] text-center block"
            >
              Tentang Bhumi Amartya
            </Link>
            <button
              type="button"
              onClick={() => window.open("https://wedhaswara.my.id/privacy-policy-bhumi-amartya", "_blank")}
              className="w-full rounded-2xl border border-[#E5DCD0] bg-white px-5 py-3 text-[#4F5E52] transition hover:bg-[#F5F1E8] text-center block"
            >
              Kebijakan Privasi
            </button>
            <Link
              href="/syarat-ketentuan"
              className="w-full rounded-2xl border border-[#E5DCD0] bg-white px-5 py-3 text-[#4F5E52] transition hover:bg-[#F5F1E8] text-center block"
            >
              Syarat & Ketentuan
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="w-full rounded-2xl border border-[#E5DCD0] bg-white px-5 py-3 text-[#4F5E52] transition hover:bg-[#F5F1E8] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {signingOut ? t.settings.signingOut : t.common.signOut}
            </button>
          </div>
        </section>

        <section className="bhumi-card space-y-4 p-6 border-red-100 bg-red-50/10">
          <h2 className="text-xl font-semibold text-red-800">Zona Bahaya</h2>
          <p className="text-sm text-red-700 leading-relaxed">
            Jika data Blueprint atau Human Design kamu terlihat salah, gunakan opsi ini untuk menghapus data lama dan menghitung ulang dari awal.
          </p>
          <button
            type="button"
            onClick={handleManualCleanup}
            disabled={saving}
            className="w-full rounded-2xl bg-red-50/10 border border-red-200 px-5 py-3 text-red-700 transition hover:bg-red-50 font-medium disabled:opacity-50"
          >
            Hapus & Perbaiki Blueprint
          </button>

          <div className="pt-4 border-t border-red-100">
            <h3 className="text-sm font-semibold text-red-800 mb-2">Penghapusan Akun</h3>
            <p className="text-xs text-red-600 mb-4">
              Menghapus akun akan menghapus profil, data Blueprint, dan Journal secara permanen.
            </p>
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={saving}
              className="w-full rounded-2xl bg-red-600 px-5 py-3 text-white transition hover:bg-red-700 font-medium disabled:opacity-50"
            >
              Hapus Akun
            </button>
          </div>
        </section>

        {message ? (
          <p className="rounded-2xl bg-white px-5 py-4 text-center text-sm text-[#4F5E52]">
            {message}
          </p>
        ) : null}

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !fullName || !birthDate || !birthTime || !birthCity}
          className="bhumi-button w-full disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saving ? t.settings.saving : t.settings.save}
        </button>
      </div>
    </main>
  );
}
