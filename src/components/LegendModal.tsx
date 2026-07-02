import { useEffect, useRef, useState } from "react";
import {
  BackHandler,
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  PanResponder,
  Pressable,
  Dimensions,
} from "react-native";
import { ButtonColor } from "../types";
import { COLOR_HEX, COLOR_LABEL } from "../logic/stateMachine";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const DISMISS_DISTANCE = 80;
const DISMISS_VELOCITY = 0.5;

// Injection zone descriptions, taken from the Figma "legend" frame
// (node 26:239, file grYg39698ogy0nEBd88Fup).
const INJECTION_ZONE_INFO = [
  {
    id: "shoulders",
    label: "Плечи",
    location: "средняя треть сзади и сбоку",
    description:
      "Умеренное всасывание. Начало действия через 10 минут. Пик действия через 60–90 минут.",
    color: "#F5D020",
  },
  {
    id: "belly",
    label: "Живот",
    location: "4 см отступ от рёбер и пупка",
    description:
      "Быстрое всасывание. Начало действия через 5 минут. Пик действия через 30–60 минут.",
    color: "#36D97A",
  },
  {
    id: "thighs",
    label: "Бёдра",
    location: "внешняя боковая поверхность",
    description:
      "Медленное всасывание. Для пролонгированного инсулина. Пик действия через 90–120 минут.",
    color: "#FF8C33",
  },
] as const;

const COLOR_ORDER: ButtonColor[] = [
  "white",
  "maroon",
  "red",
  "dark-orange",
  "orange",
  "dark-yellow",
  "yellow",
  "dark-green",
  "green",
  "black",
  "gray",
];

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function LegendModal({ visible, onClose }: Props) {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  // Kept mounted for the duration of the dismiss animation, then unmounted
  // entirely so the (otherwise full-screen) overlay stops intercepting
  // touches meant for the body silhouette / bottom menu.
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
          <View style={styles.header}>
            <Text style={styles.title}>Легенда</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Зоны введения</Text>
          {INJECTION_ZONE_INFO.map((z) => (
            <View key={z.id} style={styles.zoneCard}>
              <View style={styles.zoneHeader}>
                <View
                  style={[
                    styles.zoneBadge,
                    { backgroundColor: `${z.color}38`, borderColor: z.color },
                  ]}
                />
                <Text style={styles.zoneRowText}>
                  <Text style={[styles.zoneLabel, { color: z.color }]}>
                    {z.label}
                  </Text>
                  <Text style={styles.zoneLocation}> {z.location}</Text>
                </Text>
              </View>
              <Text style={styles.zoneDescription}>{z.description}</Text>
            </View>
          ))}

          <Text style={styles.sectionTitle}>Цветовая схема</Text>
          {COLOR_ORDER.map((c) => (
            <View key={c} style={styles.colorRow}>
              <View
                style={[
                  styles.swatch,
                  {
                    backgroundColor: COLOR_HEX[c],
                    borderColor:
                      c === "white" ? "rgba(255,255,255,0.3)" : COLOR_HEX[c],
                  },
                ]}
              />
              <Text style={styles.colorLabel}>{COLOR_LABEL[c]}</Text>
            </View>
          ))}

          <Text style={styles.sectionTitle}>Управление</Text>
          <Text style={styles.hint}>
            <Text style={styles.bold}>Нажатие</Text> — зафиксировать укол.
          </Text>
          <Text style={styles.hint}>
            <Text style={styles.bold}>Долгое нажатие</Text> (~1 с) —
            заблокировать / разблокировать вручную (травма, синяк).
          </Text>
          <Text style={styles.hint}>
            <Text style={styles.bold}>✓ Галочка</Text> — последняя
            использованная точка в группе.
          </Text>
          <View style={styles.bottomPad} />
        </ScrollView>
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
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255,255,255,0.4)",
    marginTop: 20,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  zoneCard: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.08)",
    gap: 6,
  },
  zoneHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  zoneBadge: {
    width: 34,
    height: 15,
    borderRadius: 3,
    borderWidth: 1,
    flexShrink: 0,
  },
  zoneRowText: {
    flex: 1,
  },
  zoneLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  zoneLocation: {
    fontSize: 13,
    color: "rgba(255,255,255,0.5)",
  },
  zoneDescription: {
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
    lineHeight: 17,
  },
  colorRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    gap: 14,
  },
  swatch: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    flexShrink: 0,
  },
  colorLabel: {
    flex: 1,
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    lineHeight: 19,
  },
  hint: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    lineHeight: 21,
    marginBottom: 10,
  },
  bold: {
    fontWeight: "700",
    color: "#FFFFFF",
  },
  bottomPad: {
    // Extra clearance so the last row isn't hidden behind the bottom menu
    // bar, which now renders on top of the sheet instead of a full-screen
    // Modal covering it.
    height: 110,
  },
});
