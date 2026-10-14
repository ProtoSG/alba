import React from 'react';
import { Text as RNText, type TextProps } from 'react-native';
import { colors, type as typeScale } from './tokens';

type Props = TextProps & {
  variant?: keyof typeof typeScale;
  tone?: 'ink' | 'soft' | 'faint' | 'primary' | 'onPrimary';
  center?: boolean;
};

const toneColor = {
  ink: colors.ink,
  soft: colors.inkSoft,
  faint: colors.inkFaint,
  primary: colors.primary,
  onPrimary: colors.onPrimary,
};

export function Text({ variant = 'body', tone = 'ink', center, style, ...rest }: Props) {
  return <RNText {...rest} style={[typeScale[variant], { color: toneColor[tone] }, center && { textAlign: 'center' }, style]} />;
}
