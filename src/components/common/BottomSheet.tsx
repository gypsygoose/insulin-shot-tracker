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
import { CARD_BORDER_COLOR, PRIMARY_TEXT_COLOR, SURFACE_COLOR } from "../../constants";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const DISMISS_DISTANCE = 80;
const DISMISS_VELOCITY = 0.5;
const SHEET_OPEN_MS = 250;
const SHEET_CLOSE_MS = 200;
// Minimum vertical drag before treating a touch as a sheet-drag gesture
// rather than a tap on the content underneath.
const VERTICAL_MOVE_THRESHOLD = 2;
// Backdrop is intentionally lighter than the modal scrim (MODAL_OVERLAY_COLOR)
// so content behind a bottom sheet stays partly legible while it's dragged.
const BACKDROP_COLOR = "rgba(0,0,0,0.6)";
// Drag handle pill — same value as the cancel-button border elsewhere, but a
// distinct, unrelated use (filled shape vs. border), so kept local.
const HANDLE_COLOR = "rgba(255,255,255,0.2)";

interface Props {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function BottomSheet({
  visible,
  onClose,
  title,
  children,
}: Props) {
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
        duration: SHEET_OPEN_MS,
        useNativeDriver: true,
      }).start();
    } else if (mounted) {
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: SHEET_CLOSE_MS,
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
        Math.abs(gestureState.dy) > VERTICAL_MOVE_THRESHOLD &&
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
    backgroundColor: BACKDROP_COLOR,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: SURFACE_COLOR,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "80%",
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: CARD_BORDER_COLOR,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: HANDLE_COLOR,
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
    color: PRIMARY_TEXT_COLOR,
  },
});
