import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PRIMARY_TEXT_COLOR, SURFACE_COLOR } from '../../constants';

interface Props {
  message: string | null;
}

const FADE_MS = 200;
// Slightly more visible than the shared CARD_BORDER_COLOR hairline, since the
// toast floats over arbitrary content instead of a dedicated dark backdrop.
const TOAST_BORDER_COLOR = 'rgba(255,255,255,0.12)';

export function Toast({ message }: Props) {
  const [displayedMessage, setDisplayedMessage] = useState<string | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (message) {
      setDisplayedMessage(message);
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
  }, [message, opacity]);

  if (!displayedMessage) return null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']} pointerEvents="none">
      <Animated.View style={[styles.toast, { opacity }]}>
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
    marginTop: 8,
    marginHorizontal: 24,
    backgroundColor: SURFACE_COLOR,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: TOAST_BORDER_COLOR,
  },
  text: {
    color: PRIMARY_TEXT_COLOR,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
