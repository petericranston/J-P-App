import React from 'react';
import { View, Text, Image } from 'react-native';
import { colors } from '../../tokens/colours';
import { radius } from '../../tokens/radius';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  displayName: string;
  avatarUrl?: string | null;
  avatarColor?: string;
  size?: AvatarSize;
  isCaptain?: boolean;
  borderColor?: string;
}

const DIMS: Record<AvatarSize, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
};

const FONT_SIZES: Record<AvatarSize, number> = {
  xs: 10,
  sm: 13,
  md: 16,
  lg: 20,
  xl: 26,
};

export default function Avatar({
  displayName,
  avatarUrl,
  avatarColor = colors.ember,
  size = 'md',
  isCaptain = false,
  borderColor,
}: AvatarProps) {
  const dim = DIMS[size];
  const fontSize = FONT_SIZES[size];
  const initial = displayName.trim().charAt(0).toUpperCase();

  return (
    <View style={{ width: dim, height: dim }}>
      <View
        style={{
          width: dim,
          height: dim,
          borderRadius: radius.circle,
          backgroundColor: avatarColor,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: borderColor ? 2 : 0,
          borderColor: borderColor ?? 'transparent',
          overflow: 'hidden',
        }}
      >
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={{ width: dim, height: dim }}
            resizeMode="cover"
          />
        ) : (
          <Text
            style={{
              fontFamily: 'DMSans_500Medium',
              fontSize,
              color: colors.white,
              lineHeight: fontSize * 1.4,
            }}
          >
            {initial}
          </Text>
        )}
      </View>

      {isCaptain && (
        <View
          style={{
            position: 'absolute',
            bottom: -1,
            right: -1,
            width: Math.round(dim * 0.38),
            height: Math.round(dim * 0.38),
            borderRadius: radius.circle,
            backgroundColor: colors.ember,
            borderWidth: 1.5,
            borderColor: colors.stone,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: Math.round(dim * 0.2), lineHeight: Math.round(dim * 0.26) }}>
            ⚡
          </Text>
        </View>
      )}
    </View>
  );
}
