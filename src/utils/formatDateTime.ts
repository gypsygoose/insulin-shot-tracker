// Locale-aware date/time formatting (e.g. DD.MM.YYYY for ru, MM/DD/YYYY for
// en) — callers pass the active i18next language (`i18n.language` from
// useTranslation()) rather than this file depending on i18next itself.
export function formatDateTime(timestamp: number, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(timestamp));
}
