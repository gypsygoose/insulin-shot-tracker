import Svg, { Circle, Rect } from "react-native-svg";
import {
  PRIMARY_TEXT_COLOR,
  TOAST_ICON_SIZE,
  TOAST_INFO_COLOR,
} from "../../constants";

export function ToastInfoIcon() {
  return (
    <Svg
      width={TOAST_ICON_SIZE}
      height={TOAST_ICON_SIZE}
      viewBox="0 0 24 24"
      fill="none"
    >
      <Circle cx="12" cy="12" r="12" fill={TOAST_INFO_COLOR} />
      <Circle cx="12" cy="7" r="1.6" fill={PRIMARY_TEXT_COLOR} />
      <Rect x="10.6" y="10.5" width="2.8" height="7.5" rx="1.4" fill={PRIMARY_TEXT_COLOR} />
    </Svg>
  );
}
