import Svg, { Circle, Path } from "react-native-svg";
import {
  PRIMARY_TEXT_COLOR,
  TOAST_ICON_SIZE,
  TOAST_SUCCESS_COLOR,
} from "../../constants";

const CHECK_STROKE_WIDTH = 2.2;

export function ToastSuccessIcon() {
  return (
    <Svg
      width={TOAST_ICON_SIZE}
      height={TOAST_ICON_SIZE}
      viewBox="0 0 24 24"
      fill="none"
    >
      <Circle cx="12" cy="12" r="12" fill={TOAST_SUCCESS_COLOR} />
      <Path
        d="M7 12.5 10.3 15.8 17 8.5"
        stroke={PRIMARY_TEXT_COLOR}
        strokeWidth={CHECK_STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
