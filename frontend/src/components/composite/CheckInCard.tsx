import React from 'react';
import { View, Text, Image } from 'react-native';
import Avatar from '../base/Avatar';
import ReactionBar from './ReactionBar';
import { colors } from '../../tokens/colours';
import { typography } from '../../tokens/typography';
import { spacing } from '../../tokens/spacing';
import { radius } from '../../tokens/radius';

type CheckInFormat = 'photo' | 'note' | 'mood';

interface CheckInCardProps {
  user: { displayName: string; avatarColor: string; avatarUrl: string | null };
  format: CheckInFormat;
  noteText?: string | null;
  photoUrl?: string | null;
  moodEffort?: number | null;
  moodFeeling?: number | null;
  reactions: { emoji: string; count: number }[];
  checkedInAt: string;
  onReact?: (emoji: string) => void;
}

const FORMAT_LABELS: Record<CheckInFormat, string> = {
  note: 'Note',
  photo: 'Photo',
  mood: 'Mood',
};

const EFFORT_LABELS = ['', 'Low', 'Easy', 'Solid', 'Strong', 'Max'];
const FEELING_LABELS = ['', 'Rough', 'Meh', 'Okay', 'Good', 'Great'];

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.floor(diffHr / 24)}d ago`;
}

function MoodBars({
  value,
  color,
  label,
}: {
  value: number;
  color: string;
  label: string;
}) {
  return (
    <View style={{ flex: 1, gap: spacing.xs }}>
      <Text style={[typography.eyebrow, { color: colors.inkMuted }]}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
        {Array.from({ length: 5 }, (_, i) => (
          <View
            key={i}
            style={{
              flex: 1,
              height: 5,
              borderRadius: radius.circle,
              backgroundColor: i < value ? color : colors.stoneMid,
            }}
          />
        ))}
        <Text
          style={[typography.bodySm, { color: colors.inkMid, minWidth: 36 }]}
        >
          {value === 1
            ? label === 'Effort'
              ? EFFORT_LABELS[value]
              : FEELING_LABELS[value]
            : label === 'Effort'
              ? EFFORT_LABELS[value]
              : FEELING_LABELS[value]}
        </Text>
      </View>
    </View>
  );
}

export default function CheckInCard({
  user,
  format,
  noteText,
  photoUrl,
  moodEffort,
  moodFeeling,
  reactions,
  checkedInAt,
  onReact,
}: CheckInCardProps) {
  return (
    <View
      style={{
        backgroundColor: colors.cream,
        borderRadius: radius.lg,
        padding: spacing.base,
        borderWidth: 1,
        borderColor: colors.inkBorder,
        gap: spacing.md,
      }}
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <Avatar
          displayName={user.displayName}
          avatarUrl={user.avatarUrl}
          avatarColor={user.avatarColor}
          size="sm"
        />
        <View style={{ flex: 1 }}>
          <Text style={[typography.title, { color: colors.ink }]}>
            {user.displayName}
          </Text>
          <Text style={[typography.caption, { color: colors.inkMuted }]}>
            {formatRelativeTime(checkedInAt)}
          </Text>
        </View>
        <View
          style={{
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,
            borderRadius: radius.sm,
            backgroundColor: colors.emberSurface,
          }}
        >
          <Text style={[typography.eyebrow, { color: colors.ember }]}>
            {FORMAT_LABELS[format]}
          </Text>
        </View>
      </View>

      {/* Note content */}
      {format === 'note' && noteText ? (
        <Text style={[typography.bodyLg, { color: colors.ink }]}>{noteText}</Text>
      ) : null}

      {/* Photo content */}
      {format === 'photo' && photoUrl ? (
        <View style={{ borderRadius: radius.md, overflow: 'hidden' }}>
          <Image
            source={{ uri: photoUrl }}
            style={{ width: '100%', height: 200 }}
            resizeMode="cover"
          />
        </View>
      ) : null}

      {/* Mood content */}
      {format === 'mood' && moodEffort != null && moodFeeling != null ? (
        <View style={{ flexDirection: 'row', gap: spacing.base }}>
          <MoodBars value={moodEffort} color={colors.ember} label="Effort" />
          <MoodBars value={moodFeeling} color={colors.sage} label="Feeling" />
        </View>
      ) : null}

      {/* Reactions */}
      {reactions.length > 0 ? (
        <ReactionBar reactions={reactions} onReact={onReact} />
      ) : null}
    </View>
  );
}
