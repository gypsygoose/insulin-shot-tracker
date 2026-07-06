import { Fragment } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Modal } from "./Modal";
import {
  CANCEL_BUTTON_BACKGROUND_COLOR,
  CANCEL_BUTTON_TEXT_COLOR,
  CARD_BORDER_COLOR,
  DESTRUCTIVE_COLOR,
  PRIMARY_TEXT_COLOR,
  SECONDARY_TEXT_COLOR,
  PRIMARY_SECTION_LABEL_COLOR,
  SURFACE_COLOR,
} from "../constants";

export interface ContextMenuItem {
  key: string;
  label: string;
  onPress: () => void;
  destructive?: boolean;
}

interface Props {
  visible: boolean;
  title: string;
  infoLines?: string[];
  items: ContextMenuItem[];
  onCancel: () => void;
  cancelLabel?: string;
}

export function ContextMenu({
  visible,
  title,
  infoLines,
  items,
  onCancel,
  cancelLabel = "Отмена",
}: Props) {
  const hasInfo = !!infoLines && infoLines.length > 0;

  return (
    <Modal visible={visible} onClose={onCancel}>
      <View style={styles.box}>
        <Text style={styles.title}>{title}</Text>

        {hasInfo ? (
          <View style={styles.infoBlock}>
            {infoLines!.map((line, i) => (
              <Text key={i} style={styles.infoLine}>
                {line}
              </Text>
            ))}
          </View>
        ) : null}

        {hasInfo ? <View style={styles.divider} /> : null}

        {items.map((item, i) => (
          <Fragment key={item.key}>
            <TouchableOpacity
              style={styles.row}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.rowLabel,
                  item.destructive && styles.destructiveLabel,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
            {i < items.length - 1 ? <View style={styles.divider} /> : null}
          </Fragment>
        ))}

        <View style={styles.gap} />

        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={onCancel}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelLabel}>{cancelLabel}</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: SURFACE_COLOR,
    borderRadius: 16,
    padding: 8,
    width: "100%",
    maxWidth: 360,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: CARD_BORDER_COLOR,
  },
  title: {
    fontSize: 12,
    fontWeight: "700",
    color: PRIMARY_SECTION_LABEL_COLOR,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    paddingTop: 12,
    paddingBottom: 10,
    paddingHorizontal: 12,
  },
  infoBlock: {
    paddingHorizontal: 12,
    paddingBottom: 10,
    gap: 4,
  },
  infoLine: {
    fontSize: 13,
    fontWeight: "500",
    color: SECONDARY_TEXT_COLOR,
  },
  row: {
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: PRIMARY_TEXT_COLOR,
  },
  destructiveLabel: {
    color: DESTRUCTIVE_COLOR,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: CARD_BORDER_COLOR,
    marginHorizontal: 12,
  },
  gap: {
    height: 8,
  },
  cancelBtn: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: CANCEL_BUTTON_BACKGROUND_COLOR,
    marginHorizontal: 4,
    marginBottom: 4,
  },
  cancelLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: CANCEL_BUTTON_TEXT_COLOR,
  },
});
