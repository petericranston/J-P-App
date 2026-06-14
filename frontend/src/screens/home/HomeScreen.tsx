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
        <Section label="user  ·  GET /api/profile">
          <Field name="displayName" value={data.user.displayName} />
          <Field name="avatarUrl"   value={data.user.avatarUrl} />
          <Field name="avatarColor" value={data.user.avatarColor} />
        </Section>

        {/* ── Pact ── */}
        <Section label="pact  ·  GET /api/pacts">
          {data.pact ? (
            <>
              <Field name="id"          value={data.pact.id} />
              <Field name="title"       value={data.pact.title} />
              <Field name="lifeArea"    value={data.pact.lifeArea} />
              <Field name="frequency"   value={data.pact.frequency} />
              <Field name="sprintWeeks" value={data.pact.sprintWeeks} />
              <Field name="privacy"     value={data.pact.privacy} />
              <Field name="status"      value={data.pact.status} />
              <Field name="sprintStart" value={data.pact.sprintStart} />
              <Field name="sprintEnd"   value={data.pact.sprintEnd} />
            </>
          ) : (
            <Text style={styles.emptyNote}>no pact yet</Text>
          )}
        </Section>

        {/* ── Streak ── */}
        <Section label="streak  ·  GET /api/streaks?pact_id=">
          <Field name="current"        value={data.streak.current} />
          <Field name="longest"        value={data.streak.longest} />
          <Field name="shieldAvailable" value={data.streak.shieldAvailable} />
          <Field name="shieldUsedOn"   value={data.streak.shieldUsedOn} />
        </Section>

        {/* ── State flags ── */}
        <Section label="state flags  ·  derived">
          <Field name="hasPartnerJoined" value={data.hasPartnerJoined} />
          <Field name="todayCheckedIn"   value={data.todayCheckedIn} />
        </Section>

        {/* ── Sprint ── */}
        <Section label="sprint  ·  GET /api/sprints?pact_id=">
          <Field name="dayCurrent" value={data.sprint.dayCurrent} />
          <Field name="dayTotal"   value={data.sprint.dayTotal} />
          <Field name="progress"   value={data.sprint.progress} />
        </Section>

        {/* ── Partner ── */}
        <Section label="partner  ·  from pact.partner_id → GET /api/profile">
          {data.partner ? (
            <>
              <Field name="displayName"    value={data.partner.displayName} />
              <Field name="avatarUrl"      value={data.partner.avatarUrl} />
              <Field name="avatarColor"    value={data.partner.avatarColor} />
              <Field name="checkedInToday" value={data.partner.checkedInToday} />
            </>
          ) : (
            <Text style={styles.emptyNote}>no partner yet</Text>
          )}
        </Section>

        {/* ── Invite ── [visible when !hasPartnerJoined] */}
        <Section label="invite  ·  GET /api/invites?pact_id=  [when !hasPartnerJoined]">
          {data.invite ? (
            <>
              <Field name="token"  value={data.invite.token} />
              <Field name="status" value={data.invite.status} />
            </>
          ) : (
            <Text style={styles.emptyNote}>no invite sent</Text>
          )}
        </Section>

        {/* ── Feed ── */}
        <Section label="feed  ·  GET /api/checkins?pact_id=  (own check-ins, last 7 days)">
          {data.feed.length === 0 ? (
            <Text style={styles.emptyNote}>no check-ins yet</Text>
          ) : (
            data.feed.map((item) => (
              <View key={item.id} style={styles.listItem}>
                <Text style={styles.listItemTitle}>{item.format}  ·  {item.checkedInAt}</Text>
                <Field name="noteText"    value={item.noteText} />
                <Field name="photoUrl"    value={item.photoUrl} />
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
  section: {
    backgroundColor: colors.stoneMid,
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
  field: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  fieldName: {
    ...typography.label,
    color: colors.inkMid,
    minWidth: 120,
  },
  fieldValue: {
    ...typography.bodySm,
    color: colors.ink,
    flex: 1,
    textAlign: 'right',
  },
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
