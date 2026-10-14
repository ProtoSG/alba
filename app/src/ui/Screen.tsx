import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, MAX_WIDTH, space } from './tokens';

// Scrollable, safe-area-aware page with a centred max width so it also reads well on web.
export function Screen({ children, contentStyle, top = false }: { children: React.ReactNode; contentStyle?: StyleProp<ViewStyle>; top?: boolean }) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={s.root}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: top ? insets.top : 0, paddingBottom: insets.bottom + space.xxl, alignItems: 'center' }}
      >
        <View style={[s.inner, contentStyle]}>{children}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  inner: { width: '100%', maxWidth: MAX_WIDTH, paddingHorizontal: space.xl, paddingTop: space.lg },
});
