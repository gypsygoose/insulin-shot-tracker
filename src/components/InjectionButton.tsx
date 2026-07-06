import { useCallback } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  GestureResponderEvent,
} from "react-native";
import * as Haptics from "expo-haptics";
import Svg, { Defs, RadialGradient, Stop, Circle } from "react-native-svg";
import { ButtonColor } from "../types";
import { COLOR_HEX, checkmarkColor } from "../logic/stateMachine";

// Sizes match the Figma "with buttons" frame (node 27:744, file
// grYg39698ogy0nEBd88Fup): glow halo ~35px diameter, knob ~25px diameter.
const GLOW_SIZE = 35;
const KNOB_SIZE = 25;
// Context-menu long-press threshold — matches CLAUDE.md's "Manual block" note.
const LONG_PRESS_DELAY_MS = 800;

interface Props {
  id: string;
  color: ButtonColor;
  glowColor: string;
  showCheckmark: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

export function InjectionButton({
  id,
  color,
  glowColor,
  showCheckmark,
  onPress,
  onLongPress,
}: Props) {
  const handlePress = useCallback(
    (_: GestureResponderEvent) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    },
    [onPress],
  );

  const handleLongPress = useCallback(
    (_: GestureResponderEvent) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onLongPress();
    },
    [onLongPress],
  );

  const bg = COLOR_HEX[color];
  const ck = checkmarkColor(color);
  const gradientId = `glow-${id}`;

  return (
    <TouchableOpacity
      onPress={handlePress}
      onLongPress={handleLongPress}
      delayLongPress={LONG_PRESS_DELAY_MS}
      activeOpacity={0.75}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={styles.outer}
      accessible
      accessibilityRole="button"
    >
      <Svg width={GLOW_SIZE} height={GLOW_SIZE} style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id={gradientId} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={glowColor} stopOpacity={0.55} />
            <Stop offset="0.55" stopColor={glowColor} stopOpacity={0.28} />
            <Stop offset="1" stopColor={glowColor} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle
          cx={GLOW_SIZE / 2}
          cy={GLOW_SIZE / 2}
          r={GLOW_SIZE / 2}
          fill={`url(#${gradientId})`}
        />
        <Circle
          cx={GLOW_SIZE / 2}
          cy={GLOW_SIZE / 2}
          r={KNOB_SIZE / 2}
          fill={bg}
          stroke={glowColor}
          strokeWidth={1.5}
          strokeOpacity={0.9}
        />
      </Svg>
      {showCheckmark ? (
        <Text style={[styles.check, { color: ck }]}>✓</Text>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: GLOW_SIZE,
    height: GLOW_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  check: {
    fontSize: 10,
    fontWeight: "800",
    lineHeight: 12,
  },
});
