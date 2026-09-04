"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { useAuth } from "@/context/AuthContext";
import { changeI18nLanguage } from "@/lib/i18n";
import { normalizeLocale } from "@/lib/locale/normalizeLocale";
import { userRepository } from "@/lib/repositories/userRepository";
import { isEnlEdition } from "@/lib/config/edition";

// D-V5-35: CURRENT locales id / en / ms. es-ES, pt-BR, fr-FR are DEFERRED.
type Language =
  | "id"
  | "en"
  | "ms";

const SUPPORTED: Language[] = ["id", "en", "ms"];

function isSupported(value: unknown): value is Language {
  return typeof value === "string" && (SUPPORTED as string[]).includes(value);
}

/** Accepts short codes and full BCP47 tags; returns the canonical short code. */
function toCanonicalShort(value: unknown): Language | null {
  if (!isSupported(value)) return null;
  return value;
}

function fromProfileLanguage(value: unknown): Language | null {
  if (typeof value !== "string") return null;
  const lower = value.toLowerCase();
  if (lower.startsWith("id")) return "id";
  if (lower.startsWith("en")) return "en";
  if (lower.startsWith("ms")) return "ms";
  return null;
}

type LanguageContextType = {

  language: Language;

  setLanguage:
    (lang: Language) => void;

};

const LanguageContext =
  createContext<
    LanguageContextType
  >({

    language: "id",

    setLanguage: () => {},

  });

export function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = useAuth();

  const [language, setLanguage] =
    useState<Language>(() => {
      if (isEnlEdition()) {
        return "en";
      }
      if (typeof window === "undefined") {
        return "id";
      }

      const savedLanguage =
        localStorage.getItem(
          "bhumiLanguage"
        ) ||
        localStorage.getItem(
          "bhumi-language"
        );

      const canonical = toCanonicalShort(savedLanguage);
      return canonical ?? "id";
    });

  // Keep the canonical i18n instance in sync with React state.
  useEffect(() => {
    changeI18nLanguage(language);
  }, [language]);

  const changeLanguage =
    (lang: Language) => {
      if (isEnlEdition()) {
        setLanguage("en");
        return;
      }

      setLanguage(lang);

      localStorage.setItem(
        "bhumiLanguage",
        lang
      );

      localStorage.setItem(
        "bhumi-language",
        lang
      );

      // Build 106 R-33: an explicit choice persists to the user profile as the
      // canonical BCP47 tag, not just to localStorage. Fire-and-forget; the
      // localStorage write above already covers the offline / signed-out case,
      // and the profile-sync effect below treats an explicit local choice as
      // authoritative over a stale profile value.
      const uid = auth?.user?.uid;
      if (uid) {
        void userRepository
          .upsertUserProfile(uid, { language: normalizeLocale(lang) })
          .catch((error) => {
            console.warn("[LOCALE] profile language persist failed (non-blocking)", error);
          });
      }

    };

  useEffect(() => {
    if (isEnlEdition()) {
      if (language !== "en") {
        setLanguage("en");
      }
      return;
    }

    const profileLanguageRaw = auth?.userProfile?.language;
    const profileLanguage = fromProfileLanguage(profileLanguageRaw);
    const savedLanguage =
      typeof window !== "undefined"
        ? localStorage.getItem("bhumiLanguage") || localStorage.getItem("bhumi-language")
        : null;
    const savedCanonical = toCanonicalShort(savedLanguage);

    if (savedCanonical) {
      if (savedCanonical !== language) {
        setLanguage(savedCanonical);
      }
      return;
    }

    if (profileLanguage && profileLanguage !== language) {
      setLanguage(profileLanguage);
      localStorage.setItem("bhumiLanguage", profileLanguage);
      localStorage.setItem("bhumi-language", profileLanguage);
    }
  }, [auth?.userProfile?.language, language]);

  return (

    <LanguageContext.Provider
      value={{
        language,
        setLanguage:
          changeLanguage,
      }}

    >

      {children}

    </LanguageContext.Provider>

  );

}

export const useLanguage =
  () => useContext(
    LanguageContext
  );
