import React from 'react';
import { View, Text } from 'react-native';
import { colors } from '../../tokens/colours';
import { typography } from '../../tokens/typography';
import { spacing } from '../../tokens/spacing';
import { radius } from '../../tokens/radius';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
}

export default function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xxxl,
        paddingHorizontal: spacing.xl,
        backgroundColor: colors.cream,
        borderRadius: radius.xl,
        borderWidth: 1,
        borderColor: colors.inkBorder,
        gap: spacing.sm,
      }}
    >
      {icon ? (
        <Text style={{ fontSize: 36, marginBottom: spacing.sm }}>{icon}</Text>
      ) : null}
      <Text style={[typography.h3, { color: colors.ink, textAlign: 'center' }]}>
        {title}
      </Text>
      {description ? (
        <Text style={[typography.body, { color: colors.inkMuted, textAlign: 'center' }]}>
          {description}
        </Text>
      ) : null}
    </View>
  );
}
