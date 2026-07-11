import Svg, { Path } from "react-native-svg";
import { ICON_SIZE } from "../../constants";
import { useTheme } from "../../theme";

const ICON_STROKE_WIDTH = 1.83333;

// Icon shape matching Figma (node-id 26-3, file grYg39698ogy0nEBd88Fup)
export function MenuIcon() {
  const { colors } = useTheme();
  const ICON_COLOR = colors.icon;
  return (
    <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 22 22" fill="none">
      <Path
        d="M8.25 2.75H3.66667C3.16041 2.75 2.75 3.16041 2.75 3.66667V8.25C2.75 8.75626 3.16041 9.16667 3.66667 9.16667H8.25C8.75626 9.16667 9.16667 8.75626 9.16667 8.25V3.66667C9.16667 3.16041 8.75626 2.75 8.25 2.75Z"
        stroke={ICON_COLOR}
        strokeWidth={ICON_STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8.25 12.8333H3.66667C3.16041 12.8333 2.75 13.2437 2.75 13.75V18.3333C2.75 18.8396 3.16041 19.25 3.66667 19.25H8.25C8.75626 19.25 9.16667 18.8396 9.16667 18.3333V13.75C9.16667 13.2437 8.75626 12.8333 8.25 12.8333Z"
        stroke={ICON_COLOR}
        strokeWidth={ICON_STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12.8333 3.66667H19.25"
        stroke={ICON_COLOR}
        strokeWidth={ICON_STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12.8333 8.25H19.25"
        stroke={ICON_COLOR}
        strokeWidth={ICON_STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12.8333 13.75H19.25"
        stroke={ICON_COLOR}
        strokeWidth={ICON_STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12.8333 18.3333H19.25"
        stroke={ICON_COLOR}
        strokeWidth={ICON_STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
