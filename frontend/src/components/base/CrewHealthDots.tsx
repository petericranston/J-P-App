import React from 'react';
import { View } from 'react-native';
import { colors } from '../../tokens/colours';
import { spacing } from '../../tokens/spacing';
import { radius } from '../../tokens/radius';

interface CrewHealthDotsProps {
  count: number; // 0–5 filled dots out of 5
  dotSize?: number;
}

export default function CrewHealthDots({ count, dotSize = 8 }: CrewHealthDotsProps) {
  return (
    <View style={{ flexDirection: 'row', gap: spacing.xs }}>
      {Array.from({ length: 5 }, (_, i) => (
        <View
          key={i}
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: radius.circle,
            backgroundColor: i < count ? colors.ember : colors.stoneDeep,
          }}
        />
      ))}
    </View>
  );
}
