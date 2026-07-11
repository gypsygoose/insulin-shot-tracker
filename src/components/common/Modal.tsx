import { ReactNode } from "react";
import { Modal as RNModal, View, Pressable, StyleSheet } from "react-native";
import { useTheme } from "../../theme";

interface Props {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ visible, onClose, children }: Props) {
  const { colors } = useTheme();

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: colors.modalOverlay }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        {children}
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
});
