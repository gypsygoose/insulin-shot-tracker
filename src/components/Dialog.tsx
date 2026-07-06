import { ReactNode } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { Modal } from "./Modal";
import {
  CANCEL_BUTTON_BORDER_COLOR,
  CANCEL_BUTTON_TEXT_COLOR,
  CANCEL_LABEL,
  CARD_BORDER_COLOR,
  DESTRUCTIVE_COLOR,
  PRIMARY_ACTION_COLOR,
  PRIMARY_TEXT_COLOR,
  SECONDARY_TEXT_COLOR,
  SURFACE_COLOR,
} from "../constants";

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
}: Props) {
  const body = (
    <>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {children}
    </>
  );

  return (
    <Modal visible={visible} onClose={onCancel}>
      <View style={[styles.box, scrollable && styles.boxScrollable]}>
        <Text style={styles.title}>{title}</Text>

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
            style={styles.cancelBtn}
            onPress={onCancel}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelLabel}>{cancelLabel}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.confirmBtn, destructive && styles.destructiveBtn]}
            onPress={onConfirm}
            activeOpacity={0.8}
          >
            <Text style={styles.confirmLabel}>{confirmLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: SURFACE_COLOR,
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 360,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: CARD_BORDER_COLOR,
  },
  boxScrollable: {
    maxHeight: "80%",
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: PRIMARY_TEXT_COLOR,
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
    color: SECONDARY_TEXT_COLOR,
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
    borderColor: CANCEL_BUTTON_BORDER_COLOR,
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: CANCEL_BUTTON_TEXT_COLOR,
  },
  confirmBtn: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: PRIMARY_ACTION_COLOR,
    paddingVertical: 12,
    alignItems: "center",
  },
  confirmLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: PRIMARY_TEXT_COLOR,
  },
  destructiveBtn: {
    backgroundColor: DESTRUCTIVE_COLOR,
  },
});
