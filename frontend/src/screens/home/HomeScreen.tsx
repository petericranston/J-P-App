import React, { useEffect, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, type DimensionValue } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

import { useHomeData, type InvitedPerson } from '../../hooks/useHomeData';
import { colors } from '../../tokens/colours';
import { typography } from '../../tokens/typography';
import { spacing } from '../../tokens/spacing';
import { radius } from '../../tokens/radius';
import { copy } from '../../tokens/copy';
import { durations } from '../../tokens/durations';
import { springs } from '../../tokens/springs';

import CrewHealthDots from '../../components/base/CrewHealthDots';
import EmptyState from '../../components/base/EmptyState';
import ProgressBar from '../../components/base/ProgressBar';
import PactButton from '../../components/base/PactButton';
import Avatar from '../../components/base/Avatar';
import AvatarStack from '../../components/composite/AvatarStack';
import CheckInCard from '../../components/composite/CheckInCard';

// ─── Greeting ─────────────────────────────────────────────────────────────────

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

function getGreeting(): { day: string; salutation: string } {
  const h = new Date().getHours();
  let salutation: string;
  if (h >= 5 && h < 12)      salutation = 'good morning.';
  else if (h >= 12 && h < 17) salutation = 'good afternoon.';
  else if (h >= 17 && h < 22) salutation = 'good evening.';
  else                         salutation = 'hey.';
  return { day: DAYS[new Date().getDay()], salutation };
}

// ─── Bell icon (matches design's hand-drawn stroke style) ────────────────────

function BellIcon({ size = 20, color = colors.ink }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Path
        d="M8 22 Q8 15 8.5 13 Q9.5 7 16 7 Q22.5 7 23.5 13 Q24 15 24 22 Z"
        stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none"
      />
      <Path d="M6 22 H26" stroke={color} strokeWidth={2} strokeLinecap="round" fill="none" />
      <Path
        d="M13.5 25 Q14 27 16 27 Q18 27 18.5 25"
        stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none"
      />
    </Svg>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonBlock({ width, height, br = radius.sm }: { width: DimensionValue; height: number; br?: number }) {
  return <View style={{ width, height, borderRadius: br, backgroundColor: colors.stoneMid }} />;
}

function LoadingSkeleton() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={{ flex: 1, padding: spacing.screen, gap: spacing.xl }}>
        <View style={styles.row}>
          <SkeletonBlock width="55%" height={26} />
          <SkeletonBlock width={22} height={22} br={radius.circle} />
        </View>
        <SkeletonBlock width="100%" height={100} br={radius.xl} />
        <SkeletonBlock width="100%" height={72}  br={radius.lg}  />
        <SkeletonBlock width="100%" height={52}  br={radius.lg}  />
        <SkeletonBlock width="100%" height={130} br={radius.lg}  />
        <SkeletonBlock width="100%" height={130} br={radius.lg}  />
      </View>
    </SafeAreaView>
  );
}

// ─── Dashed pulsing avatar (crew waiting strip) ───────────────────────────────

function DashedAvatar({ delay = 0, size = 30 }: { delay?: number; size?: number }) {
  const opacity = useSharedValue(0.35);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1,    { duration: 1200 }),
          withTiming(0.35, { duration: 1200 }),
        ),
        -1,
        false,
      ),
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={animStyle}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle
          cx={size / 2} cy={size / 2} r={size / 2 - 2}
          stroke="rgba(247,243,238,0.90)"
          strokeWidth={1.5}
          strokeDasharray="4 3"
          fill="none"
        />
      </Svg>
    </Animated.View>
  );
}

// ─── Ghost check-in row ───────────────────────────────────────────────────────

function GhostRow({ text, divider }: { text: string; divider?: boolean }) {
  return (
    <View
      style={[
        { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, opacity: 0.6 },
        divider && { paddingBottom: spacing.base, borderBottomWidth: 1, borderBottomColor: colors.inkBorder, marginBottom: spacing.base },
      ]}
    >
      {/* Dashed avatar via SVG */}
      <Svg width={32} height={32} viewBox="0 0 32 32">
        <Circle cx={16} cy={16} r={14} stroke="rgba(26,18,10,0.32)" strokeWidth={1.5} strokeDasharray="4 3" fill="none" />
      </Svg>
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={[typography.eyebrow, { color: colors.inkMuted, fontSize: 9 }]}>Soon</Text>
        <Text style={[typography.bodySm, { color: colors.inkMid, fontStyle: 'italic' }]}>{text}</Text>
      </View>
    </View>
  );
}

// ─── Status pill ──────────────────────────────────────────────────────────────

const PILL: Record<InvitedPerson['status'], { bg: string; color: string }> = {
  Joined:  { bg: 'rgba(74,103,65,0.16)',  color: '#3A5232' },
  Seen:    { bg: 'rgba(212,149,74,0.22)', color: '#8B5A1F' },
  Invited: { bg: 'rgba(26,18,10,0.08)',   color: colors.inkMid },
};

function StatusPill({ status }: { status: InvitedPerson['status'] }) {
  const s = PILL[status];
  return (
    <View style={{ paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.circle, backgroundColor: s.bg }}>
      <Text style={[typography.eyebrow, { color: s.color, fontSize: 9, letterSpacing: 1.6 }]}>{status}</Text>
    </View>
  );
}

// ─── Invite row ───────────────────────────────────────────────────────────────

function InviteRow({ person, last }: { person: InvitedPerson; last: boolean }) {
  return (
    <View style={[{ paddingVertical: spacing.md }, !last && { borderBottomWidth: 1, borderBottomColor: colors.inkBorder }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <Avatar
          displayName={person.name}
          avatarColor={person.avatarColor}
          size="sm"
        />
        <Text
          style={[typography.title, {
            flex: 1,
            color: person.status === 'Joined' ? colors.ink : colors.inkMid,
          }]}
        >
          {person.name}
        </Text>
        <StatusPill status={person.status} />
      </View>
      {person.status === 'Seen' && (
        <Pressable style={{ marginLeft: 44, marginTop: spacing.xs }}>
          <Text style={[typography.bodySm, { color: colors.ember, textDecorationLine: 'underline' }]}>
            Remind them
          </Text>
        </Pressable>
      )}
    </View>
  );
}

// ─── Streak hero card ─────────────────────────────────────────────────────────
// Horizontal layout matching the design: large number left, label + body right.
// Accepts variant 'ember-border' for the Active state bordered card.

interface StreakHeroProps {
  current: number;
  label: string;
  description: string;
  emberBorder?: boolean;
}

function StreakHeroCard({ current, label, description, emberBorder }: StreakHeroProps) {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(120, withSpring(1, springs.bouncy));
    scale.value  = withDelay(120, withSpring(1, springs.bouncy));
  }, []);

  const animNumStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={[styles.whiteCard, emberBorder && styles.cardEmberBorder]}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xl }}>
        <Animated.Text
          style={[
            {
              fontFamily: 'Syne_800ExtraBold',
              fontSize: 68,
              lineHeight: 62,
              letterSpacing: -2,
              color: colors.ember,
            },
            animNumStyle,
          ]}
        >
          {current.toString().padStart(2, '0')}
        </Animated.Text>
        <View style={{ flex: 1, paddingTop: spacing.sm, gap: spacing.xs }}>
          <Text style={[typography.eyebrow, { color: colors.ember, fontSize: 10 }]}>{label}</Text>
          <Text style={[typography.bodySm, { color: colors.inkMid, fontStyle: 'italic', lineHeight: 20 }]}>
            {description}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ─── HomeScreen ───────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const data       = useHomeData();
  const greeting   = useMemo(getGreeting, []);

  if (data.loading) return <LoadingSkeleton />;

  const isWaiting = !data.hasCrewJoined;
  const isPending = data.hasCrewJoined && !data.todayCheckedIn;
  const isActive  = data.hasCrewJoined && data.todayCheckedIn;

  const feedSection = (
    <View style={{ gap: spacing.md }}>
      <Text style={[typography.eyebrow, { color: colors.inkMuted, fontSize: 10 }]}>Crew today</Text>
      {data.feed.length === 0 ? (
        <EmptyState
          title={copy.beTheOne}
          description="No check-ins yet. Show your crew how it's done."
        />
      ) : (
        data.feed.map((item) => (
          <CheckInCard
            key={item.id}
            user={item.user}
            format={item.format}
            noteText={item.noteText}
            photoUrl={item.photoUrl}
            moodEffort={item.moodEffort}
            moodFeeling={item.moodFeeling}
            reactions={item.reactions}
            checkedInAt={item.checkedInAt}
          />
        ))
      )}
    </View>
  );

  const crewCard = (
    <View style={styles.whiteCard}>
      <View style={styles.rowBetween}>
        <Text style={[typography.eyebrow, { color: colors.inkMuted, fontSize: 10 }]}>{data.crew.name}</Text>
        <CrewHealthDots count={data.crew.healthDots} />
      </View>
      <AvatarStack members={data.crew.members} size="md" />
    </View>
  );

  const sprintCard = (
    <View style={styles.whiteCard}>
      <View style={styles.rowBetween}>
        <Text style={[typography.eyebrow, { color: colors.inkMuted, fontSize: 10 }]}>Sprint</Text>
        <Text style={[typography.label, { color: colors.inkMid }]}>
          Day {data.sprint.dayCurrent} of {data.sprint.dayTotal}
        </Text>
      </View>
      <ProgressBar progress={data.sprint.progress} variant="sprint" height={5} />
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* ── Header ──────────────────────────────────────────────────────── */}
          <Animated.View entering={FadeIn.duration(durations.base)} style={styles.row}>
            <Text style={[styles.greetingText]}>
              {greeting.day},{' '}
              <Text style={{ color: colors.ember }}>{greeting.salutation}</Text>
            </Text>
            <BellIcon size={20} color={colors.ink} />
          </Animated.View>

          {/* ── WAITING STATE ────────────────────────────────────────────────── */}
          {isWaiting && (
            <>
              <Animated.View entering={FadeInDown.delay(80).duration(durations.base)}>
                <StreakHeroCard
                  current={data.streak.current}
                  label={copy.streakHeroSolo}
                  description="You showed up this morning. Crew is on the way."
                />
              </Animated.View>

              {/* Crew waiting strip — dark ink card */}
              <Animated.View entering={FadeInDown.delay(150).duration(durations.base)} style={styles.crewWaitStrip}>
                <View style={styles.crewWaitGlow} />
                <View style={{ flexDirection: 'row', zIndex: 1 }}>
                  {[0, 1, 2].map((i) => (
                    <View key={i} style={{ marginLeft: i === 0 ? 0 : -8 }}>
                      <DashedAvatar delay={i * 300} size={30} />
                    </View>
                  ))}
                </View>
                <View style={{ flex: 1, zIndex: 1 }}>
                  <Text style={[typography.title, { color: colors.stone }]}>
                    {data.invitedPeople.filter((p) => p.status === 'Joined').length} of{' '}
                    {data.invitedPeople.length} people joined
                  </Text>
                  <Text style={[typography.eyebrow, { color: 'rgba(247,243,238,0.45)', marginTop: 3, fontSize: 9 }]}>
                    Sent yesterday
                  </Text>
                </View>
                <Pressable style={{ zIndex: 1 }}>
                  <Text style={[typography.button, { color: colors.emberLight, fontSize: 13 }]}>
                    Remind them →
                  </Text>
                </Pressable>
              </Animated.View>

              {/* Discovery banner */}
              <Animated.View entering={FadeInDown.delay(210).duration(durations.base)} style={styles.discoveryBanner}>
                <Text style={[typography.bodySm, { color: colors.emberDeep, flex: 1, fontStyle: 'italic', lineHeight: 20 }]}>
                  Not sure who to invite?{' '}
                  <Text style={{ color: colors.ember }}>Find a public group while you wait.</Text>
                </Text>
              </Animated.View>

              {/* Invite status */}
              <Animated.View entering={FadeInDown.delay(270).duration(durations.base)}>
                <Text style={[typography.eyebrow, { color: colors.inkMuted, fontSize: 10, marginBottom: spacing.sm }]}>
                  Invites ·{' '}
                  {data.invitedPeople.filter((p) => p.status === 'Joined').length} of{' '}
                  {data.invitedPeople.length} joined
                </Text>
                <View style={styles.whiteCard}>
                  {data.invitedPeople.map((p, i) => (
                    <InviteRow key={p.id} person={p} last={i === data.invitedPeople.length - 1} />
                  ))}
                </View>
              </Animated.View>

              {/* Ghost feed */}
              <Animated.View entering={FadeInDown.delay(330).duration(durations.base)}>
                <Text style={[typography.eyebrow, { color: colors.inkMuted, fontSize: 10, marginBottom: spacing.sm }]}>
                  Your crew · Soon
                </Text>
                <View style={[styles.whiteCard, styles.ghostBorder]}>
                  {/* Top label sits on the border */}
                  <View style={styles.ghostLabelWrap}>
                    <Text style={[typography.eyebrow, { color: colors.ember, fontSize: 8, letterSpacing: 2 }]}>
                      What your crew will look like
                    </Text>
                  </View>
                  <GhostRow text="Your first crewmate's check-in will appear here." divider />
                  <GhostRow text="React, encourage, keep going together." />
                </View>
              </Animated.View>

              {/* Keep going CTA */}
              <Animated.View entering={FadeInDown.delay(390).duration(durations.base)} style={{ gap: spacing.sm }}>
                <PactButton
                  label="Keep going."
                  onPress={() => navigation.navigate('CheckInPrompt')}
                  variant="primary"
                />
                <Text style={[typography.bodySm, { color: colors.inkMuted, textAlign: 'center', fontStyle: 'italic' }]}>
                  If no one joins in 7 days, we'll find you a crew.
                </Text>
              </Animated.View>
            </>
          )}

          {/* ── PENDING STATE ────────────────────────────────────────────────── */}
          {isPending && (
            <>
              <Animated.View entering={FadeInDown.delay(80).duration(durations.base)} style={styles.ctaCard}>
                <Text style={[typography.eyebrow, { color: colors.ember, fontSize: 10 }]}>Today</Text>
                <Text style={[typography.h2, { color: colors.ink }]}>{copy.crewWaiting}</Text>
                <PactButton
                  label={copy.beTheOne}
                  onPress={() => navigation.navigate('CheckInPrompt')}
                  variant="primary"
                />
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(160).duration(durations.base)}>
                <StreakHeroCard
                  current={data.streak.current}
                  label="day streak"
                  description={`Best: ${data.streak.longest} days in a row.`}
                />
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(220).duration(durations.base)}>
                {crewCard}
              </Animated.View>
              <Animated.View entering={FadeInDown.delay(280).duration(durations.base)}>
                {sprintCard}
              </Animated.View>
              <Animated.View entering={FadeInDown.delay(340).duration(durations.base)}>
                {feedSection}
              </Animated.View>
            </>
          )}

          {/* ── ACTIVE STATE ─────────────────────────────────────────────────── */}
          {isActive && (
            <>
              <Animated.View entering={FadeInDown.delay(80).duration(durations.base)}>
                <StreakHeroCard
                  current={data.streak.current}
                  label="day streak"
                  description={`Longest: ${data.streak.longest}. Keep it going.`}
                  emberBorder
                />
              </Animated.View>
              <Animated.View entering={FadeInDown.delay(160).duration(durations.base)}>
                {crewCard}
              </Animated.View>
              <Animated.View entering={FadeInDown.delay(220).duration(durations.base)}>
                {sprintCard}
              </Animated.View>
              <Animated.View entering={FadeInDown.delay(280).duration(durations.base)}>
                {feedSection}
              </Animated.View>
            </>
          )}

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  greetingText: {
    fontFamily: 'Syne_700Bold',
    fontSize: 22,
    letterSpacing: -0.3,
    color: colors.ink,
    flex: 1,
    marginRight: spacing.md,
  },
  // ── Card base ──
  whiteCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.inkBorder,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 2,
  },
  cardEmberBorder: {
    borderColor: colors.emberBorder,
    borderWidth: 1.5,
  },
  ctaCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1.5,
    borderColor: colors.emberBorder,
    gap: spacing.md,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 2,
  },
  // ── Waiting state ──
  crewWaitStrip: {
    backgroundColor: colors.ink,
    borderRadius: radius.lg,
    padding: spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    overflow: 'hidden',
    position: 'relative',
  },
  crewWaitGlow: {
    position: 'absolute',
    right: -30,
    top: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(196,97,58,0.28)',
  },
  discoveryBanner: {
    backgroundColor: colors.emberSurface,
    borderRadius: radius.md,
    padding: spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ghostBorder: {
    borderColor: 'rgba(26,18,10,0.14)',
    borderWidth: 1,
    position: 'relative',
  },
  ghostLabelWrap: {
    position: 'absolute',
    top: -9,
    left: spacing.base,
    backgroundColor: colors.stone,
    paddingHorizontal: spacing.sm,
  },
});
