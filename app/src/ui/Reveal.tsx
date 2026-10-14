import React, { useEffect } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { EASE_OUT, useReduceMotion } from './motion';

// Entrance (opacity + small translate) driven by shared values on the UI thread.
// Reduced motion: fade only, no translation. `from="right"` is used for step-to-step changes.
export function Reveal({ index = 0, from = 'bottom', children, style }: { index?: number; from?: 'bottom' | 'right'; children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const reduced = useReduceMotion();
  const p = useSharedValue(0);
  useEffect(() => {
    const delay = reduced ? 0 : Math.min(index, 6) * 60;
    p.value = withDelay(delay, withTiming(1, { duration: reduced ? 150 : 320, easing: EASE_OUT }));
  }, [p, index, reduced]);
  const anim = useAnimatedStyle(() => {
    const d = (1 - p.value) * (reduced ? 0 : from === 'right' ? 24 : 10);
    return { opacity: p.value, transform: [from === 'right' ? { translateX: d } : { translateY: d }] };
  });
  return <Animated.View style={[style, anim]}>{children}</Animated.View>;
}
