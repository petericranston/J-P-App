import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { colors } from '../../tokens/colours';
import { radius } from '../../tokens/radius';
import { springs } from '../../tokens/springs';

interface ProgressBarProps {
  progress: number; // 0–1
  variant?: 'sprint' | 'health';
  height?: number;
}

export default function ProgressBar({
  progress,
  variant = 'sprint',
  height = 6,
}: ProgressBarProps) {
  const [containerWidth, setContainerWidth] = useState(0);
  const animWidth = useSharedValue(0);

  useEffect(() => {
    if (containerWidth > 0) {
      const target = Math.min(1, Math.max(0, progress)) * containerWidth;
      animWidth.value = withSpring(target, springs.gentle);
    }
  }, [progress, containerWidth]);

  const animStyle = useAnimatedStyle(() => ({
    width: animWidth.value,
  }));

  const fillColor = variant === 'sprint' ? colors.ember : colors.sage;

  return (
    <View
      style={{
        height,
        backgroundColor: colors.stoneMid,
        borderRadius: radius.circle,
        overflow: 'hidden',
      }}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      <Animated.View
        style={[
          {
            height,
            backgroundColor: fillColor,
            borderRadius: radius.circle,
          },
          animStyle,
        ]}
      />
    </View>
  );
}
