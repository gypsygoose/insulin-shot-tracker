import { useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";
import { ACCORDION_ANIMATION_DURATION_MS } from "../../../constants";
import { DEFAULT_SIZE, ROTATION_DEG, STROKE_WIDTH } from "./constants";

export type ChevronDirection = "down" | "right";

interface Props {
  direction: ChevronDirection;
  color: string;
  size?: number;
}

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
