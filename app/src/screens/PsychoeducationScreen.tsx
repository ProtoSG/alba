import React, { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api, type Content } from '../api';
import type { RootStackParamList } from '../navigation';
import { Card, EmptyState, ErrorState, LoadingState, Reveal, Screen, Text, colors, space } from '../ui';

export default function PsychoeducationScreen({ route }: NativeStackScreenProps<RootStackParamList, 'Psychoeducation'>) {
  const risk = route.params?.risk;
  const [items, setItems] = useState<Content[] | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setError('');
    setItems(null);
    api.psychoeducation(risk).then(setItems).catch((e: Error) => setError(e.message));
  }, [risk]);
  useEffect(load, [load]);

  return (
    <Screen>
      <Text variant="title">Para cuidar de ti</Text>
      <Text tone="soft" style={{ marginTop: space.xs, marginBottom: space.xl }}>
        Ideas sencillas que puedes aplicar a tu ritmo.
      </Text>
      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : !items ? (
        <LoadingState label="Cargando recursos…" />
      ) : items.length === 0 ? (
        <EmptyState title="Aún no hay recursos" body="Vuelve a revisar más tarde." />
      ) : (
        items.map((c, i) => (
          <Reveal key={c.id} index={i} style={{ marginBottom: space.md }}>
            <Card>
              <View style={{ width: 28, height: 4, borderRadius: 2, backgroundColor: colors.hill2, marginBottom: space.md }} />
              <Text variant="heading">{c.title}</Text>
              <Text tone="soft" style={{ marginTop: space.sm }}>
                {c.body}
              </Text>
            </Card>
          </Reveal>
        ))
      )}
    </Screen>
  );
}
