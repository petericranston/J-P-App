import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { colors } from '../../tokens/colours';
import { typography } from '../../tokens/typography';
import { spacing } from '../../tokens/spacing';
import { radius } from '../../tokens/radius';
import { springs } from '../../tokens/springs';

interface Reaction {
  emoji: string;
  count: number;
}

interface ReactionBarProps {
  reactions: Reaction[];
  onReact?: (emoji: string) => void;
}

function ReactionPill({
  emoji,
  count,
  onPress,
}: {
  emoji: string;
  count: number;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  function handlePress() {
    scale.value = withSequence(
      withSpring(1.4, springs.snappy),
      withSpring(1, springs.snappy),
    );
    onPress();
  }

  return (
    <Pressable onPress={handlePress}>
      <Animated.View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.xs,
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,
            borderRadius: radius.full,
            backgroundColor: colors.emberSurface,
            borderWidth: 1,
            borderColor: colors.emberBorder,
          },
          animStyle,
        ]}
      >
        <Text style={{ fontSize: 14 }}>{emoji}</Text>
        {count > 0 && (
          <Text style={[typography.label, { color: colors.ember }]}>{count}</Text>
        )}
      </Animated.View>
    </Pressable>
  );
}

export default function ReactionBar({ reactions, onReact }: ReactionBarProps) {
  const visible = reactions.filter((r) => r.count > 0);

  if (visible.length === 0) return null;

  return (
    <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
      {visible.map((r) => (
        <ReactionPill
          key={r.emoji}
          emoji={r.emoji}
          count={r.count}
          onPress={() => onReact?.(r.emoji)}
        />
      ))}
    </View>
  );
}
