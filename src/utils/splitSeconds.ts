export const SECONDS_PER_MINUTE = 60;

export interface SplitSeconds {
  minutes: number;
  seconds: number;
}

export function splitSeconds(totalSeconds: number): SplitSeconds {
  return {
    minutes: Math.floor(totalSeconds / SECONDS_PER_MINUTE),
    seconds: totalSeconds % SECONDS_PER_MINUTE,
  };
}
