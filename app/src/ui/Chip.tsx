import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Pressable } from './Pressable';
import { Text } from './Text';
import { haptic } from './motion';
import { colors, radius, space } from './tokens';

// Static label chip (e.g. severity level).
export function Tag({ label, tint, ink }: { label: string; tint: string; ink: string }) {
  return (
    <View style={[s.chip, { backgroundColor: tint }]}>
      <Text variant="label" style={{ color: ink }}>
        {label}
      </Text>
    </View>
  );
}

// Selectable chip for single choice groups.
export function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected, checked: selected }}
      onPress={() => {
        haptic.select();
        onPress();
      }}
      style={[s.choice, selected ? { backgroundColor: colors.primaryTint, borderColor: colors.primary } : { backgroundColor: colors.surface, borderColor: colors.line }]}
    >
      <Text variant="bodyStrong" tone={selected ? 'primary' : 'soft'}>
        {label}
      </Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  chip: { alignSelf: 'flex-start', paddingHorizontal: space.md, paddingVertical: 6, borderRadius: radius.pill },
  choice: { flex: 1, minHeight: 48, borderRadius: radius.md, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.md },
});
