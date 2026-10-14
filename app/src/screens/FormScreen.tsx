import React, { useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api } from '../api';
import type { RootStackParamList } from '../navigation';
import { INSTRUCTION, ITEMS, OPTIONS } from '../phq9';
import { Button, Card, Chip, Field, Pressable, ProgressBar, Reveal, Screen, Text, colors, haptic, radius, space } from '../ui';

type Props = NativeStackScreenProps<RootStackParamList, 'Form'>;

const TOTAL = 10; // 9 PHQ-9 items + 1 context step used by the ML model

function AnswerCard({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ selected, checked: selected }}
      onPress={() => {
        haptic.select();
        onPress();
      }}
      scaleTo={0.98}
      style={[s.answer, selected ? { backgroundColor: colors.primaryTint, borderColor: colors.primary } : { backgroundColor: colors.surface, borderColor: colors.line }]}
    >
      <View style={[s.radio, selected && { borderColor: colors.primary, backgroundColor: colors.primary }]}>
        {selected && <View style={s.radioDot} />}
      </View>
      <Text variant="bodyStrong" style={{ flex: 1, marginLeft: space.md }}>
        {label}
      </Text>
    </Pressable>
  );
}

function SwitchRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={s.switchRow}>
      <Text style={{ flex: 1, marginRight: space.md }}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ false: colors.line, true: colors.primary }} thumbColor="#fff" {...({ activeThumbColor: "#fff" } as object)} accessibilityLabel={label} />
    </View>
  );
}

// Steps 0..8 = PHQ-9 items, step 9 = context questions used by the ML model.
export default function FormScreen({ navigation }: Props) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(9).fill(null));
  const [age, setAge] = useState('');
  const [sex, setSex] = useState<'F' | 'M'>('F');
  const [semester, setSemester] = useState('');
  const [sleep, setSleep] = useState('');
  const [study, setStudy] = useState('');
  const [works, setWorks] = useState(false);
  const [family, setFamily] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const isContext = step === 9;

  const submit = async () => {
    setError('');
    setBusy(true);
    try {
      const result = await api.createAssessment({
        answers: answers as number[],
        age: Number(age),
        sex,
        semester: Number(semester),
        sleepHours: Number(sleep.replace(',', '.')),
        weeklyStudyHours: Number(study.replace(',', '.')),
        worksPartTime: works,
        livesWithFamily: family,
      });
      haptic.success();
      navigation.replace('Result', { assessment: result });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const contextValid = !!age && !!semester && sleep !== '' && study !== '';

  return (
    <Screen>
      <ProgressBar value={(step + 1) / TOTAL} label={`Paso ${step + 1} de ${TOTAL}`} />
      <Text variant="small" tone="faint" style={{ marginTop: space.sm, marginBottom: space.xl }}>
        {isContext ? 'Último paso' : `Pregunta ${step + 1} de 9`}
      </Text>

      <Reveal key={step} from="right">
        {!isContext ? (
          <>
            <Text variant="small" tone="soft">
              {INSTRUCTION}
            </Text>
            <Text variant="title" style={{ marginTop: space.md, marginBottom: space.xl }} accessibilityRole="header">
              {ITEMS[step]}
            </Text>
            {step === 8 && (
              <Card tone={{ tint: colors.careTint }} style={{ marginBottom: space.lg, padding: space.lg }}>
                <Text variant="small" style={{ color: colors.careInk }}>
                  Esta pregunta es importante. Responde con sinceridad: aquí no te juzgamos.
                </Text>
              </Card>
            )}
            <View accessibilityRole="radiogroup" style={{ gap: space.md }}>
              {OPTIONS.map((o) => (
                <AnswerCard
                  key={o.value}
                  label={o.label}
                  selected={answers[step] === o.value}
                  onPress={() => setAnswers(answers.map((a, i) => (i === step ? o.value : a)))}
                />
              ))}
            </View>
          </>
        ) : (
          <>
            <Text variant="title">Cuéntanos un poco de ti</Text>
            <Text tone="soft" style={{ marginTop: space.sm, marginBottom: space.xl }}>
              Estos datos ayudan a interpretar mejor tus respuestas.
            </Text>
            <Field label="Edad" value={age} onChangeText={setAge} keyboardType="number-pad" />
            <Text variant="label" tone="soft" style={{ marginBottom: 6 }}>
              Sexo
            </Text>
            <View accessibilityRole="radiogroup" style={{ flexDirection: 'row', gap: space.md, marginBottom: space.lg }}>
              <Chip label="Femenino" selected={sex === 'F'} onPress={() => setSex('F')} />
              <Chip label="Masculino" selected={sex === 'M'} onPress={() => setSex('M')} />
            </View>
            <Field label="Ciclo / semestre actual" value={semester} onChangeText={setSemester} keyboardType="number-pad" />
            <Field label="Horas de sueño por noche (promedio)" value={sleep} onChangeText={setSleep} keyboardType="decimal-pad" />
            <Field label="Horas de estudio por semana" value={study} onChangeText={setStudy} keyboardType="decimal-pad" />
            <Card style={{ padding: space.lg }}>
              <SwitchRow label="Trabajo a tiempo parcial" value={works} onChange={setWorks} />
              <View style={s.divider} />
              <SwitchRow label="Vivo con mi familia" value={family} onChange={setFamily} />
            </Card>
          </>
        )}
      </Reveal>

      {!!error && (
        <View style={s.error} accessibilityRole="alert">
          <Text variant="small" style={{ color: colors.errorInk }}>
            No pudimos enviar tus respuestas: {error}. Puedes intentarlo de nuevo.
          </Text>
        </View>
      )}

      <View style={{ marginTop: space.xl, gap: space.sm }}>
        {isContext ? (
          <Button title="Ver mi resultado" onPress={submit} loading={busy} disabled={!contextValid} />
        ) : (
          <Button title="Siguiente" onPress={() => setStep(step + 1)} disabled={answers[step] === null} />
        )}
        {step > 0 && <Button title="Anterior" variant="ghost" onPress={() => setStep(step - 1)} disabled={busy} />}
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  answer: { flexDirection: 'row', alignItems: 'center', minHeight: 64, paddingHorizontal: space.lg, paddingVertical: space.md, borderRadius: radius.md, borderWidth: 1.5 },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: colors.inkFaint, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
  switchRow: { flexDirection: 'row', alignItems: 'center', minHeight: 44 },
  divider: { height: 1, backgroundColor: colors.line, marginVertical: space.sm },
  error: { backgroundColor: colors.errorTint, padding: space.md, borderRadius: radius.sm, marginTop: space.lg },
});
