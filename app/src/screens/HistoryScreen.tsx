import React, { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api, type Assessment } from '../api';
import type { RootStackParamList } from '../navigation';
import { RISK_LABEL, SEVERITY_LABEL, type Severity } from '../phq9';
import { Card, EmptyState, ErrorState, LoadingState, Reveal, Screen, Tag, Text, colors, fonts, severity, space } from '../ui';

// PHQ-9 bands, drawn as soft background stripes behind the line.
const BANDS: { from: number; to: number; level: Severity }[] = [
  { from: 0, to: 5, level: 'MINIMAL' },
  { from: 5, to: 10, level: 'MILD' },
  { from: 10, to: 15, level: 'MODERATE' },
  { from: 15, to: 20, level: 'MODERATELY_SEVERE' },
  { from: 20, to: 27, level: 'SEVERE' },
];

const fmtDay = (iso: string) => new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' });

function TrendChart({ items }: { items: Assessment[] }) {
  const [w, setW] = useState(0);
  const data = [...items].reverse().slice(-12); // oldest -> newest
  const h = 190;
  const pad = { l: 28, r: 22, t: 12, b: 26 };
  const iw = Math.max(0, w - pad.l - pad.r);
  const ih = h - pad.t - pad.b;
  const y = (v: number) => pad.t + ih - (v / 27) * ih;
  const x = (i: number) => pad.l + (data.length === 1 ? iw / 2 : (i / (data.length - 1)) * iw);
  const line = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i)} ${y(d.totalScore)}`).join(' ');
  const summary = `Evolución del puntaje: ${data.map((d) => d.totalScore).join(', ')} (de 27).`;

  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)} accessible accessibilityLabel={summary}>
      {w > 0 && (
        <Svg width={w} height={h}>
          {BANDS.map((b) => (
            <Rect key={b.level} x={pad.l} width={iw} y={y(b.to)} height={y(b.from) - y(b.to)} fill={severity[b.level].tint} opacity={0.7} />
          ))}
          {[0, 5, 10, 15, 20, 27].map((t) => (
            <SvgText key={t} x={pad.l - 6} y={y(t) + 4} fontSize={11} fill={colors.inkFaint} textAnchor="end" fontFamily={fonts.regular}>
              {t}
            </SvgText>
          ))}
          {data.length > 1 && <Path d={line} stroke={colors.primary} strokeWidth={2.5} fill="none" strokeLinejoin="round" strokeLinecap="round" />}
          {data.map((d, i) => (
            <React.Fragment key={d.id}>
              <Circle cx={x(i)} cy={y(d.totalScore)} r={6} fill="#fff" stroke={severity[d.severityLevel].solid} strokeWidth={3} />
              {(data.length <= 6 || i % 2 === data.length % 2) && (
                <SvgText x={x(i)} y={h - 8} fontSize={11} fill={colors.inkFaint} textAnchor="middle" fontFamily={fonts.regular}>
                  {fmtDay(d.createdAt)}
                </SvgText>
              )}
            </React.Fragment>
          ))}
          <Line x1={pad.l} x2={pad.l + iw} y1={y(0)} y2={y(0)} stroke={colors.line} />
        </Svg>
      )}
    </View>
  );
}

function trendNote(items: Assessment[]): string | null {
  if (items.length < 2) return null;
  const diff = items[0].totalScore - items[1].totalScore; // history is newest first
  if (diff === 0) return 'Tu puntaje se mantiene igual que en la evaluación anterior.';
  const pts = Math.abs(diff) === 1 ? '1 punto' : `${Math.abs(diff)} puntos`;
  return diff < 0 ? `Bajó ${pts} respecto a la evaluación anterior.` : `Subió ${pts} respecto a la evaluación anterior. Si te sientes mal, no dudes en buscar apoyo.`;
}

export default function HistoryScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'History'>) {
  const [items, setItems] = useState<Assessment[] | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setError('');
    setItems(null);
    api.history().then(setItems).catch((e: Error) => setError(e.message));
  }, []);
  useEffect(load, [load]);

  if (error) return <Screen><ErrorState message={error} onRetry={load} /></Screen>;
  if (!items) return <Screen><LoadingState label="Cargando tu historial…" /></Screen>;
  if (items.length === 0) {
    return (
      <Screen>
        <EmptyState
          title="Aún no tienes evaluaciones"
          body="Cuando completes tu primera evaluación, aquí verás cómo evoluciona tu bienestar."
          action={{ title: 'Comenzar evaluación', onPress: () => navigation.navigate('Form') }}
        />
      </Screen>
    );
  }

  const note = trendNote(items);
  return (
    <Screen>
      <Reveal>
        <Text variant="title">Tu evolución</Text>
        {note && (
          <Text tone="soft" style={{ marginTop: space.xs }}>
            {note}
          </Text>
        )}
      </Reveal>
      <Reveal index={1} style={{ marginTop: space.lg, marginBottom: space.xl }}>
        <Card lifted style={{ padding: space.lg }}>
          <TrendChart items={items} />
          <Text variant="small" tone="faint" style={{ marginTop: space.sm }}>
            Escala de 0 a 27. La más reciente está a la derecha.
          </Text>
        </Card>
      </Reveal>
      {items.map((a, i) => {
        const sev = severity[a.severityLevel];
        return (
          <Reveal key={a.id} index={i + 2} style={{ marginBottom: space.md }}>
            <Card style={{ padding: space.lg }}>
              <Text variant="small" tone="faint">
                {new Date(a.createdAt).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' })}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space.sm }}>
                <Text variant="heading">{a.totalScore} / 27</Text>
                <Tag label={SEVERITY_LABEL[a.severityLevel]} tint={sev.tint} ink={sev.ink} />
              </View>
              <Text variant="small" tone="soft" style={{ marginTop: space.sm }}>
                Estimación del modelo: {a.mlRiskLevel ? RISK_LABEL[a.mlRiskLevel] : 'no disponible'}
              </Text>
              {a.suicideAlert && (
                <Text variant="small" style={{ marginTop: space.sm, color: colors.careInk }}>
                  Se marcó una respuesta que merece atención (ítem 9).
                </Text>
              )}
            </Card>
          </Reveal>
        );
      })}
    </Screen>
  );
}
