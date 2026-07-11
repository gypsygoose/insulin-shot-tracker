import { LanguageMode } from "../../types";
import { getDeviceLanguage, ResolvedLanguage } from "./deviceLanguage";

export function resolveLanguage(mode: LanguageMode): ResolvedLanguage {
  if (mode !== LanguageMode.System) return mode;
  return getDeviceLanguage();
}
