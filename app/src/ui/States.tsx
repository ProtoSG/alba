import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Button } from './Button';
import { Text } from './Text';
import { colors, space } from './tokens';

export function LoadingState({ label = 'Cargando…' }: { label?: string }) {
  return (
    <View style={s.box} accessibilityRole="progressbar" accessibilityLabel={label}>
      <ActivityIndicator color={colors.primary} size="large" />
      <Text tone="soft" style={{ marginTop: space.md }}>
        {label}
      </Text>
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={s.box}>
      <Text variant="heading" center>
        No pudimos cargar esto
      </Text>
      <Text tone="soft" center style={{ marginTop: space.sm, marginBottom: space.xl }}>
        {message}. Revisa tu conexión e inténtalo de nuevo.
      </Text>
      {onRetry && <Button title="Reintentar" variant="secondary" onPress={onRetry} />}
    </View>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: { title: string; onPress: () => void } }) {
  return (
    <View style={s.box}>
      <Text variant="title" center>
        {title}
      </Text>
      <Text tone="soft" center style={{ marginTop: space.sm, marginBottom: space.xl }}>
        {body}
      </Text>
      {action && <Button title={action.title} onPress={action.onPress} />}
    </View>
  );
}

const s = StyleSheet.create({ box: { alignItems: 'center', paddingVertical: space.huge, paddingHorizontal: space.lg } });
