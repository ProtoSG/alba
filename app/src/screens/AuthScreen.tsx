import React, { useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import { useAuth } from '../auth';
import { Button, Card, Field, Pressable, Reveal, Screen, Sunrise, Text, colors, radius, space } from '../ui';

export default function AuthScreen() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const isRegister = mode === 'register';

  const submit = async () => {
    setError('');
    setBusy(true);
    try {
      if (isRegister) await register(email, password, fullName, consent);
      else await login(email, password);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen top contentStyle={{ paddingHorizontal: 0 }}>
      <Reveal>
        <Sunrise />
      </Reveal>
      <View style={s.body}>
        <Reveal index={1}>
          <Text variant="small" tone="faint" style={{ marginBottom: space.xs, letterSpacing: 1.5 }}>
            ALBA
          </Text>
          <Text variant="display">Un espacio para cuidarte</Text>
          <Text tone="soft" style={{ marginTop: space.sm, marginBottom: space.xl }}>
            Responde unas preguntas breves y conoce cómo te has sentido. Es privado, y no reemplaza una evaluación profesional.
          </Text>
        </Reveal>

        <Reveal index={2}>
          <View style={s.segment} accessibilityRole="tablist">
            {(['login', 'register'] as const).map((m) => {
              const on = mode === m;
              return (
                <Pressable
                  key={m}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: on }}
                  onPress={() => {
                    setMode(m);
                    setError('');
                  }}
                  scaleTo={0.98}
                  style={[s.segItem, on && s.segOn]}
                >
                  <Text variant="bodyStrong" tone={on ? 'primary' : 'soft'}>
                    {m === 'login' ? 'Ya tengo cuenta' : 'Crear cuenta'}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Reveal>

        <Reveal index={3}>
          {isRegister && <Field label="Nombre completo" value={fullName} onChangeText={setFullName} autoCapitalize="words" textContentType="name" />}
          <Field label="Correo electrónico" value={email} onChangeText={setEmail} keyboardType="email-address" textContentType="emailAddress" autoComplete="email" />
          <Field
            label={isRegister ? 'Contraseña (mínimo 8 caracteres)' : 'Contraseña'}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType={isRegister ? 'newPassword' : 'password'}
          />
          {isRegister && (
            <Card style={{ marginBottom: space.lg, padding: space.lg }}>
              <View style={s.consentRow}>
                <Switch
                  value={consent}
                  onValueChange={setConsent}
                  trackColor={{ false: colors.line, true: colors.primary }}
                  thumbColor="#fff" {...({ activeThumbColor: "#fff" } as object)}
                  accessibilityLabel="Acepto el consentimiento informado"
                />
                <Text variant="small" tone="soft" style={{ flex: 1, marginLeft: space.md }}>
                  Acepto el consentimiento informado y el tratamiento de mis datos personales (Ley N.° 29733).
                </Text>
              </View>
            </Card>
          )}
          {!!error && (
            <View style={s.error} accessibilityRole="alert">
              <Text variant="small" style={{ color: colors.errorInk }}>
                {error}
              </Text>
            </View>
          )}
          <Button
            title={isRegister ? 'Crear mi cuenta' : 'Ingresar'}
            onPress={submit}
            loading={busy}
            disabled={!email || !password || (isRegister && (!consent || !fullName))}
          />
        </Reveal>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  body: { paddingHorizontal: space.xl, paddingTop: space.lg },
  segment: { flexDirection: 'row', backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: 4, marginBottom: space.xl },
  segItem: { flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm },
  segOn: { backgroundColor: colors.surface },
  consentRow: { flexDirection: 'row', alignItems: 'center' },
  error: { backgroundColor: colors.errorTint, padding: space.md, borderRadius: radius.sm, marginBottom: space.md },
});
