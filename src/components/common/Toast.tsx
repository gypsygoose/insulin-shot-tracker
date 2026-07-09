import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PRIMARY_TEXT_COLOR } from '../../constants';
import { ToastStatus } from '../../types';
import { ToastInfoIcon } from '../icons/ToastInfoIcon';
import { ToastWarnIcon } from '../icons/ToastWarnIcon';
import { ToastSuccessIcon } from '../icons/ToastSuccessIcon';
import { ToastErrorIcon } from '../icons/ToastErrorIcon';
import {
  TOAST_INFO_COLOR,
  TOAST_WARN_COLOR,
  TOAST_SUCCESS_COLOR,
  TOAST_ERROR_COLOR,
  TOAST_INFO_BACKGROUND_COLOR,
  TOAST_WARN_BACKGROUND_COLOR,
  TOAST_SUCCESS_BACKGROUND_COLOR,
  TOAST_ERROR_BACKGROUND_COLOR,
} from '../../constants';

interface Props {
  message: string | null;
  status: ToastStatus;
}

const FADE_MS = 200;

const STATUS_ICON: Record<ToastStatus, () => React.JSX.Element> = {
  [ToastStatus.Info]: ToastInfoIcon,
  [ToastStatus.Warn]: ToastWarnIcon,
  [ToastStatus.Success]: ToastSuccessIcon,
  [ToastStatus.Error]: ToastErrorIcon,
};

const STATUS_BORDER_COLOR: Record<ToastStatus, string> = {
  [ToastStatus.Info]: TOAST_INFO_COLOR,
  [ToastStatus.Warn]: TOAST_WARN_COLOR,
  [ToastStatus.Success]: TOAST_SUCCESS_COLOR,
  [ToastStatus.Error]: TOAST_ERROR_COLOR,
};

const STATUS_BACKGROUND_COLOR: Record<ToastStatus, string> = {
  [ToastStatus.Info]: TOAST_INFO_BACKGROUND_COLOR,
  [ToastStatus.Warn]: TOAST_WARN_BACKGROUND_COLOR,
  [ToastStatus.Success]: TOAST_SUCCESS_BACKGROUND_COLOR,
  [ToastStatus.Error]: TOAST_ERROR_BACKGROUND_COLOR,
};

export function Toast({ message, status }: Props) {
  const [displayedMessage, setDisplayedMessage] = useState<string | null>(null);
  // Frozen alongside displayedMessage so the icon/color don't flip to the
  // next toast's status mid fade-out of the current one.
  const [displayedStatus, setDisplayedStatus] = useState<ToastStatus>(status);
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (message) {
      setDisplayedMessage(message);
      setDisplayedStatus(status);
      Animated.timing(opacity, {
        toValue: 1,
        duration: FADE_MS,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(opacity, {
        toValue: 0,
        duration: FADE_MS,
        useNativeDriver: true,
      }).start(() => setDisplayedMessage(null));
    }
  }, [message, status, opacity]);

  if (!displayedMessage) return null;

  const Icon = STATUS_ICON[displayedStatus];

  return (
    <SafeAreaView style={styles.safe} edges={['top']} pointerEvents="none">
      <Animated.View
        style={[
          styles.toast,
          {
            opacity,
            backgroundColor: STATUS_BACKGROUND_COLOR[displayedStatus],
            borderColor: STATUS_BORDER_COLOR[displayedStatus],
          },
        ]}
      >
        <View style={styles.icon}>
          <Icon />
        </View>
        <Animated.Text style={styles.text}>{displayedMessage}</Animated.Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
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
    color: PRIMARY_TEXT_COLOR,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'left',
  },
});
