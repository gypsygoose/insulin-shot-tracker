import Svg, { Circle, Path } from "react-native-svg";
import { ICON_SIZE } from "../../constants";
import { useTheme } from "../../theme";

const ICON_STROKE_WIDTH = 1;

// Icon shape matching Figma (node-id 26-3, file grYg39698ogy0nEBd88Fup)
export function HelpIcon() {
  const { colors } = useTheme();
  const ICON_COLOR = colors.icon;
  return (
    <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 36 36" fill="none">
      <Path
        d="M18,2A16,16,0,1,0,34,18,16,16,0,0,0,18,2Zm0,30A14,14,0,1,1,32,18,14,14,0,0,1,18,32Z"
        fill={ICON_COLOR}
        stroke={ICON_COLOR}
        strokeWidth={ICON_STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18.29,8.92a7.38,7.38,0,0,0-5.72,2.57,1,1,0,0,0-.32.71.92.92,0,0,0,.95.92,1.08,1.08,0,0,0,.71-.29,5.7,5.7,0,0,1,4.33-2c2.36,0,3.83,1.52,3.83,3.41v.05c0,2.21-1.76,3.44-4.54,3.65a.8.8,0,0,0-.76.92s0,2.32,0,2.75a1,1,0,0,0,1,.9h.11a1,1,0,0,0,.9-1V19.45c3-.42,5.43-2,5.43-5.28v-.05C24.18,11.12,21.84,8.92,18.29,8.92Z"
        fill={ICON_COLOR}
        stroke={ICON_COLOR}
        strokeWidth={ICON_STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle
        cx="17.78"
        cy="26.2"
        r="1.25"
        fill={ICON_COLOR}
        stroke={ICON_COLOR}
        strokeWidth={ICON_STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
