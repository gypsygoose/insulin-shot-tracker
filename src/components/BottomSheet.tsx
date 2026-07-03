import { ReactNode, useEffect, useRef, useState } from "react";
import {
  BackHandler,
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Pressable,
  Dimensions,
} from "react-native";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const DISMISS_DISTANCE = 80;
const DISMISS_VELOCITY = 0.5;

interface Props {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export default function BottomSheet({ visible, onClose, title, children }: Props) {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  // Kept mounted for the duration of the dismiss animation, then unmounted
  // entirely so the (otherwise full-screen) overlay stops intercepting
  // touches meant for whatever is behind the sheet.
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      translateY.setValue(SCREEN_HEIGHT);
      Animated.timing(translateY, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else if (mounted) {
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setMounted(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [visible, onClose]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dy) > 2 &&
        Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
      onPanResponderTerminationRequest: () => false,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (
          gestureState.dy > DISMISS_DISTANCE ||
          gestureState.vy > DISMISS_VELOCITY
        ) {
          onClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 6,
          }).start();
        }
      },
    }),
  ).current;

  const overlayOpacity = translateY.interpolate({
    inputRange: [0, SCREEN_HEIGHT],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  if (!mounted) return null;

  return (
    <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

      <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
        <View {...panResponder.panHandlers}>
          <View style={styles.handle} />
          {title ? (
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
            </View>
          ) : null}
        </View>

        {children}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#141824",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignSelf: "center",
    marginBottom: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    flex: 1,
    fontSize: 19,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
