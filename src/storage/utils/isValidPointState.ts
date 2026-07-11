import { StoredPointState } from "../../types";

export function isValidPointState(value: unknown): value is StoredPointState {
  if (!value || typeof value !== "object") return false;
  const state = value as Partial<StoredPointState>;
  if (typeof state.pointId !== "string") return false;
  if (typeof state.isManuallyBlocked !== "boolean") return false;
  if (
    state.lastInjectionAt !== undefined &&
    typeof state.lastInjectionAt !== "number"
  )
    return false;
  if (
    state.blackoutStartedAt !== undefined &&
    typeof state.blackoutStartedAt !== "number"
  )
    return false;
  if (
    state.blackoutDurationDays !== undefined &&
    typeof state.blackoutDurationDays !== "number"
  )
    return false;
  return true;
}
