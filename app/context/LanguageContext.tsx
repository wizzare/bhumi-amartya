"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { useAuth } from "@/context/AuthContext";

type Language =
  | "id"
  | "en";

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
      if (typeof window === "undefined") {
        return "id";
      }

      const savedLanguage =
        localStorage.getItem(
          "bhumiLanguage"
        ) as Language | null ||
        localStorage.getItem(
          "bhumi-language"
        ) as Language | null;

      return savedLanguage === "en" || savedLanguage === "id"
        ? savedLanguage
        : "id";
    });

  const changeLanguage =
    (lang: Language) => {

      setLanguage(lang);

      localStorage.setItem(
        "bhumiLanguage",
        lang
      );

      localStorage.setItem(
        "bhumi-language",
        lang
      );

    };

  useEffect(() => {
    const profileLanguage = auth?.userProfile?.language;
    const savedLanguage =
      typeof window !== "undefined"
        ? localStorage.getItem("bhumiLanguage") || localStorage.getItem("bhumi-language")
        : null;

    if (savedLanguage === "id" || savedLanguage === "en") {
      if (savedLanguage !== language) {
        setLanguage(savedLanguage);
      }
      return;
    }

    if ((profileLanguage === "id" || profileLanguage === "en") && profileLanguage !== language) {
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
