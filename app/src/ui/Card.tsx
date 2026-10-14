import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, shadow, space } from './tokens';

export function Card({ children, style, lifted, tone }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; lifted?: boolean; tone?: { tint: string; line?: string } }) {
  return (
    <View
      style={[
        s.card,
        lifted ? shadow : { borderWidth: StyleSheet.hairlineWidth * 2, borderColor: colors.line },
        tone && { backgroundColor: tone.tint, borderColor: tone.line ?? tone.tint },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: space.xl },
});
