import { TFunction } from "i18next";
import { StoredPointState, ToastStatus } from "../../../types";
import { PointService, PressResultType } from "../../../logic";
import { formatDateTime } from "../../../utils";
import { MARK_BACKDATED_THRESHOLD_MS } from "../../../constants";
import { buildPointAddressSuffix } from "./buildPointAddressSuffix";

interface MarkToastMessage {
  message: string;
  status: ToastStatus;
}

// Toast shown after a point is marked (tap or the context menu's "Отметить"
// dialog), confirming which point it was via its body-relative address, plus
// the marked time if it's backdated and a note if the mark triggered a
// system blackout (site reused too early) — which also bumps the toast's
// status from Success to Warn.
export function buildMarkToastMessage(
  t: TFunction,
  locale: string,
  pointId: string,
  pointState: StoredPointState,
  timestamp: number,
  daysToWhite: number,
): MarkToastMessage | null {
  const addressSuffix = buildPointAddressSuffix(t, pointId);
  if (!addressSuffix) return null;

  let message = t("toast.pointMarked", { address: addressSuffix });
  let status = ToastStatus.Success;

  const result = PointService.onPress(pointState, timestamp, daysToWhite);
  if (result.type === PressResultType.Blackout) {
    const days = result.newState.blackoutDurationDays!;
    message += t("toast.markBlackoutSuffix", { count: days });
    status = ToastStatus.Warn;
  }

  if (Date.now() - timestamp > MARK_BACKDATED_THRESHOLD_MS) {
    message += t("toast.markBackdatedSuffix", {
      dateTime: formatDateTime(timestamp, locale),
    });
  }

  return { message, status };
}
