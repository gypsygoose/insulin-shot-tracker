export const SECONDS_PER_MINUTE = 60;

export function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

export function splitSeconds(totalSeconds: number): {
  minutes: number;
  seconds: number;
} {
  return {
    minutes: Math.floor(totalSeconds / SECONDS_PER_MINUTE),
    seconds: totalSeconds % SECONDS_PER_MINUTE,
  };
}
