import "i18next";
import type { AppLocale } from "./locales";

// Types every t() call app-wide against en's key shape (the source of truth
// for the translation key set — see locales/en.ts's AppLocale).
declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation";
    resources: { translation: AppLocale };
  }
}
