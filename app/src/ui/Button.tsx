import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Pressable } from './Pressable';
import { Text } from './Text';
import { haptic } from './motion';
import { colors, radius, space } from './tokens';

type Props = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'care';
  disabled?: boolean;
  loading?: boolean;
  hint?: string;
};

export function Button({ title, onPress, variant = 'primary', disabled, loading, hint }: Props) {
  const inactive = disabled || loading;
  const bg = variant === 'primary' ? colors.primary : variant === 'care' ? colors.careSolid : variant === 'secondary' ? colors.surface : 'transparent';
  const fg = variant === 'primary' || variant === 'care' ? colors.onPrimary : colors.primary;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={hint}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      disabled={inactive}
      onPress={() => {
        haptic.light();
        onPress();
      }}
      style={[
        s.btn,
        { backgroundColor: bg },
        variant === 'secondary' && { borderWidth: 1.5, borderColor: colors.primary },
        disabled && !loading && { opacity: 0.45 },
      ]}
    >
      <View style={s.row}>
        {loading && <ActivityIndicator color={fg} style={{ marginRight: space.sm }} />}
        <Text variant="bodyStrong" style={{ color: fg }}>
          {title}
        </Text>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  btn: { minHeight: 52, borderRadius: radius.md, paddingHorizontal: space.xl, paddingVertical: space.md, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
});
