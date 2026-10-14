import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Easing, useReducedMotion } from 'react-native-reanimated';

export const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
export const EASE_IN_OUT = Easing.bezier(0.77, 0, 0.175, 1);

// Reduced motion keeps opacity/colour changes and drops translation, scale and overshoot.
export const useReduceMotion = (): boolean => useReducedMotion();

// Haptics are native-only and never the only feedback. Any failure (web, unsupported device) is swallowed.
export const haptic = {
  select: () => {
    if (Platform.OS === 'web') return;
    Haptics.selectionAsync().catch(() => {});
  },
  light: () => {
    if (Platform.OS === 'web') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  },
  success: () => {
    if (Platform.OS === 'web') return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  },
};

// Layout animations (entering/exiting) take a plain function rather than the bezier factory object.
export const EASE_OUT_FN = Easing.bezierFn(0.23, 1, 0.32, 1);
