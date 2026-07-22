import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../utils/theme';

let toastRef = null;

/** Imperative toast — usable anywhere after ToastProvider is mounted. */
export function showToast(message, duration = 2000) {
  if (toastRef) {
    toastRef(message, duration);
  }
}

export default function ToastProvider({ children }) {
  const insets = useSafeAreaInsets();
  const { Colors, Fonts } = useTheme();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-60);
  const timerRef = useRef(null);
  const tokenRef = useRef(0);

  const hideIfCurrent = useCallback((token) => {
    if (tokenRef.current === token) setVisible(false);
  }, []);

  const show = useCallback((msg, duration = 2000) => {
    const token = ++tokenRef.current;
    if (timerRef.current) clearTimeout(timerRef.current);
    setMessage(msg);
    setVisible(true);
    opacity.value = withTiming(1, { duration: 250 });
    translateY.value = withTiming(0, { duration: 250 });
    timerRef.current = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 250 }, (finished) => {
        // finished=false means a newer toast cancelled this fade-out —
        // never hide the toast that superseded this one.
        if (finished) runOnJS(hideIfCurrent)(token);
      });
      translateY.value = withTiming(-60, { duration: 250 });
    }, duration);
  }, [opacity, translateY, hideIfCurrent]);

  useEffect(() => {
    toastRef = show;
    return () => { toastRef = null; };
  }, [show]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View style={{ flex: 1 }}>
      {children}
      {visible && (
        <Animated.View
          style={[
            styles.toast,
            { top: insets.top + 12, backgroundColor: Colors.inkDeep },
            animatedStyle,
          ]}
          pointerEvents="none"
        >
          <Text style={[styles.toastText, { color: Colors.white, fontFamily: Fonts.semiBold }]}>
            {message}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    maxWidth: '80%',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 48,
    zIndex: 9999,
    elevation: 9999,
  },
  toastText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
