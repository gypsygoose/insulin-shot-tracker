import { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  Image,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ZoneContainer from "../components/ZoneContainer";
import BottomMenu from "../components/BottomMenu";
import ButtonActionMenu from "../components/ButtonActionMenu";
import MarkDialog from "../components/MarkDialog";
import ConfirmDialog from "../components/ConfirmDialog";
import Toast from "../components/Toast";
import { useAppStore } from "../store/useAppStore";
import { computeButtonColor } from "../logic/stateMachine";
import { ZONES, BUTTON_MAP, ZONE_MAP } from "../data/zones";

const BLOCKED_TOAST_MESSAGE = "Точка заблокирована и не может быть отмечена";
const TOAST_DURATION_MS = 2000;

// Figma body image aspect ratio: 393.46 wide × 621.91 tall
const IMG_ASPECT = 393.46 / 621.91;
const LEFT_SIDE_LABEL = "левая\nсторона";
const RIGHT_SIDE_LABEL = "правая\nсторона";

export default function MainScreen() {
  const [state, actions] = useAppStore();

  // Long-pressed button awaiting an action from the menu / follow-up dialogs.
  const [menuButtonId, setMenuButtonId] = useState<string | null>(null);
  const [markButtonId, setMarkButtonId] = useState<string | null>(null);
  const [clearButtonId, setClearButtonId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const showBlockedToast = useCallback(() => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(BLOCKED_TOAST_MESSAGE);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, TOAST_DURATION_MS);
  }, []);

  const handlePress = useCallback(
    (id: string) => {
      const color = computeButtonColor(state.buttonStates[id], state.now);
      if (color === "gray" || color === "black") {
        showBlockedToast();
        return;
      }
      actions.pressButton(id);
    },
    [actions, state.buttonStates, state.now, showBlockedToast],
  );
  const handleLongPress = useCallback((id: string) => setMenuButtonId(id), []);

  const menuZoneLabel = menuButtonId
    ? ZONE_MAP[BUTTON_MAP[menuButtonId]?.zoneId]?.label
    : undefined;
  const menuButtonState = menuButtonId
    ? state.buttonStates[menuButtonId]
    : undefined;
  const menuButtonColor = menuButtonState
    ? computeButtonColor(menuButtonState, state.now)
    : undefined;

  if (!state.isLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#080C18" />

      <Toast message={toastMessage} />

      {/* Header */}
      <SafeAreaView style={styles.headerSafe} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.title}>T1D Shot</Text>
        </View>
      </SafeAreaView>

      <View
        style={[styles.sideLabels, state.mirrored && styles.sideLabelsMirrored]}
      >
        <Text style={styles.sideLabel}>{RIGHT_SIDE_LABEL}</Text>
        <Text style={styles.sideLabel}>{LEFT_SIDE_LABEL}</Text>
      </View>

      {/* Body image + buttons overlay */}
      <View style={styles.bodyWrap}>
        <View style={styles.imageContainer}>
          <Image
            source={require("../../assets/images/body.png")}
            style={[styles.image, StyleSheet.absoluteFill]}
            resizeMode="contain"
          />

          {ZONES.map((zone) => (
            <ZoneContainer
              key={zone.id}
              zoneId={zone.id}
              mirrored={state.mirrored}
              getColor={(buttonId) =>
                computeButtonColor(state.buttonStates[buttonId], state.now)
              }
              isCheckmarked={(buttonId) =>
                state.lastInGroup["thighs"] === buttonId ||
                state.lastInGroup["shoulders-and-belly"] === buttonId
              }
              onPress={handlePress}
              onLongPress={handleLongPress}
            />
          ))}
        </View>
      </View>

      {/* Bottom menu */}
      <BottomMenu
        canUndo={state.events.length > 0}
        onUndo={actions.undo}
        onClear={actions.clearAll}
        mirrored={state.mirrored}
        onToggleMirrored={actions.setMirrored}
        onExport={actions.exportData}
        onPickImportFile={actions.pickImportFile}
        onApplyImport={actions.applyImport}
      />

      {/* Long-press menu for a single button */}
      <ButtonActionMenu
        visible={menuButtonId !== null}
        zoneLabel={menuZoneLabel}
        color={menuButtonColor}
        buttonState={menuButtonState}
        now={state.now}
        onBlock={() => {
          if (menuButtonId) actions.blockButton(menuButtonId);
          setMenuButtonId(null);
        }}
        onUnblock={() => {
          if (menuButtonId) actions.unblockButton(menuButtonId);
          setMenuButtonId(null);
        }}
        onMark={() => {
          setMarkButtonId(menuButtonId);
          setMenuButtonId(null);
        }}
        onClear={() => {
          setClearButtonId(menuButtonId);
          setMenuButtonId(null);
        }}
        onCancel={() => setMenuButtonId(null)}
      />

      <MarkDialog
        visible={markButtonId !== null}
        onConfirm={(timestamp) => {
          if (markButtonId) actions.markButtonAt(markButtonId, timestamp);
          setMarkButtonId(null);
        }}
        onCancel={() => setMarkButtonId(null)}
      />

      <ConfirmDialog
        visible={clearButtonId !== null}
        title="Очистить точку?"
        message="Данные этой точки будут удалены, и она станет белой (свободной). Это действие нельзя отменить повторно."
        confirmLabel="Очистить"
        onConfirm={() => {
          if (clearButtonId) actions.clearButton(clearButtonId);
          setClearButtonId(null);
        }}
        onCancel={() => setClearButtonId(null)}
        destructive
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#080C18",
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#080C18",
  },
  headerSafe: {
    backgroundColor: "#080C18",
  },
  header: {
    paddingTop: 12,
    paddingBottom: 12,
    alignItems: "center",
  },
  title: {
    color: "rgba(255,255,255,0.26)",
    fontSize: 13,
    fontWeight: "400",
    letterSpacing: 3.1,
    textTransform: "uppercase",
  },
  sideLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 12,
    width: "100%",
    boxSizing: "border-box",
  },
  sideLabelsMirrored: {
    flexDirection: "row-reverse",
  },
  sideLabel: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
    fontWeight: "400",
    textTransform: "uppercase",
    textAlign: "center",
  },
  bodyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  imageContainer: {
    position: "relative",
    flex: 1,
    maxWidth: "100%",
    aspectRatio: IMG_ASPECT,
    alignSelf: "center",
  },
  image: {
    maxWidth: "100%",
    maxHeight: "100%",
  },
});
