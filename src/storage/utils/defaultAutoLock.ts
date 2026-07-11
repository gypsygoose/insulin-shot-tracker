import { StoredAutoLock } from "../types";

export const DEFAULT_AUTO_LOCK_AFTER_MARK_SECONDS = 30;
export const DEFAULT_AUTO_LOCK_AFTER_UNLOCK_SECONDS = 5 * 60;

export function defaultAutoLock(): StoredAutoLock {
  return {
    enabled: false,
    afterMarkSeconds: DEFAULT_AUTO_LOCK_AFTER_MARK_SECONDS,
    afterUnlockSeconds: DEFAULT_AUTO_LOCK_AFTER_UNLOCK_SECONDS,
    deadline: null,
  };
}
