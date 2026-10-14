import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../auth';
import type { RootStackParamList } from '../navigation';
import { Button, Card, Pressable, Reveal, Screen, Sunrise, Text, colors, radius, space } from '../ui';

function Tile({ title, body, onPress }: { title: string; body: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={title} onPress={onPress} style={s.tile}>
      <Text variant="heading">{title}</Text>
      <Text variant="small" tone="soft" style={{ marginTop: 4 }}>
        {body}
      </Text>
    </Pressable>
  );
}

export default function HomeScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Home'>) {
  const { user, logout } = useAuth();
  const firstName = user?.fullName?.trim().split(/\s+/)[0] ?? '';
  return (
    <Screen top contentStyle={{ paddingHorizontal: 0 }}>
      <Reveal>
        <Sunrise />
      </Reveal>
      <View style={s.body}>
        <Reveal index={1}>
          <Text variant="display">Hola, {firstName}</Text>
          <Text tone="soft" style={{ marginTop: space.sm, marginBottom: space.xl }}>
            Qué bueno verte por aquí. Tómate un momento para ti.
          </Text>
        </Reveal>
        <Reveal index={2}>
          <Card lifted style={{ marginBottom: space.lg }}>
            <Text variant="title">¿Cómo te has sentido?</Text>
            <Text tone="soft" style={{ marginTop: space.sm, marginBottom: space.lg }}>
              Son 9 preguntas sobre las últimas 2 semanas y unos datos adicionales. Toma unos 2 minutos y no hay respuestas correctas.
            </Text>
            <Button title="Comenzar evaluación" onPress={() => navigation.navigate('Form')} />
          </Card>
        </Reveal>
        <Reveal index={3}>
          <View style={s.tiles}>
            <Tile title="Mi historial" body="Mira cómo has ido evolucionando" onPress={() => navigation.navigate('History')} />
            <Tile title="Recursos" body="Consejos y apoyo para tu bienestar" onPress={() => navigation.navigate('Psychoeducation', {})} />
          </View>
        </Reveal>
        <Reveal index={4}>
          <Button title="Cerrar sesión" variant="ghost" onPress={logout} />
        </Reveal>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  body: { paddingHorizontal: space.xl, paddingTop: space.lg },
  tiles: { flexDirection: 'row', gap: space.md, marginBottom: space.lg },
  tile: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, padding: space.lg, minHeight: 104, borderWidth: 1, borderColor: colors.line },
});
