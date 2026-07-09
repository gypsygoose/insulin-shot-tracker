import { ReactNode } from "react";
import {
  LayoutAnimation,
  Platform,
  TouchableOpacity,
  UIManager,
  View,
  StyleSheet,
} from "react-native";
import { Chevron } from "./Chevron";
import { useTheme } from "../../theme/ThemeContext";
import { ACCORDION_ANIMATION_DURATION_MS } from "../../constants";

// Old (pre-Fabric) Android needs this opt-in for LayoutAnimation to work at
// all; harmless no-op everywhere else.
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Faster than LayoutAnimation.Presets.easeInEaseOut's default 300ms.
const EXPAND_ANIMATION = LayoutAnimation.create(
  ACCORDION_ANIMATION_DURATION_MS,
  LayoutAnimation.Types.easeInEaseOut,
  LayoutAnimation.Properties.opacity,
);

interface Props {
  label: ReactNode;
  expanded: boolean;
  onToggleExpanded: () => void;
  children: ReactNode;
  // When true, the header can't be tapped to expand/collapse — for a group
  // whose own bulk checkbox is also disabled (e.g. ImportOptionsDialog's
  // "Настройки приложения" row when the file carries no settings at all).
  disabled?: boolean;
}

// Generic expand/collapse group. Tapping the header toggles `expanded`; any
// interactive control nested inside `label` (e.g. a checkbox rendered by the
// caller) still receives its own taps first — React Native gives touch
// priority to the innermost responder, so a bare checkbox placed in `label`
// keeps working as its own tap target without Accordion knowing about it.
export function Accordion({
  label,
  expanded,
  onToggleExpanded,
  children,
  disabled = false,
}: Props) {
  const { colors } = useTheme();

  const handleToggle = () => {
    // Must be configured synchronously before the state change that causes
    // the content View to mount/unmount, so the next layout commit animates.
    LayoutAnimation.configureNext(EXPAND_ANIMATION);
    onToggleExpanded();
  };

  return (
    <View style={[styles.group, { borderTopColor: colors.divider }]}>
      <TouchableOpacity
        style={styles.headerRow}
        onPress={handleToggle}
        activeOpacity={0.7}
        disabled={disabled}
      >
        <View style={styles.label}>{label}</View>
        <View style={disabled && styles.chevronDisabled}>
          <Chevron
            direction={expanded ? "down" : "right"}
            color={colors.mutedText}
          />
        </View>
      </TouchableOpacity>

      {expanded ? <View style={styles.content}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    marginTop: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 4,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
    paddingRight: 8,
  },
  label: {
    flex: 1,
  },
  chevronDisabled: {
    opacity: 0.5,
  },
  content: {
    paddingLeft: 34,
  },
});
