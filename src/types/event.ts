import { StoredPointState } from './point';
import { ZoneId } from './zone';

// Event in undo history
export enum AppEventType {
  Injection = 'injection',
  Blackout = 'blackout',
  ManualBlock = 'manual-block',
  ManualUnblock = 'manual-unblock',
  ManualClear = 'manual-clear',
}

export interface AppEvent {
  id: string;
  timestamp: number;
  type: AppEventType;
  pointId: string;
  zoneId: ZoneId;
  prevPointState: StoredPointState;
}
