import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors } from '../../tokens/colours';
import { typography } from '../../tokens/typography';
import { spacing } from '../../tokens/spacing';

export type TabId = 'home' | 'partner' | 'checkin' | 'profile';

interface BottomNavProps {
  active?: TabId;
  onPress?: (tab: TabId) => void;
}

// ─── Hand-drawn SVG icons (matching design's stroke style) ───────────────────

function HomeIconSvg({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 32 32">
      <Path d="M5 14.5 L16 5.5 L27 14.5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d="M7.5 13 V25.5 Q7.5 26.5 8.5 26.5 H23.5 Q24.5 26.5 24.5 25.5 V13" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d="M13.5 26.5 V19.5 Q13.5 18.5 14.5 18.5 H17.5 Q18.5 18.5 18.5 19.5 V26.5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

function CrewIconSvg({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 32 32">
      <Circle cx={11.5} cy={11} r={4} stroke={color} strokeWidth={2} fill="none" />
      <Circle cx={20.5} cy={11} r={4} stroke={color} strokeWidth={2} fill="none" />
      <Path d="M4.5 26 Q4.5 17 11.5 17 Q15 17 16 21" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d="M27.5 26 Q27.5 17 20.5 17 Q17 17 16 21" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d="M14 8.5 Q16 7.5 18 8.5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

function CheckinIconSvg({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 32 32">
      <Circle cx={16} cy={16} r={11.5} stroke={color} strokeWidth={2} fill="none" />
      <Path d="M9 17.5 Q12 16 14 20 Q18 11 23 8.5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

function ProfileIconSvg({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 32 32">
      <Circle cx={16} cy={11} r={5} stroke={color} strokeWidth={2} fill="none" />
      <Path d="M5 27 Q5 17.5 16 17.5 Q27 17.5 27 27" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

const TABS: { id: TabId; label: string; Icon: React.FC<{ color: string }> }[] = [
  { id: 'home',    label: 'Home',    Icon: HomeIconSvg     },
  { id: 'partner', label: 'Partner', Icon: CrewIconSvg     },
  { id: 'checkin', label: 'Check-in', Icon: CheckinIconSvg },
  { id: 'profile', label: 'Profile', Icon: ProfileIconSvg  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function BottomNav({ active = 'home', onPress }: BottomNavProps) {
  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const isActive = tab.id === active;
        const iconColor = isActive ? colors.ember : colors.inkMid;
        const labelColor = isActive ? colors.ember : colors.inkMuted;
        return (
          <Pressable
            key={tab.id}
            onPress={() => onPress?.(tab.id)}
            style={styles.tab}
          >
            <tab.Icon color={iconColor} />
            <Text style={[typography.eyebrow, { color: labelColor, fontSize: 9, letterSpacing: 1.6 }]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.inkBorder,
    backgroundColor: colors.stone,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
});
