import React from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { RISK_LABEL, SEVERITY_EXPLAIN, SEVERITY_LABEL, closeCall } from '../phq9';
import { Button, Card, Reveal, Screen, Tag, Text, colors, radius, severity, space } from '../ui';

function ScoreRing({ score, color, track }: { score: number; color: string; track: string }) {
  const size = 132;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${(score / 27) * c} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <Text variant="display">{score}</Text>
      <Text variant="small" tone="faint">
        de 27
      </Text>
    </View>
  );
}

export default function ResultScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'Result'>) {
  const a = route.params.assessment;
  const sev = severity[a.severityLevel];
  // Item 9 > 0 always raises the alert, whatever the total score.
  const showAlert = a.suicideAlert || a.referralRecommended;
  const undecided = closeCall(a.mlProbabilities);

  return (
    <Screen>
      {showAlert && (
        <Reveal>
          <Card tone={{ tint: colors.careTint, line: colors.careLine }} style={{ marginBottom: space.lg }}>
            <Text variant="title" style={{ color: colors.careInk }} accessibilityRole="header">
              {a.suicideAlert ? 'Gracias por contarlo. Mereces apoyo.' : 'Te recomendamos hablar con un profesional'}
            </Text>
            {a.suicideAlert ? (
              <>
                <Text style={{ color: colors.careInk, marginTop: space.sm }}>
                  Tu respuesta al ítem 9 indica pensamientos de lastimarte o de que estarías mejor muerto(a). No tienes que cargar con esto solo(a).
                  Por favor, comunícate hoy con un profesional de salud mental o con el servicio de bienestar universitario.
                </Text>
                <Text style={{ color: colors.careInk, marginTop: space.md }}>
                  En Perú puedes llamar a la Línea 113, opción 5 (24 horas). Si estás en peligro inmediato, llama al 116 o acude a emergencias.
                </Text>
                <View style={{ marginTop: space.lg }}>
                  <Button title="Llamar a la Línea 113" variant="care" onPress={() => Linking.openURL('tel:113').catch(() => {})} />
                </View>
              </>
            ) : (
              <Text style={{ color: colors.careInk, marginTop: space.sm }}>
                Tu puntaje sugiere síntomas severos. Te recomendamos una evaluación profesional lo antes posible.
              </Text>
            )}
          </Card>
        </Reveal>
      )}

      <Reveal index={1}>
        <Card lifted style={{ marginBottom: space.lg, alignItems: 'center' }}>
          <Text variant="small" tone="faint" style={{ marginBottom: space.md }}>
            Tu puntaje PHQ-9
          </Text>
          <ScoreRing score={a.totalScore} color={sev.solid} track={sev.tint} />
          <View style={{ marginTop: space.lg, alignItems: 'center' }}>
            <Tag label={`Nivel ${SEVERITY_LABEL[a.severityLevel].toLowerCase()}`} tint={sev.tint} ink={sev.ink} />
          </View>
          <Text tone="soft" center style={{ marginTop: space.md }}>
            {SEVERITY_EXPLAIN[a.severityLevel]}
          </Text>
        </Card>
      </Reveal>

      <Reveal index={2}>
        <Card tone={{ tint: colors.infoTint }} style={{ marginBottom: space.lg }}>
          <Text variant="heading" style={{ color: colors.info }}>
            Otra mirada, solo como apoyo
          </Text>
          {a.mlAvailable && a.mlRiskLevel ? (
            <>
              {undecided ? (
                <Text style={{ marginTop: space.sm }}>
                  Un modelo estadístico ve un perfil{' '}
                  <Text variant="bodyStrong">
                    entre riesgo {RISK_LABEL[undecided[0]].toLowerCase()} y {RISK_LABEL[undecided[1]].toLowerCase()}
                  </Text>
                  : las dos opciones están muy cerca y no puede decidirse con claridad. Es una orientación, no un veredicto sobre ti.
                </Text>
              ) : (
                <Text style={{ marginTop: space.sm }}>
                  Un modelo estadístico estima un riesgo <Text variant="bodyStrong">{RISK_LABEL[a.mlRiskLevel].toLowerCase()}</Text> a partir de tus datos. Es una
                  orientación, no un veredicto sobre ti.
                </Text>
              )}
              {a.mlProbabilities && (
                <View style={{ marginTop: space.md, gap: space.sm }}>
                  {Object.entries(a.mlProbabilities).map(([k, v]) => (
                    <View key={k}>
                      <View style={s.probRow}>
                        <Text variant="small">{RISK_LABEL[k] ?? k}</Text>
                        <Text variant="small">{(v * 100).toFixed(0)}%</Text>
                      </View>
                      <View style={s.probTrack}>
                        <View style={[s.probFill, { width: `${Math.round(v * 100)}%` }]} />
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </>
          ) : (
            <Text style={{ marginTop: space.sm }}>
              La estimación del modelo no está disponible en este momento. El puntaje PHQ-9 sigue siendo válido.
            </Text>
          )}
        </Card>
      </Reveal>

      <Reveal index={3}>
        <Text variant="small" tone="faint" center style={{ marginBottom: space.lg }}>
          Este resultado es orientativo y no constituye un diagnóstico.
        </Text>
        <View style={{ gap: space.sm }}>
          <Button title="Ver recursos recomendados" onPress={() => navigation.navigate('Psychoeducation', { risk: a.mlRiskLevel ?? undefined })} />
          <Button title="Volver al inicio" variant="ghost" onPress={() => navigation.popToTop()} />
        </View>
      </Reveal>
    </Screen>
  );
}

const s = StyleSheet.create({
  probRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  probTrack: { height: 8, borderRadius: radius.pill, backgroundColor: '#fff', overflow: 'hidden' },
  probFill: { height: 8, borderRadius: radius.pill, backgroundColor: colors.info },
});
