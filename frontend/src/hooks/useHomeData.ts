export type StreakState = 'active' | 'shield' | 'broken';
export type CheckInFormat = 'photo' | 'note' | 'mood';

// ─── Types ────────────────────────────────────────────────────────────────────

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
  moodEffort: number | null;
  moodFeeling: number | null;
  reactions: { emoji: string; count: number }[];
  checkedInAt: string;
}

export interface HomeData {
  loading: boolean;
  user: HomeUser;
  goal: { title: string; frequency: string };
  streak: { current: number; longest: number; state: StreakState };
  // State flags — flip these to preview different screen states:
  hasCrewJoined: boolean;  // false → Waiting state; true → Pending/Active
  todayCheckedIn: boolean; // false → Pending;        true → Active
  crew: {
    name: string;
    healthDots: number; // 0–5
    members: HomeMember[];
  };
  invitedPeople: InvitedPerson[]; // shown in Waiting state
  sprint: { dayCurrent: number; dayTotal: number; progress: number }; // progress: 0–1
  feed: FeedItem[];
}

// ─── Mock ─────────────────────────────────────────────────────────────────────
// To preview screen states, flip the flags below:
//   hasCrewJoined: false  → Waiting State   (crew hasn't joined yet)
//   hasCrewJoined: true,  todayCheckedIn: false → Pending State
//   hasCrewJoined: true,  todayCheckedIn: true  → Active State

const MOCK: HomeData = {
  loading: false,
  user: { displayName: 'Maya', avatarUrl: null, avatarColor: '#C4613A' },
  goal: { title: 'Run 3x a week', frequency: 'daily' },
  streak: { current: 3, longest: 18, state: 'active' },

  hasCrewJoined: false,   // ← flip to true for Pending/Active states
  todayCheckedIn: false,  // ← flip to true (with hasCrewJoined:true) for Active state

  crew: {
    name: 'The Morning Three',
    healthDots: 4,
    members: [
      { id: '1', displayName: 'Maya',  avatarUrl: null, avatarColor: '#C4613A', role: 'captain', checkedInToday: false },
      { id: '2', displayName: 'Jess',  avatarUrl: null, avatarColor: '#4A6741', role: 'member',  checkedInToday: true  },
      { id: '3', displayName: 'Omar',  avatarUrl: null, avatarColor: '#3A4E5C', role: 'member',  checkedInToday: false },
    ],
  },

  invitedPeople: [
    { id: '1', name: 'Priya Bose',   initial: 'P', avatarColor: '#4A6741', status: 'Joined'  },
    { id: '2', name: 'Jess Larkin',  initial: 'J', avatarColor: '#3A4E5C', status: 'Seen'    },
    { id: '3', name: 'Kieran Walsh', initial: 'K', avatarColor: '#D4954A', status: 'Invited' },
  ],

  sprint: { dayCurrent: 3, dayTotal: 28, progress: 0.11 },

  feed: [
    {
      id: '1',
      user: { displayName: 'Jess', avatarColor: '#4A6741', avatarUrl: null },
      format: 'note',
      noteText: 'Morning run done. Tired but glad I went.',
      photoUrl: null,
      moodEffort: null,
      moodFeeling: null,
      reactions: [{ emoji: '🔥', count: 2 }, { emoji: '❤️', count: 1 }],
      checkedInAt: new Date(Date.now() - 1000 * 60 * 47).toISOString(),
    },
    {
      id: '2',
      user: { displayName: 'Omar', avatarColor: '#3A4E5C', avatarUrl: null },
      format: 'mood',
      noteText: null,
      photoUrl: null,
      moodEffort: 4,
      moodFeeling: 3,
      reactions: [{ emoji: '💪', count: 3 }],
      checkedInAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    },
  ],
};

export function useHomeData(): HomeData {
  return MOCK;
}
