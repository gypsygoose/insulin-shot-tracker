import Svg, { Circle, Path } from "react-native-svg";
import {
  PRIMARY_TEXT_COLOR,
  TOAST_ICON_SIZE,
  TOAST_ERROR_COLOR,
} from "../../constants";

const CROSS_STROKE_WIDTH = 2.2;

export function ToastErrorIcon() {
  return (
    <Svg
      width={TOAST_ICON_SIZE}
      height={TOAST_ICON_SIZE}
      viewBox="0 0 24 24"
      fill="none"
    >
      <Circle cx="12" cy="12" r="12" fill={TOAST_ERROR_COLOR} />
      <Path
        d="M8 8 16 16M16 8 8 16"
        stroke={PRIMARY_TEXT_COLOR}
        strokeWidth={CROSS_STROKE_WIDTH}
        strokeLinecap="round"
      />
    </Svg>
  );
}
