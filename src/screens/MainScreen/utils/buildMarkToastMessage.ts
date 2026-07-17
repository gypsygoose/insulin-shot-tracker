import { TFunction } from "i18next";
import {
  PointAddress,
  PointDefinition,
  PointRestoreMode,
  StoredPointState,
  ToastStatus,
} from "../../../types";
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
// status from Success to Warn. Re-runs the pure PointService.onPress against
// the pre-mark state with the real daysToAvailable (not a stand-in 0), since
// the MarkDialog caller invokes this *before* actions.markPointAt with a
// user-picked, possibly-backdated timestamp — one that can still fall inside
// the days-to-available window even though the point is available "now" (the
// only thing PointContextMenu's own pre-check gates on) — so a Blocked/
// Unavailable outcome here is possible and must return null (no misleading
// success toast) rather than only being checked for Blackout.
export function buildMarkToastMessage(
  t: TFunction,
  locale: string,
  pointId: string,
  pointState: StoredPointState,
  timestamp: number,
  daysToWhite: number,
  daysToAvailable: number,
  pointMap: Record<string, PointDefinition>,
  pointAddress: Record<string, PointAddress>,
  pointRestoreMode: PointRestoreMode,
): MarkToastMessage | null {
  const addressSuffix = buildPointAddressSuffix(
    t,
    pointId,
    pointMap,
    pointAddress,
  );
  if (!addressSuffix) return null;

  const result = PointService.onPress(
    pointState,
    timestamp,
    daysToWhite,
    daysToAvailable,
    pointRestoreMode,
  );

  if (
    result.type === PressResultType.Blocked ||
    result.type === PressResultType.Unavailable
  ) {
    return null;
  }

  let message = t("toast.pointMarked", { address: addressSuffix });
  let status = ToastStatus.Success;

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
