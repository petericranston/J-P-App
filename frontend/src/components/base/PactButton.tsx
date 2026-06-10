import React from "react";
import { ActivityIndicator } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import { colors } from "../../tokens/colours";
import { spacing } from "../../tokens/spacing";
import { radius } from "../../tokens/radius";
import { typography } from "../../tokens/typography";
import { springs } from "../../tokens/springs";

interface PactButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost" | "text" | "danger";
  size?: "default" | "small";
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

type Variant = NonNullable<PactButtonProps["variant"]>;
type Size = NonNullable<PactButtonProps["size"]>;

const HEIGHTS: Record<Variant, Record<Size, number>> = {
  primary: { default: 52, small: 40 },
  secondary: { default: 52, small: 40 },
  ghost: { default: 48, small: 36 },
  text: { default: 0, small: 0 },
  danger: { default: 48, small: 36 },
};

export default function PactButton({
  label,
  onPress,
  variant = "primary",
  size = "default",
  loading = false,
  disabled = false,
  fullWidth = true,
}: PactButtonProps) {
  const scale = useSharedValue(1);
  const pressed = useSharedValue(false);

  const tap = Gesture.Tap()
    .runOnJS(true)
    .enabled(!disabled && !loading)
    .onBegin(() => {
      pressed.value = true;
      scale.value = withSpring(0.97, springs.snappy);
    })
    .onFinalize(() => {
      pressed.value = false;
      scale.value = withSpring(1.0, springs.snappy);
    })
    .onEnd(() => {
      onPress();
    });

  const containerAnimatedStyle = useAnimatedStyle(() => {
    let bg = "transparent";
    let bc = "transparent";

    if (variant === "primary") {
      bg = pressed.value ? colors.emberDeep : colors.ember;
    } else if (variant === "secondary") {
      bg = pressed.value ? "rgba(196,97,58,0.16)" : colors.emberSurface;
      bc = pressed.value ? colors.ember : colors.emberBorder;
    } else if (variant === "ghost") {
      bg = pressed.value ? colors.stoneMid : "transparent";
      bc = colors.inkBorderMid;
    } else if (variant === "danger") {
      bg = pressed.value ? "rgba(196,65,58,0.06)" : "transparent";
      bc = pressed.value ? "rgba(196,65,58,0.4)" : "rgba(196,65,58,0.25)";
    }

    return {
      backgroundColor: bg,
      borderColor: bc,
      transform: [{ scale: scale.value }],
      opacity: disabled ? 0.35 : loading ? 0.8 : 1,
    };
  });

  const textAnimatedStyle = useAnimatedStyle(() => {
    if (variant === "text") {
      return { color: pressed.value ? colors.inkMid : colors.inkMuted };
    }
    if (variant === "primary") return { color: colors.white };
    if (variant === "secondary") return { color: colors.ember };
    if (variant === "ghost") return { color: colors.inkMid };
    return { color: colors.danger };
  });

  const isText = variant === "text";
  const hasBorder =
    variant === "secondary" || variant === "ghost" || variant === "danger";

  return (
    <GestureDetector gesture={tap}>
      <Animated.View
        style={[
          {
            alignItems: "center",
            justifyContent: "center",
            borderRadius: isText ? 0 : radius.md,
            height: isText ? undefined : HEIGHTS[variant][size],
            width: fullWidth ? "100%" : "auto",
            paddingHorizontal: isText ? spacing.xs : fullWidth ? 0 : spacing.xl,
            paddingVertical: isText ? spacing.sm : undefined,
            borderWidth: hasBorder ? 1.5 : 0,
          },
          containerAnimatedStyle,
        ]}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === "primary" ? colors.white : colors.ember}
          />
        ) : (
          <Animated.Text
            style={[
              isText ? typography.bodySm : typography.button,
              textAnimatedStyle,
              isText ? { textDecorationLine: "underline" } : undefined,
            ]}
          >
            {label}
          </Animated.Text>
        )}
      </Animated.View>
    </GestureDetector>
  );
}
