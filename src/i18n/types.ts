import { LanguageMode } from "../types";
import { ResolvedLanguage } from "./utils";

export interface LanguageContextValue {
  mode: LanguageMode;
  resolvedLanguage: ResolvedLanguage;
  setMode: (mode: LanguageMode) => Promise<void>;
}
