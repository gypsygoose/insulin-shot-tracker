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
import { ZoneContainer } from "../components/ZoneContainer";
import { BottomMenu } from "../components/BottomMenu";
import { ButtonContextMenu } from "../components/ButtonContextMenu";
import { MarkDialog } from "../components/MarkDialog";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Toast } from "../components/Toast";
import { useAppStore } from "../store/useAppStore";
import { computeButtonColor } from "../logic/stateMachine";
import { ZONES, BUTTON_MAP, ZONE_MAP } from "../data/zones";
import { ButtonColor, ZoneGroup } from "../types";
import {
  BACKGROUND_COLOR,
  BLOCKED_TOAST_MESSAGE,
  SCREEN_TITLE_COLOR,
  ICON_COLOR,
  IMG_ASPECT,
  INTERFACE_LOCKED_TOAST_DURATION_MS,
  INTERFACE_LOCKED_TOAST_MESSAGE,
  LEFT_SIDE_LABEL,
  RIGHT_SIDE_LABEL,
  PRIMARY_SECTION_LABEL_COLOR,
  TOAST_DURATION_MS,
} from "../constants";

export function MainScreen() {
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

  const showToast = useCallback((message: string, duration: number) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(message);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, duration);
  }, []);

  const handlePress = useCallback(
    (id: string) => {
      const color = computeButtonColor(state.buttonStates[id], state.now);

      if (color === ButtonColor.Gray || color === ButtonColor.Black) {
        showToast(BLOCKED_TOAST_MESSAGE, TOAST_DURATION_MS);
        return;
      }

      if (state.interfaceLocked) {
        showToast(
          INTERFACE_LOCKED_TOAST_MESSAGE,
          INTERFACE_LOCKED_TOAST_DURATION_MS,
        );
        return;
      }

      actions.pressButton(id);
    },
    [actions, state.buttonStates, state.now, state.interfaceLocked, showToast],
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
        <ActivityIndicator size="large" color={ICON_COLOR} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={BACKGROUND_COLOR} />

      <Toast message={toastMessage} />

      {/* Header */}
      <SafeAreaView style={styles.headerSafe} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.title}>T1D Shot</Text>
        </View>
      </SafeAreaView>

      {/* Body image + buttons overlay */}
      <View style={styles.bodyWrap}>
        <View style={styles.imageContainer}>
          <Image
            source={require("../../assets/images/body.png")}
            style={[styles.image, StyleSheet.absoluteFill]}
            resizeMode="contain"
          />

          <View
            style={[
              styles.sideLabels,
              state.mirrored && styles.sideLabelsMirrored,
            ]}
          >
            <Text style={styles.sideLabel}>{RIGHT_SIDE_LABEL}</Text>
            <Text style={styles.sideLabel}>{LEFT_SIDE_LABEL}</Text>
          </View>

          {ZONES.map((zone) => (
            <ZoneContainer
              key={zone.id}
              zoneId={zone.id}
              mirrored={state.mirrored}
              getColor={(buttonId) =>
                computeButtonColor(state.buttonStates[buttonId], state.now)
              }
              isCheckmarked={(buttonId) =>
                state.lastInGroup[ZoneGroup.Thighs] === buttonId ||
                state.lastInGroup[ZoneGroup.ShouldersAndBelly] === buttonId
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
        interfaceLocked={state.interfaceLocked}
        onToggleInterfaceLocked={() =>
          actions.setInterfaceLocked(!state.interfaceLocked)
        }
        autoLockEnabled={state.autoLockEnabled}
        autoLockAfterMarkSeconds={state.autoLockAfterMarkSeconds}
        autoLockAfterUnlockSeconds={state.autoLockAfterUnlockSeconds}
        onEnableAutoLock={actions.enableAutoLock}
        onDisableAutoLock={actions.disableAutoLock}
        onUpdateAutoLockTimes={actions.updateAutoLockTimes}
        onExport={actions.exportData}
        onPickImportFile={actions.pickImportFile}
        onApplyImport={actions.applyImport}
      />

      {/* Long-press menu for a single button */}
      <ButtonContextMenu
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
    backgroundColor: BACKGROUND_COLOR,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BACKGROUND_COLOR,
  },
  headerSafe: {
    backgroundColor: BACKGROUND_COLOR,
  },
  header: {
    paddingTop: 12,
    paddingBottom: 12,
    alignItems: "center",
  },
  title: {
    color: SCREEN_TITLE_COLOR,
    paddingBottom: 16,
    fontSize: 13,
    fontWeight: "400",
    letterSpacing: 3.1,
    textTransform: "uppercase",
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
    width: "100%",
    height: "100%",
    maxWidth: "100%",
    maxHeight: "100%",
  },
  sideLabels: {
    position: "absolute",
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
    color: PRIMARY_SECTION_LABEL_COLOR,
    fontSize: 12,
    fontWeight: "400",
    textTransform: "uppercase",
    textAlign: "center",
  },
});
