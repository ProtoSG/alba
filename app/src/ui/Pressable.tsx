import React from 'react';
import { Pressable as RNPressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { EASE_OUT, useReduceMotion } from './motion';

const APressable = Animated.createAnimatedComponent(RNPressable);

// Press feedback: feedback on press-in (scale 0.97, 120ms), commit on press-out. Opacity-only when reduced.
export function Pressable({ style, onPressIn, onPressOut, scaleTo = 0.97, ...rest }: PressableProps & { style?: StyleProp<ViewStyle>; scaleTo?: number }) {
  const reduced = useReduceMotion();
  const p = useSharedValue(0);
  const anim = useAnimatedStyle(() => ({
    transform: reduced ? [] : [{ scale: 1 - p.value * (1 - scaleTo) }],
    opacity: 1 - p.value * (reduced ? 0.15 : 0),
  }));
  return (
    <APressable
      {...rest}
      pressRetentionOffset={{ top: 16, bottom: 16, left: 16, right: 16 }}
      onPressIn={(e) => {
        p.value = withTiming(1, { duration: 120, easing: EASE_OUT });
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        p.value = withTiming(0, { duration: 160, easing: EASE_OUT });
        onPressOut?.(e);
      }}
      style={[style, anim]}
    />
  );
}
