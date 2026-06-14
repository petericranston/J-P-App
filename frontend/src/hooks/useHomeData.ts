export type StreakState = 'active' | 'shield' | 'broken';
export type CheckInFormat = 'photo' | 'note' | 'mood';

// ─── Types ────────────────────────────────────────────────────────────────────
// These mirror the shape the backend will return.
// Swap the mock below for real API calls when the backend is ready.

export interface HomeUser {
  displayName: string;
  avatarUrl: string | null;
  avatarColor: string;
}

export interface HomeMember {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  avatarColor: string;
  role: 'member' | 'captain';
  checkedInToday: boolean;
}

export interface InvitedPerson {
  id: string;
  name: string;
  initial: string;
  avatarColor: string;
  status: 'Invited' | 'Seen' | 'Joined';
}

export interface FeedItem {
  id: string;
  user: { displayName: string; avatarColor: string; avatarUrl: string | null };
  format: CheckInFormat;
  noteText: string | null;
  photoUrl: string | null;
  moodEffort: number | null;   // 1–5
  moodFeeling: number | null;  // 1–5
  reactions: { emoji: string; count: number }[];
  checkedInAt: string; // ISO string
}

export interface HomeData {
  loading: boolean;
  user: HomeUser;
  goal: { title: string; frequency: string };
  streak: { current: number; longest: number; state: StreakState };
  hasCrewJoined: boolean;  // false → waiting state; true → pending/active
  todayCheckedIn: boolean; // false → pending;       true → active
  crew: {
    name: string;
    healthDots: number; // 0–5
    members: HomeMember[];
  };
  invitedPeople: InvitedPerson[];
  sprint: { dayCurrent: number; dayTotal: number; progress: number }; // progress 0–1
  feed: FeedItem[];
}

// ─── Stub ─────────────────────────────────────────────────────────────────────
// Replace this with real API / Supabase calls.
// Flip hasCrewJoined / todayCheckedIn to preview different screen states.

const STUB: HomeData = {
  loading: false,
  user:    { displayName: 'User Name', avatarUrl: null, avatarColor: '#C4613A' },
  goal:    { title: 'Goal Title', frequency: 'daily' },
  streak:  { current: 0, longest: 0, state: 'active' },

  hasCrewJoined:  false,
  todayCheckedIn: false,

  crew: {
    name:       'Crew Name',
    healthDots: 0,
    members:    [],
  },

  invitedPeople: [],

  sprint: { dayCurrent: 1, dayTotal: 28, progress: 0 },

  feed: [],
};

export function useHomeData(): HomeData {
  return STUB;
}
