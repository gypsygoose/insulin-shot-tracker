import Svg, { Circle, Path, Rect } from "react-native-svg";
import {
  PRIMARY_TEXT_COLOR,
  TOAST_ICON_SIZE,
  TOAST_WARN_COLOR,
} from "../../constants";

export function ToastWarnIcon() {
  return (
    <Svg
      width={TOAST_ICON_SIZE}
      height={TOAST_ICON_SIZE}
      viewBox="0 0 24 24"
      fill="none"
    >
      <Path d="M12 1.5 23 21.5H1L12 1.5Z" fill={TOAST_WARN_COLOR} />
      <Rect x="10.6" y="8.5" width="2.8" height="6.5" rx="1.4" fill={PRIMARY_TEXT_COLOR} />
      <Circle cx="12" cy="18" r="1.6" fill={PRIMARY_TEXT_COLOR} />
    </Svg>
  );
}
