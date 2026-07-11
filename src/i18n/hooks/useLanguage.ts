import { useContext } from "react";
import { LanguageContext } from "../LanguageContext";
import { LanguageContextValue } from "../types";

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx)
    throw new Error("useLanguage() must be used within a LanguageProvider");
  return ctx;
}
