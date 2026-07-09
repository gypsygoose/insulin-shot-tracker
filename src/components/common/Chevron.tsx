import { useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";
import { ACCORDION_ANIMATION_DURATION_MS } from "../../constants";

export type ChevronDirection = "down" | "right";

interface Props {
  direction: ChevronDirection;
  color: string;
  size?: number;
}

const DEFAULT_SIZE = 10;
const STROKE_WIDTH = 2;

// CSS/RN "corner" trick: a box with only its right+bottom borders drawn
// forms a right-angle corner; rotating it turns that corner into an arrow
// tip pointing in the given direction. -45deg/45deg are exactly 90deg apart,
// so animating between them reads as the corner swinging from "right" to
// "down" rather than jumping.
const ROTATION_DEG: Record<ChevronDirection, number> = {
  right: -45,
  down: 45,
};

export function Chevron({ direction, color, size = DEFAULT_SIZE }: Props) {
  const rotation = useRef(new Animated.Value(ROTATION_DEG[direction])).current;

  useEffect(() => {
    Animated.timing(rotation, {
      toValue: ROTATION_DEG[direction],
      duration: ACCORDION_ANIMATION_DURATION_MS,
      useNativeDriver: true,
    }).start();
  }, [direction, rotation]);

  const rotate = rotation.interpolate({
    inputRange: [ROTATION_DEG.right, ROTATION_DEG.down],
    outputRange: ["-45deg", "45deg"],
  });

  return (
    <Animated.View
      style={[
        styles.corner,
        {
          width: size,
          height: size,
          borderColor: color,
          transform: [{ rotate }],
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  corner: {
    borderRightWidth: STROKE_WIDTH,
    borderBottomWidth: STROKE_WIDTH,
  },
});
