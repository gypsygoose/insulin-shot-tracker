import { AppEvent, AppEventType } from "../../types";
import { isValidPointState } from "./isValidPointState";

const APP_EVENT_TYPES: AppEventType[] = Object.values(AppEventType);

export function isValidEvent(value: unknown): value is AppEvent {
  if (!value || typeof value !== "object") return false;
  const event = value as Partial<AppEvent>;
  if (typeof event.id !== "string") return false;
  if (typeof event.timestamp !== "number") return false;
  if (
    typeof event.type !== "string" ||
    !APP_EVENT_TYPES.includes(event.type as AppEventType)
  )
    return false;
  if (typeof event.pointId !== "string") return false;
  if (typeof event.zoneId !== "string") return false;
  if (!isValidPointState(event.prevPointState)) return false;
  return true;
}
