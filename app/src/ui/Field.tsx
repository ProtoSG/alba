import React, { useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { Text } from './Text';
import { colors, fonts, radius, space } from './tokens';

// Font size stays at 16 so iOS Safari does not zoom the page on focus.
export function Field({ label, ...rest }: TextInputProps & { label: string }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ marginBottom: space.lg }}>
      <Text variant="label" tone="soft" style={{ marginBottom: 6 }}>
        {label}
      </Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.inkFaint}
        autoCapitalize="none"
        {...rest}
        onFocus={(e) => {
          setFocused(true);
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          rest.onBlur?.(e);
        }}
        style={[s.input, focused && { borderColor: colors.focus, borderWidth: 2, paddingHorizontal: 15 }]}
      />
    </View>
  );
}

const s = StyleSheet.create({
  input: {
    minHeight: 52,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.ink,
    outlineStyle: 'none',
  } as object,
});
