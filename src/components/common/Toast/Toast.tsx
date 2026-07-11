import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { TOAST_TEXT_COLOR } from '../../../constants';
import { ToastStatus } from '../../../types';
import { FADE_MS, STATUS_BACKGROUND_COLOR, STATUS_BORDER_COLOR, STATUS_ICON } from './constants';

// A single toast bubble. Fades itself in on mount and, after `duration`,
// fades out and calls `onDismiss` — the caller (ToastStack) owns the list
// this is rendered into, so removal only happens once the exit animation
// finishes.
interface Props {
  message: string;
  status: ToastStatus;
  duration: number;
  onDismiss: () => void;
}

export function Toast({ message, status, duration, onDismiss }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: FADE_MS,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: FADE_MS,
        useNativeDriver: true,
      }).start(onDismiss);
    }, duration);

    return () => clearTimeout(timer);
    // Runs once per mount: message/status/duration are fixed for this
    // entry's lifetime (ToastStack keys each one by a stable id).
  }, []);

  const Icon = STATUS_ICON[status];

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          opacity,
          backgroundColor: STATUS_BACKGROUND_COLOR[status],
          borderColor: STATUS_BORDER_COLOR[status],
        },
      ]}
    >
      <View style={styles.icon}>
        <Icon />
      </View>
      <Animated.Text style={styles.text}>{message}</Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginHorizontal: 24,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  icon: {
    marginRight: 10,
  },
  text: {
    flex: 1,
    color: TOAST_TEXT_COLOR,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'left',
  },
});
