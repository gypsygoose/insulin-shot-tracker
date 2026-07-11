import { TFunction } from "i18next";
import { ColorLabelDescriptor, ColorLabelType } from "../../../logic";

// Formats the descriptor PointService.colorLabel() returns (see
// PointService.ts, which stays free of an i18next dependency by returning a
// descriptor rather than a string) — the only consumer, so this stays local
// rather than exported.
export function formatColorLabel(
  t: TFunction,
  descriptor: ColorLabelDescriptor,
): string {
  switch (descriptor.type) {
    case ColorLabelType.White:
      return t("stateMachine.colorLabel.white", { count: descriptor.count });
    case ColorLabelType.Maroon:
      return t("stateMachine.colorLabel.maroon");
    case ColorLabelType.Black:
      return t("stateMachine.colorLabel.black");
    case ColorLabelType.Gray:
      return t("stateMachine.colorLabel.gray");
    case ColorLabelType.Days:
      return t("common.daysCount", { count: descriptor.count });
  }
}
