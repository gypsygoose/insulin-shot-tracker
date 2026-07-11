import { TFunction } from "i18next";
import { MINUTES_PER_DAY } from "../../../constants";

export function formatCountdown(t: TFunction, ms: number): string {
  if (ms <= 0) return t("common.minutesAbbrev", { count: 0 });
  const totalMinutes = Math.ceil(ms / 60_000);
  const days = Math.floor(totalMinutes / MINUTES_PER_DAY);
  const hours = Math.floor((totalMinutes % MINUTES_PER_DAY) / 60);
  const minutes = totalMinutes % 60;
  const parts: string[] = [];
  if (days > 0) parts.push(t("common.daysAbbrev", { count: days }));
  if (days > 0 || hours > 0)
    parts.push(t("common.hoursAbbrev", { count: hours }));
  parts.push(t("common.minutesAbbrev", { count: minutes }));
  return parts.join(" ");
}
