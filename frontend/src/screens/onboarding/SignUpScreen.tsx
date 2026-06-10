import React, { useRef, useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  ScrollView,
  Keyboard,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { colors } from '../../tokens/colours';
import { spacing } from '../../tokens/spacing';
import { typography } from '../../tokens/typography';
import { copy } from '../../tokens/copy';
import { durations } from '../../tokens/durations';
import { useAuth } from '../../hooks/useAuth';
import PactInput from '../../components/base/PactInput';
import PactButton from '../../components/base/PactButton';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function SignUpScreen() {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { session, loading, error: authError, signUp } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const passwordRef = useRef<TextInput>(null);
  const shakeX = useSharedValue(0);

  const triggerShake = useCallback(() => {
    shakeX.value = withSequence(
      withTiming(-8, { duration: durations.instant }),
      withTiming(8, { duration: durations.instant }),
      withTiming(-6, { duration: durations.instant }),
      withTiming(6, { duration: durations.instant }),
      withTiming(0, { duration: durations.fast }),
    );
  }, [shakeX]);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  useEffect(() => {
    if (session) {
      navigation.navigate('NamePhoto');
    }
  }, [session]);

  useEffect(() => {
    if (!authError) return;
    triggerShake();
    if (authError === 'password_too_short') {
      setPasswordError(copy.errorPasswordShort);
    } else if (authError === 'invalid_email') {
      setEmailError(copy.errorInvalidEmail);
    } else if (authError === 'empty_fields') {
      setFormError(copy.errorEmptyFields);
    } else {
      setFormError(copy.errorGeneric);
    }
  }, [authError]);

  const handleSubmit = async () => {
    let eErr: string | null = null;
    let pErr: string | null = null;

    if (!email.trim()) {
      eErr = copy.errorFieldRequired;
    } else if (!isValidEmail(email)) {
      eErr = copy.errorInvalidEmail;
    }

    if (!password) {
      pErr = copy.errorFieldRequired;
    } else if (password.length < 6) {
      pErr = copy.errorPasswordShort;
    }

    setEmailError(eErr);
    setPasswordError(pErr);
    setFormError(null);

    if (eErr || pErr) {
      triggerShake();
      return;
    }

    await signUp(email, password);
  };

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.container}>
              <View style={styles.header}>
                <Text style={[typography.h2, styles.heading]}>
                  {copy.signUpHeading}
                </Text>
              </View>

              <Animated.View style={[styles.form, shakeStyle]}>
                <PactInput
                  label="Email"
                  value={email}
                  onChangeText={text => {
                    setEmail(text);
                    if (emailError) setEmailError(null);
                  }}
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect={false}
                  error={emailError ?? undefined}
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  disabled={loading}
                />

                <PactInput
                  ref={passwordRef}
                  label="Password"
                  value={password}
                  onChangeText={text => {
                    setPassword(text);
                    if (passwordError) setPasswordError(null);
                  }}
                  placeholder="At least 6 characters"
                  secureTextEntry
                  autoComplete="new-password"
                  error={passwordError ?? undefined}
                  returnKeyType="go"
                  onSubmitEditing={handleSubmit}
                  disabled={loading}
                />

                {formError ? (
                  <Text style={styles.formError}>{formError}</Text>
                ) : null}

                <PactButton
                  label={copy.signUpCta}
                  onPress={handleSubmit}
                  variant="primary"
                  loading={loading}
                  disabled={loading}
                />
              </Animated.View>

              <View style={styles.footer}>
                <View style={styles.separator}>
                  <View style={styles.separatorLine} />
                  <Text style={[typography.label, styles.separatorLabel]}>
                    {copy.oauthSeparator}
                  </Text>
                  <View style={styles.separatorLine} />
                </View>

                {/* TODO: OAuth — wire up Google/Apple auth when available */}
                <PactButton
                  label={copy.continueGoogle}
                  onPress={() => {}}
                  variant="ghost"
                  disabled
                />
                <PactButton
                  label={copy.continueApple}
                  onPress={() => {}}
                  variant="ghost"
                  disabled
                />

                <View style={styles.switchLink}>
                  <PactButton
                    label={copy.haveAccount}
                    onPress={() => navigation.navigate('SignIn')}
                    variant="text"
                  />
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.stone,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.xl,
    justifyContent: 'space-between',
  },
  header: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  heading: {
    color: colors.ink,
  },
  form: {
    gap: spacing.md,
  },
  formError: {
    ...typography.bodySm,
    color: colors.danger,
  },
  footer: {
    paddingTop: spacing.xxl,
    gap: spacing.sm,
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.inkBorder,
  },
  separatorLabel: {
    color: colors.inkMuted,
  },
  switchLink: {
    alignItems: 'center',
    marginTop: spacing.xs,
  },
});
