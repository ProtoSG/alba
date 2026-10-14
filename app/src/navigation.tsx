import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { Assessment } from './api';
import { useAuth } from './auth';
import AuthScreen from './screens/AuthScreen';
import FormScreen from './screens/FormScreen';
import HistoryScreen from './screens/HistoryScreen';
import HomeScreen from './screens/HomeScreen';
import PsychoeducationScreen from './screens/PsychoeducationScreen';
import ResultScreen from './screens/ResultScreen';
import { LoadingState, colors, fonts, useReduceMotion } from './ui';

export type RootStackParamList = {
  Home: undefined;
  Form: undefined;
  Result: { assessment: Assessment };
  History: undefined;
  Psychoeducation: { risk?: string } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthNav = createNativeStackNavigator();

const theme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: colors.canvas, card: colors.canvas, text: colors.ink, primary: colors.primary, border: colors.line } };

export default function Navigation() {
  const { user, ready } = useAuth();
  const reduced = useReduceMotion();
  if (!ready) return <LoadingState />;
  // Reduced motion: screens cross-fade instead of sliding.
  const screenOptions = {
    animation: reduced ? ('fade' as const) : ('default' as const),
    headerShadowVisible: false,
    headerStyle: { backgroundColor: colors.canvas },
    headerTintColor: colors.primary,
    headerTitleStyle: { fontFamily: fonts.bold, color: colors.ink },
    headerBackTitleVisible: false,
    contentStyle: { backgroundColor: colors.canvas },
  };
  return (
    <NavigationContainer theme={theme}>
      {user ? (
        <Stack.Navigator screenOptions={screenOptions}>
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Form" component={FormScreen} options={{ title: 'Evaluación' }} />
          <Stack.Screen name="Result" component={ResultScreen} options={{ title: 'Tu resultado', headerBackVisible: false, animation: 'fade' }} />
          <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'Historial' }} />
          <Stack.Screen name="Psychoeducation" component={PsychoeducationScreen} options={{ title: 'Recursos' }} />
        </Stack.Navigator>
      ) : (
        <AuthNav.Navigator screenOptions={screenOptions}>
          <AuthNav.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
        </AuthNav.Navigator>
      )}
    </NavigationContainer>
  );
}
