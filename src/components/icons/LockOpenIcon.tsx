import Svg, { Path } from "react-native-svg";
import { ICON_SIZE } from "../../constants";
import { useTheme } from "../../theme";

const ICON_STROKE_WIDTH = 1;

// Icon shape matching Figma (node-id 26-3, file grYg39698ogy0nEBd88Fup)
export function LockOpenIcon() {
  const { colors } = useTheme();
  const ICON_COLOR = colors.icon;
  return (
    <Svg
      width={ICON_SIZE}
      height={ICON_SIZE}
      viewBox="0 0 36 36"
      fill={ICON_COLOR}
    >
      <Path
        d="M12,25.14V28h2V25.23a2.42,2.42,0,1,0-2-.09Z"
        stroke={ICON_COLOR}
        strokeWidth={ICON_STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M26,2a8.2,8.2,0,0,0-8,8.36V15H2V32a2,2,0,0,0,2,2H22a2,2,0,0,0,2-2V15H20V10.36A6.2,6.2,0,0,1,26,4a6.2,6.2,0,0,1,6,6.36v6.83a1,1,0,0,0,2,0V10.36A8.2,8.2,0,0,0,26,2ZM22,17V32H4V17Z"
        stroke={ICON_COLOR}
        strokeWidth={ICON_STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
