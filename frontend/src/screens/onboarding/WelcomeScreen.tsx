import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { colors } from '../../tokens/colours';
import { spacing } from '../../tokens/spacing';
import { typography } from '../../tokens/typography';
import { copy } from '../../tokens/copy';
import { springs } from '../../tokens/springs';
import PactButton from '../../components/base/PactButton';

export default function WelcomeScreen() {
  const navigation = useNavigation<StackNavigationProp<any>>();

  const wordmarkOp = useSharedValue(0);
  const wordmarkY = useSharedValue(20);
  const taglineOp = useSharedValue(0);
  const taglineY = useSharedValue(14);
  const ctaOp = useSharedValue(0);
  const ctaY = useSharedValue(14);

  useEffect(() => {
    wordmarkOp.value = withTiming(1, { duration: 480 });
    wordmarkY.value = withSpring(0, springs.gentle);

    taglineOp.value = withDelay(150, withTiming(1, { duration: 480 }));
    taglineY.value = withDelay(150, withSpring(0, springs.gentle));

    ctaOp.value = withDelay(350, withTiming(1, { duration: 400 }));
    ctaY.value = withDelay(350, withSpring(0, springs.gentle));
  }, []);

  const wordmarkStyle = useAnimatedStyle(() => ({
    opacity: wordmarkOp.value,
    transform: [{ translateY: wordmarkY.value }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOp.value,
    transform: [{ translateY: taglineY.value }],
  }));

  const ctaStyle = useAnimatedStyle(() => ({
    opacity: ctaOp.value,
    transform: [{ translateY: ctaY.value }],
  }));

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.container}>
        <View style={styles.hero}>
          <Animated.Text style={[typography.display, styles.wordmark, wordmarkStyle]}>
            PACT
          </Animated.Text>
          <Animated.Text style={[typography.bodyLg, styles.tagline, taglineStyle]}>
            {copy.tagline}
          </Animated.Text>
        </View>

        <Animated.View style={[styles.ctas, ctaStyle]}>
          <PactButton
            label={copy.welcomeCta}
            onPress={() => navigation.navigate('SignUp')}
            variant="primary"
          />
          <PactButton
            label={copy.haveAccount}
            onPress={() => navigation.navigate('SignIn')}
            variant="text"
          />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.stone,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.xl,
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
  },
  wordmark: {
    color: colors.ember,
    letterSpacing: -1.5,
  },
  tagline: {
    color: colors.inkMid,
    marginTop: spacing.sm,
  },
  ctas: {
    gap: spacing.sm,
  },
});
