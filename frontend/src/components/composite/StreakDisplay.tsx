import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { colors } from '../../tokens/colours';
import { typography } from '../../tokens/typography';
import { spacing } from '../../tokens/spacing';
import { springs } from '../../tokens/springs';

export type StreakState = 'active' | 'shield' | 'broken';

interface StreakDisplayProps {
  current: number;
  longest: number;
  state: StreakState;
  size?: 'hero' | 'compact';
}

const STATE_LABELS: Record<StreakState, string> = {
  active: 'day streak',
  shield: 'day streak · shielded',
  broken: 'days — keep going',
};

const STATE_COLORS: Record<StreakState, string> = {
  active: colors.ember,
  shield: colors.slate,
  broken: colors.inkMuted,
};

export default function StreakDisplay({
  current,
  longest,
  state,
  size = 'hero',
}: StreakDisplayProps) {
  const scale = useSharedValue(0.7);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(120, withSpring(1, springs.bouncy));
    scale.value = withDelay(120, withSpring(1, springs.bouncy));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const isHero = size === 'hero';
  const accentColor = STATE_COLORS[state];

  return (
    <View style={{ alignItems: 'center', gap: spacing.xs }}>
      <Animated.View style={[{ alignItems: 'center', gap: spacing.xs }, animStyle]}>
        <Text
          style={[
            isHero ? typography.display : typography.h1,
            { color: accentColor },
          ]}
        >
          {current}
        </Text>
        <Text style={[typography.label, { color: colors.inkMuted }]}>
          {STATE_LABELS[state]}
        </Text>
      </Animated.View>

      {isHero && longest > current && (
        <Text style={[typography.caption, { color: colors.inkMuted, marginTop: spacing.xs }]}>
          Best: {longest}
        </Text>
      )}
    </View>
  );
}
