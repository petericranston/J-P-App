import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { colors } from '../../tokens/colours';
import { spacing } from '../../tokens/spacing';
import { typography } from '../../tokens/typography';
import { copy } from '../../tokens/copy';
import { springs } from '../../tokens/springs';

export default function SplashScreen() {
  const navigation = useNavigation<StackNavigationProp<any>>();

  const wordmarkOpacity = useSharedValue(0);
  const wordmarkY = useSharedValue(10);
  const taglineOpacity = useSharedValue(0);
  const taglineY = useSharedValue(8);

  useEffect(() => {
    wordmarkOpacity.value = withTiming(1, { duration: 480 });
    wordmarkY.value = withSpring(0, springs.gentle);

    taglineOpacity.value = withDelay(180, withTiming(1, { duration: 480 }));
    taglineY.value = withDelay(180, withSpring(0, springs.gentle));

    const timer = setTimeout(() => navigation.replace('Welcome'), 1800);
    return () => clearTimeout(timer);
  }, []);

  const wordmarkStyle = useAnimatedStyle(() => ({
    opacity: wordmarkOpacity.value,
    transform: [{ translateY: wordmarkY.value }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [{ translateY: taglineY.value }],
  }));

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.ink,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.screen,
      }}
    >
      <Animated.Text
        style={[
          typography.display,
          { color: colors.ember, letterSpacing: -1.5 },
          wordmarkStyle,
        ]}
      >
        PACT
      </Animated.Text>

      <Animated.Text
        style={[
          typography.body,
          {
            color: colors.stoneDeep,
            marginTop: spacing.sm,
            textAlign: 'center',
          },
          taglineStyle,
        ]}
      >
        {copy.tagline}
      </Animated.Text>
    </View>
  );
}
