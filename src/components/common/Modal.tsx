import { ReactNode } from "react";
import { Modal as RNModal, View, Pressable, StyleSheet } from "react-native";
import { MODAL_OVERLAY_COLOR } from "../../constants";

interface Props {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ visible, onClose, children }: Props) {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        {children}
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: MODAL_OVERLAY_COLOR,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
});
