import { Fragment } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { Modal } from "./Modal";
import { useTheme } from "../../theme/ThemeContext";

export interface ContextMenuItem {
  key: string;
  label: string;
  onPress: () => void;
  destructive?: boolean;
}

interface Props {
  visible: boolean;
  title: string;
  subtitle?: string;
  infoLines?: string[];
  items: ContextMenuItem[];
  onCancel: () => void;
  cancelLabel?: string;
}

export function ContextMenu({
  visible,
  title,
  subtitle,
  infoLines,
  items,
  onCancel,
  cancelLabel,
}: Props) {
  const { t } = useTranslation();
  const hasInfo = !!infoLines && infoLines.length > 0;
  const { colors } = useTheme();

  return (
    <Modal visible={visible} onClose={onCancel}>
      <View
        style={[
          styles.box,
          { backgroundColor: colors.surface, borderColor: colors.cardBorder },
        ]}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.sectionLabel }]}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: colors.sectionLabel }]}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        {hasInfo ? (
          <View style={styles.infoBlock}>
            {infoLines!.map((line, i) => (
              <Text
                key={i}
                style={[styles.infoLine, { color: colors.secondaryText }]}
              >
                {line}
              </Text>
            ))}
          </View>
        ) : null}

        {hasInfo ? (
          <View
            style={[styles.divider, { backgroundColor: colors.cardBorder }]}
          />
        ) : null}

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
                  { color: colors.primaryText },
                  item.destructive && { color: colors.destructive },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
            {i < items.length - 1 ? (
              <View
                style={[styles.divider, { backgroundColor: colors.cardBorder }]}
              />
            ) : null}
          </Fragment>
        ))}

        <View style={styles.gap} />

        <TouchableOpacity
          style={[
            styles.cancelBtn,
            { backgroundColor: colors.cancelButtonBackground },
          ]}
          onPress={onCancel}
          activeOpacity={0.8}
        >
          <Text
            style={[styles.cancelLabel, { color: colors.cancelButtonText }]}
          >
            {cancelLabel ?? t("common.cancel")}
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: 16,
    padding: 8,
    width: "100%",
    maxWidth: 360,
    borderWidth: StyleSheet.hairlineWidth,
  },
  header: {
    paddingTop: 12,
    paddingBottom: 10,
    paddingHorizontal: 12,
    gap: 2,
  },
  title: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: "700",
  },
  infoBlock: {
    paddingHorizontal: 12,
    paddingBottom: 10,
    gap: 4,
  },
  infoLine: {
    fontSize: 13,
    fontWeight: "500",
  },
  row: {
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 12,
  },
  gap: {
    height: 8,
  },
  cancelBtn: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginHorizontal: 4,
    marginBottom: 4,
  },
  cancelLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
});
