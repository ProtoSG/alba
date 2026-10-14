import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { EASE_IN_OUT, useReduceMotion } from './motion';
import { colors, radius } from './tokens';

// Absolutely positioned childless fill: animating width is safe here (no sibling re-layout).
export function ProgressBar({ value, label }: { value: number; label: string }) {
  const reduced = useReduceMotion();
  const v = useSharedValue(value);
  useEffect(() => {
    v.value = reduced ? value : withTiming(value, { duration: 300, easing: EASE_IN_OUT });
  }, [value, reduced, v]);
  const fill = useAnimatedStyle(() => ({ width: `${Math.max(0, Math.min(1, v.value)) * 100}%` }));
  return (
    <View accessibilityRole="progressbar" accessibilityLabel={label} accessibilityValue={{ min: 0, max: 100, now: Math.round(value * 100) }} style={s.track}>
      <Animated.View style={[s.fill, fill]} />
    </View>
  );
}

const s = StyleSheet.create({
  track: { height: 8, borderRadius: radius.pill, backgroundColor: colors.surfaceAlt, overflow: 'hidden' },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: radius.pill, backgroundColor: colors.primary },
});
