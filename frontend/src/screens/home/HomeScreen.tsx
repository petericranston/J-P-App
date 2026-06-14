import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHomeData } from '../../hooks/useHomeData';
import { colors } from '../../tokens/colours';
import { spacing } from '../../tokens/spacing';
import { radius } from '../../tokens/radius';
import { typography } from '../../tokens/typography';

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      {children}
    </View>
  );
}

function Field({ name, value }: { name: string; value: string | number | boolean | null | undefined }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldName}>{name}</Text>
      <Text style={styles.fieldValue}>{value === null || value === undefined ? '—' : String(value)}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const data = useHomeData();

  if (data.loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.center}>
          <Text style={styles.loadingText}>Loading…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <Text style={styles.screenTitle}>Home  <Text style={styles.wireframeTag}>[WIREFRAME]</Text></Text>

        {/* ── User ── */}
        <Section label="user  ·  GET /api/user">
          <Field name="displayName" value={data.user.displayName} />
          <Field name="avatarUrl"   value={data.user.avatarUrl} />
          <Field name="avatarColor" value={data.user.avatarColor} />
        </Section>

        {/* ── Goal ── */}
        <Section label="goal  ·  GET /api/goal">
          <Field name="title"     value={data.goal.title} />
          <Field name="frequency" value={data.goal.frequency} />
        </Section>

        {/* ── Streak ── */}
        <Section label="streak  ·  GET /api/streak">
          <Field name="current" value={data.streak.current} />
          <Field name="longest" value={data.streak.longest} />
          <Field name="state"   value={data.streak.state} />
        </Section>

        {/* ── State flags ── */}
        <Section label="state flags  ·  derived from backend">
          <Field name="hasCrewJoined"  value={data.hasCrewJoined} />
          <Field name="todayCheckedIn" value={data.todayCheckedIn} />
        </Section>

        {/* ── Sprint ── */}
        <Section label="sprint  ·  GET /api/sprint">
          <Field name="dayCurrent" value={data.sprint.dayCurrent} />
          <Field name="dayTotal"   value={data.sprint.dayTotal} />
          <Field name="progress"   value={data.sprint.progress} />
        </Section>

        {/* ── Crew ── */}
        <Section label="crew  ·  GET /api/crew">
          <Field name="name"       value={data.crew.name} />
          <Field name="healthDots" value={data.crew.healthDots} />
          {data.crew.members.map((m) => (
            <View key={m.id} style={styles.listItem}>
              <Text style={styles.listItemTitle}>{m.displayName} ({m.role})</Text>
              <Field name="checkedInToday" value={m.checkedInToday} />
              <Field name="avatarColor"    value={m.avatarColor} />
            </View>
          ))}
        </Section>

        {/* ── Invites (waiting state) ── */}
        <Section label="invites  ·  GET /api/invites  [visible when !hasCrewJoined]">
          {data.invitedPeople.length === 0 ? (
            <Text style={styles.emptyNote}>no invites</Text>
          ) : (
            data.invitedPeople.map((p) => (
              <View key={p.id} style={styles.listItem}>
                <Text style={styles.listItemTitle}>{p.name}</Text>
                <Field name="status"      value={p.status} />
                <Field name="avatarColor" value={p.avatarColor} />
              </View>
            ))
          )}
        </Section>

        {/* ── Feed ── */}
        <Section label="feed  ·  GET /api/feed">
          {data.feed.length === 0 ? (
            <Text style={styles.emptyNote}>no check-ins yet</Text>
          ) : (
            data.feed.map((item) => (
              <View key={item.id} style={styles.listItem}>
                <Text style={styles.listItemTitle}>{item.user.displayName} · {item.format}</Text>
                <Field name="noteText"    value={item.noteText} />
                <Field name="photoUrl"    value={item.photoUrl} />
                <Field name="moodEffort"  value={item.moodEffort} />
                <Field name="moodFeeling" value={item.moodFeeling} />
                <Field name="checkedInAt" value={item.checkedInAt} />
                <Field name="reactions"   value={item.reactions.map((r) => `${r.emoji}×${r.count}`).join('  ')} />
              </View>
            ))
          )}
        </Section>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.stone,
  },
  scroll: {
    padding: spacing.screen,
    paddingBottom: spacing.xl,
    gap: spacing.base,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...typography.bodySm,
    color: colors.inkMid,
  },
  screenTitle: {
    ...typography.h2,
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  wireframeTag: {
    ...typography.eyebrow,
    color: colors.inkMuted,
    fontSize: 10,
  },
  // ── Section ──
  section: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.inkBorder,
    gap: spacing.xs,
  },
  sectionLabel: {
    ...typography.eyebrow,
    color: colors.ember,
    fontSize: 10,
    marginBottom: spacing.xs,
  },
  // ── Field row ──
  field: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  fieldName: {
    ...typography.label,
    color: colors.inkMid,
    minWidth: 110,
  },
  fieldValue: {
    ...typography.bodySm,
    color: colors.ink,
    flex: 1,
    textAlign: 'right',
  },
  // ── Nested list item ──
  listItem: {
    borderTopWidth: 1,
    borderTopColor: colors.inkBorder,
    paddingTop: spacing.xs,
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  listItemTitle: {
    ...typography.label,
    color: colors.ink,
    marginBottom: 2,
  },
  emptyNote: {
    ...typography.bodySm,
    color: colors.inkMuted,
    fontStyle: 'italic',
  },
});
