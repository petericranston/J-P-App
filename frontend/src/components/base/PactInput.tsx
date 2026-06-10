import React, { useState, useEffect, forwardRef } from 'react';
import {
  TextInput,
  Text,
  View,
  StyleSheet,
  type TextInputProps,
  type KeyboardTypeOptions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { colors } from '../../tokens/colours';
import { spacing } from '../../tokens/spacing';
import { radius } from '../../tokens/radius';
import { typography } from '../../tokens/typography';
import { durations } from '../../tokens/durations';

export interface PactInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoComplete?: TextInputProps['autoComplete'];
  autoCorrect?: boolean;
  autoFocus?: boolean;
  disabled?: boolean;
  returnKeyType?: TextInputProps['returnKeyType'];
  onSubmitEditing?: () => void;
  testID?: string;
}

// Border state values: 0 = rest, 1 = focused, 2 = error
const S_REST = 0;
const S_FOCUS = 1;
const S_ERROR = 2;

const PactInput = forwardRef<TextInput, PactInputProps>(function PactInput(
  {
    value,
    onChangeText,
    placeholder,
    label,
    error,
    secureTextEntry = false,
    keyboardType = 'default',
    autoCapitalize = 'none',
    autoComplete,
    autoCorrect = false,
    autoFocus = false,
    disabled = false,
    returnKeyType,
    onSubmitEditing,
    testID,
  },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const borderState = useSharedValue(S_REST);

  useEffect(() => {
    const target = error ? S_ERROR : focused ? S_FOCUS : S_REST;
    borderState.value = withTiming(target, { duration: durations.fast });
  }, [error, focused]);

  const containerAnimStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      borderState.value,
      [S_REST, S_FOCUS, S_ERROR],
      [colors.inkBorderMid, colors.ember, colors.danger],
    ),
  }));

  return (
    <View style={styles.wrapper}>
      {label != null ? (
        <Text style={[styles.label, { color: error ? colors.danger : colors.inkMid }]}>
          {label}
        </Text>
      ) : null}

      <Animated.View
        style={[
          styles.container,
          containerAnimStyle,
          disabled && styles.containerDisabled,
        ]}
      >
        <TextInput
          ref={ref}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.inkMuted}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          autoCorrect={autoCorrect}
          autoFocus={autoFocus}
          editable={!disabled}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[styles.input, { color: disabled ? colors.inkMuted : colors.ink }]}
          testID={testID}
        />
      </Animated.View>

      {error != null ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}
    </View>
  );
});

export default PactInput;

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  label: {
    ...typography.label,
    marginBottom: spacing.xs,
  },
  container: {
    height: 52,
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: spacing.base,
    justifyContent: 'center',
    backgroundColor: colors.stone,
  },
  containerDisabled: {
    backgroundColor: colors.stoneMid,
  },
  input: {
    ...typography.bodyLg,
    paddingVertical: 0,
  },
  errorText: {
    ...typography.bodySm,
    color: colors.danger,
    marginTop: spacing.xs,
  },
});
