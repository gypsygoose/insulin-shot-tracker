import { ReactNode } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { Modal } from "./Modal";
import { useTheme } from "../../theme/ThemeContext";
import { CANCEL_LABEL } from "../../constants";

interface Props {
  visible: boolean;
  title: string;
  message?: string;
  children?: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
  confirmDisabled?: boolean;
  // Wraps message/children in a scrollable, height-capped box — for dialogs
  // whose content (e.g. AutoLockDialog's two time pickers) can overflow.
  scrollable?: boolean;
}

export function Dialog({
  visible,
  title,
  message,
  children,
  confirmLabel,
  cancelLabel = CANCEL_LABEL,
  onConfirm,
  onCancel,
  destructive = false,
  scrollable = false,
  confirmDisabled = false,
}: Props) {
  const { colors } = useTheme();

  const body = (
    <>
      {message ? (
        <Text style={[styles.message, { color: colors.secondaryText }]}>
          {message}
        </Text>
      ) : null}
      {children}
    </>
  );

  return (
    <Modal visible={visible} onClose={onCancel}>
      <View
        style={[
          styles.box,
          scrollable && styles.boxScrollable,
          { backgroundColor: colors.surface, borderColor: colors.cardBorder },
        ]}
      >
        <Text style={[styles.title, { color: colors.primaryText }]}>{title}</Text>

        {scrollable ? (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {body}
          </ScrollView>
        ) : (
          body
        )}

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.cancelBtn, { borderColor: colors.cancelButtonBorder }]}
            onPress={onCancel}
            activeOpacity={0.8}
          >
            <Text style={[styles.cancelLabel, { color: colors.cancelButtonText }]}>
              {cancelLabel}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.confirmBtn,
              { backgroundColor: colors.primaryAction },
              destructive && { backgroundColor: colors.destructive },
              confirmDisabled && styles.confirmBtnDisabled,
            ]}
            onPress={onConfirm}
            activeOpacity={0.8}
            disabled={confirmDisabled}
          >
            <Text style={[styles.confirmLabel, { color: colors.actionLabel }]}>
              {confirmLabel}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 360,
    borderWidth: StyleSheet.hairlineWidth,
  },
  boxScrollable: {
    maxHeight: "80%",
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 8,
  },
  scroll: {
    flexShrink: 1,
  },
  scrollContent: {
    paddingBottom: 4,
  },
  message: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 20,
  },
  actions: {
    marginTop: 12,
    flexDirection: "row",
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  confirmBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  confirmBtnDisabled: {
    opacity: 0.4,
  },
  confirmLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
});
