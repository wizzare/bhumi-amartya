"use client";

import { createContext, useContext } from "react";

type Language = "id" | "en" | "ms";

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
};

const LanguageContext = createContext<LanguageContextType>({
  language: "id",
  setLanguage: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  return (
    <LanguageContext.Provider value={{ language: "id", setLanguage: () => {} }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
