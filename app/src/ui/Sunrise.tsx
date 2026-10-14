import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { colors } from './tokens';

// Signature illustration: a low sun over two soft hills (calm, "things can lighten").
export function Sunrise({ height = 150 }: { height?: number }) {
  return (
    <View aria-hidden importantForAccessibility="no-hide-descendants" style={{ width: '100%' }}>
    <Svg width="100%" height={height} viewBox="0 0 360 150" preserveAspectRatio="xMidYMax slice">
      <Defs>
        <LinearGradient id="sun" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={colors.sunTop} />
          <Stop offset="1" stopColor={colors.sunBottom} />
        </LinearGradient>
      </Defs>
      <Circle cx="250" cy="78" r="46" fill="url(#sun)" />
      <Path d="M0 110 C70 78 130 96 190 104 C250 112 310 84 360 98 L360 150 L0 150 Z" fill={colors.hill1} />
      <Path d="M0 130 C60 108 140 124 210 126 C270 128 320 114 360 122 L360 150 L0 150 Z" fill={colors.hill2} />
    </Svg>
    </View>
  );
}
