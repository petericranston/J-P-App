import React from 'react';
import { View, Text } from 'react-native';
import Avatar, { AvatarSize } from '../base/Avatar';
import { colors } from '../../tokens/colours';
import { typography } from '../../tokens/typography';
import { radius } from '../../tokens/radius';

interface StackMember {
  id: string;
  displayName: string;
  avatarUrl?: string | null;
  avatarColor?: string;
  role?: 'member' | 'captain';
}

interface AvatarStackProps {
  members: StackMember[];
  size?: AvatarSize;
  maxShown?: number;
}

const DIMS: Record<AvatarSize, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
};

export default function AvatarStack({
  members,
  size = 'sm',
  maxShown = 5,
}: AvatarStackProps) {
  const shown = members.slice(0, maxShown);
  const overflow = members.length - shown.length;
  const dim = DIMS[size];
  const overlap = Math.round(dim * 0.3);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {shown.map((member, i) => (
        <View
          key={member.id}
          style={{
            marginLeft: i === 0 ? 0 : -overlap,
            zIndex: shown.length - i,
          }}
        >
          <Avatar
            displayName={member.displayName}
            avatarUrl={member.avatarUrl}
            avatarColor={member.avatarColor}
            size={size}
            isCaptain={member.role === 'captain'}
            borderColor={colors.stone}
          />
        </View>
      ))}

      {overflow > 0 && (
        <View
          style={{
            marginLeft: -overlap,
            width: dim,
            height: dim,
            borderRadius: radius.circle,
            backgroundColor: colors.stoneMid,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            borderColor: colors.stone,
            zIndex: 0,
          }}
        >
          <Text style={[typography.label, { color: colors.inkMid }]}>
            +{overflow}
          </Text>
        </View>
      )}
    </View>
  );
}
