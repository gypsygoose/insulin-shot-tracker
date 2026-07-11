import { pad2 } from "../../../utils";
import { splitSeconds } from "../../../utils";

export function formatDuration(totalSeconds: number): string {
  const { minutes, seconds } = splitSeconds(totalSeconds);
  return `${minutes}:${pad2(seconds)}`;
}
