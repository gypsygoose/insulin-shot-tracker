import { View, StyleSheet, DimensionValue } from "react-native";
import InjectionButton from "./InjectionButton";
import {
  ZONE_COLORS,
  ZONE_LAYOUT,
  ZONE_MIRROR_MAP,
  BUTTONS_BY_ZONE,
} from "../data/zones";
import { ButtonColor } from "../types";

// Combined fill/stroke opacity baked into the colour (matches the
// fill-opacity 0.22 / stroke-opacity 0.88, both under a 0.78 group opacity,
// from the Figma "with buttons" frame / assets/images/body_icon.svg).
const FILL_ALPHA = "2C"; // ~17%
const BORDER_ALPHA = "AF"; // ~69%

function chunk<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }
  return rows;
}

interface Props {
  zoneId: string;
  mirrored: boolean;
  getColor: (buttonId: string) => ButtonColor;
  isCheckmarked: (buttonId: string) => boolean;
  onPress: (buttonId: string) => void;
  onLongPress: (buttonId: string) => void;
}

// A zone is an absolutely positioned block matching its region on the body
// image (same position/size/colours as assets/images/body_icon.svg). The
// buttons inside are laid out on a flex grid relative to that block, not by
// global (x, y) coordinates — same row/column counts as the source design.
export default function ZoneContainer({
  zoneId,
  mirrored,
  getColor,
  isCheckmarked,
  onPress,
  onLongPress,
}: Props) {
  // Mirror mode swaps a zone into its left/right counterpart's screen
  // position (button identity/colour stays tied to zoneId), and flips the
  // left-to-right order of buttons within each row to match.
  const layout = ZONE_LAYOUT[mirrored ? ZONE_MIRROR_MAP[zoneId] : zoneId];
  const colors = ZONE_COLORS[zoneId];
  const rows = chunk(BUTTONS_BY_ZONE[zoneId], layout.cols).map((row) =>
    mirrored ? [...row].reverse() : row,
  );

  return (
    <View
      style={[
        styles.zone,
        {
          left: `${(layout.x * 100).toFixed(2)}%` as DimensionValue,
          top: `${(layout.y * 100).toFixed(2)}%` as DimensionValue,
          width: `${(layout.width * 100).toFixed(2)}%` as DimensionValue,
          height: `${(layout.height * 100).toFixed(2)}%` as DimensionValue,
          backgroundColor: `${colors.accent}${FILL_ALPHA}`,
          borderColor: `${colors.accent}${BORDER_ALPHA}`,
        },
      ]}
    >
      {rows.map((row, i) => (
        <View key={i} style={styles.row}>
          {row.map((btn) => (
            <InjectionButton
              key={btn.id}
              id={btn.id}
              color={getColor(btn.id)}
              glowColor={colors.glow}
              showCheckmark={isCheckmarked(btn.id)}
              onPress={() => onPress(btn.id)}
              onLongPress={() => onLongPress(btn.id)}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  zone: {
    position: "absolute",
    borderWidth: 1.5,
    borderRadius: 14,
    flexDirection: "column",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    width: "100%",
  },
});
