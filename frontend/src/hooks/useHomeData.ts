export type CheckInFormat = 'photo' | 'note';
export type PactStatus = 'waiting' | 'active' | 'completed' | 'archived';
export type InviteStatus = 'sent' | 'seen' | 'joined';

// ─── Types ────────────────────────────────────────────────────────────────────
// These mirror the shape the backend returns.
// Swap the stub below for real API calls when wiring begins.

export interface HomeUser {
  displayName: string;
  avatarUrl: string | null;
  avatarColor: string;
}

export interface HomePact {
  id: string;
  title: string;
  lifeArea: string;
  frequency: 'daily' | 'weekly';
  sprintWeeks: number;
  privacy: 'full' | 'streak_only';
  status: PactStatus;
  sprintStart: string;
  sprintEnd: string;
}

export interface HomePartner {
  displayName: string;
  avatarUrl: string | null;
  avatarColor: string;
  checkedInToday: boolean;
}

export interface HomeInvite {
  token: string;
  status: InviteStatus;
}

export interface HomeStreak {
  current: number;
  longest: number;
  shieldAvailable: boolean;
  shieldUsedOn: string | null;
}

export interface FeedItem {
  id: string;
  format: CheckInFormat;
  noteText: string | null;
  photoUrl: string | null;
  checkedInAt: string;
  reactions: { emoji: string; count: number }[];
}

export interface HomeData {
  loading: boolean;
  user: HomeUser;
  pact: HomePact | null;
  streak: HomeStreak;
  partner: HomePartner | null;  // null = no partner yet → Waiting state
  invite: HomeInvite | null;    // null = no invite sent
  hasPartnerJoined: boolean;    // false → Waiting state
  todayCheckedIn: boolean;      // false (+ hasPartnerJoined) → Pending state
  sprint: { dayCurrent: number; dayTotal: number; progress: number };
  feed: FeedItem[];             // owner's own check-ins, last 7 days
}

// ─── Stub ─────────────────────────────────────────────────────────────────────
// Replace with real API calls when backend is wired.
// Toggle hasPartnerJoined / todayCheckedIn to preview the three Home states:
//   hasPartnerJoined=false              → Waiting
//   hasPartnerJoined=true, todayCheckedIn=false  → Pending
//   hasPartnerJoined=true, todayCheckedIn=true   → Active

const STUB: HomeData = {
  loading: false,
  user: { displayName: 'User Name', avatarUrl: null, avatarColor: '#C4613A' },
  pact: {
    id: 'stub-pact-id',
    title: 'Pact Title',
    lifeArea: 'health',
    frequency: 'daily',
    sprintWeeks: 4,
    privacy: 'full',
    status: 'active',
    sprintStart: '2026-06-14',
    sprintEnd: '2026-07-12',
  },
  streak: { current: 0, longest: 0, shieldAvailable: true, shieldUsedOn: null },
  partner: null,
  invite: null,
  hasPartnerJoined: false,
  todayCheckedIn: false,
  sprint: { dayCurrent: 1, dayTotal: 28, progress: 0 },
  feed: [],
};

export function useHomeData(): HomeData {
  return STUB;
}
