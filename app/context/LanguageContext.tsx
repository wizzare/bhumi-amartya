"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { changeI18nLanguage } from "@/lib/i18n";
import { getDictionaryKey, normalizeLocale, resolveEffectiveLocale } from "@/lib/locale/normalizeLocale";
import { userRepository } from "@/lib/repositories/userRepository";

type Language = "id" | "en" | "ms";
type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
};

const LanguageContext = createContext<LanguageContextType>({
  language: "id",
  setLanguage: () => {},
});

function readPersistedLanguage(): string | null {
  try {
    return localStorage.getItem("bhumiLanguage") || localStorage.getItem("bhumi-language");
  } catch {
    return null;
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const uid = auth?.user?.uid ?? null;
  const [selection, setSelection] = useState<{ uid: string | null; language: Language } | null>(null);
  const [persisted, setPersisted] = useState<string | null>(null);
  const [device, setDevice] = useState<string | null>(null);
  const writes = useRef(Promise.resolve());
  const previousUid = useRef(uid);
  const language = getDictionaryKey(resolveEffectiveLocale(
    selection?.uid === uid ? selection.language : null,
    auth?.userProfile?.uid === uid ? auth.userProfile.language : null,
    persisted,
    device,
  ));

  useEffect(() => {
    setPersisted(readPersistedLanguage());
    setDevice(navigator.languages?.find((value) => /^(id|en|ms)(?:-|$)/i.test(value)) ?? navigator.language);
  }, []);

  useEffect(() => {
    if (previousUid.current !== uid) {
      previousUid.current = uid;
      setSelection(null);
    }
  }, [uid]);

  useEffect(() => {
    changeI18nLanguage(language);
    document.documentElement.lang = normalizeLocale(language);
  }, [language]);

  const changeLanguage = (lang: Language) => {
    if (!["id", "en", "ms"].includes(lang)) return;
    setSelection({ uid, language: lang });
    setPersisted(lang);
    try {
      localStorage.setItem("bhumiLanguage", lang);
      localStorage.setItem("bhumi-language", lang);
    } catch {
      console.warn("[LOCALE] language storage unavailable");
    }
    if (uid) {
      writes.current = writes.current
        .then(() => userRepository.upsertUserProfile(uid, { language: normalizeLocale(lang) }))
        .catch(() => {
          console.warn("[LOCALE] profile language persist failed");
        });
    }
  };

  return <LanguageContext.Provider value={{ language, setLanguage: changeLanguage }}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => useContext(LanguageContext);
