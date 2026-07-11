import { ExportedAppData } from "../types";

// Persisted auto-lock settings, plus the pending lock deadline (if any) so
// the countdown survives the app being closed and reopened.
export interface StoredAutoLock {
  enabled: boolean;
  afterMarkSeconds: number;
  afterUnlockSeconds: number;
  deadline: number | null;
}

export enum ImportResultType {
  Success = "success",
  Cancelled = "cancelled",
  Invalid = "invalid",
}

export type ImportResult =
  | { type: ImportResultType.Success; data: ExportedAppData }
  | { type: ImportResultType.Cancelled }
  | { type: ImportResultType.Invalid };
