# PACT — Project Brief
> Read this before writing any code. This is the single source of truth.

---

## What Pact Is

Pact is a social accountability app. Users set goals, invite a crew of 2–6 people they trust, and check in daily. The crew sees each other's progress and reacts. The social layer — not gamification — is the motivation engine.

**Core philosophy:** Humans are better together. The app steps back. The people are the point.

**Tagline:** "For the people who keep you going."

---

## Tech Stack

- **Framework:** React Native (Expo)
- **Navigation:** React Navigation v6 (stack + bottom tabs)
- **State:** Zustand
- **Backend:** Supabase (auth, database, realtime, storage)
- **Notifications:** Expo Notifications
- **Styling:** StyleSheet (no Tailwind — RN only)
- **Fonts:** expo-google-fonts (Syne_700Bold, Syne_800ExtraBold, DMSans_300Light, DMSans_400Regular, DMSans_500Medium)
- **Animations:** React Native Reanimated 3
- **Image picker:** expo-image-picker
- **Camera:** expo-camera

---

## Design Tokens — Use These Everywhere

```js
// colours.js — import this in every component
export const colors = {
  ember: '#C4613A',
  emberLight: '#E8896A',
  emberDeep: '#8C3D1F',
  emberSurface: 'rgba(196,97,58,0.10)',
  emberBorder: 'rgba(196,97,58,0.22)',
  stone: '#F7F3EE',
  stoneMid: '#EDE6DC',
  stoneDeep: '#D8CEBF',
  ink: '#1A120A',
  inkMid: 'rgba(26,18,10,0.65)',
  inkMuted: 'rgba(26,18,10,0.38)',
  inkBorder: 'rgba(26,18,10,0.08)',
  inkBorderMid: 'rgba(26,18,10,0.14)',
  white: '#FFFFFF',
  cream: '#FBF8F4',
  sage: '#4A6741',
  sageSurface: 'rgba(74,103,65,0.10)',
  slate: '#3A4E5C',
  danger: '#C4413A',
};

// spacing.js
export const spacing = {
  xs: 4, sm: 8, md: 12, base: 16, lg: 20,
  xl: 24, xxl: 32, xxxl: 40, huge: 48, screen: 20,
};

// radius.js
export const radius = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, full: 100, circle: 999,
};

// typography.js
export const typography = {
  display:    { fontFamily: 'Syne_800ExtraBold', fontSize: 40, letterSpacing: -1 },
  h1:         { fontFamily: 'Syne_800ExtraBold', fontSize: 28, letterSpacing: -0.5 },
  h2:         { fontFamily: 'Syne_700Bold',      fontSize: 22, letterSpacing: -0.3 },
  h3:         { fontFamily: 'Syne_700Bold',      fontSize: 18 },
  title:      { fontFamily: 'Syne_700Bold',      fontSize: 15 },
  bodyLg:     { fontFamily: 'DMSans_400Regular', fontSize: 16, lineHeight: 26 },
  body:       { fontFamily: 'DMSans_400Regular', fontSize: 14, lineHeight: 22 },
  bodySm:     { fontFamily: 'DMSans_400Regular', fontSize: 13, lineHeight: 20 },
  label:      { fontFamily: 'DMSans_500Medium',  fontSize: 12 },
  eyebrow:    { fontFamily: 'DMSans_500Medium',  fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase' },
  caption:    { fontFamily: 'DMSans_300Light',   fontSize: 11 },
  button:     { fontFamily: 'DMSans_500Medium',  fontSize: 15 },
};
```

---

## App Structure

### Screens (build in this order)

**Group 1 — Onboarding**
1. `SplashScreen` — wordmark, tagline, auto-advances after 1.8s
2. `WelcomeScreen` — headline, two CTAs (Let's go / I already have an account)
3. `NamePhotoScreen` — first name input + avatar upload/select
4. `LifeAreaScreen` — 5 tile selector (Health, Mind, Work, Creative, Finance)
5. `WhyScreen` — textarea, 140 char limit, private lock indicator
6. `InviteCrewScreen` — contacts/WhatsApp/link options, skip option
7. `YoureInScreen` — celebration, CTA to set first goal

**Group 2 — Goal Setting**
8. `GoalWhatScreen` — text input + contextual examples
9. `GoalFrequencyScreen` — Daily / Weekly selector
10. `GoalSprintScreen` — 2 / 4 / 8 week selector, "Most popular" on 4
11. `GoalConfirmScreen` — summary + "Make the pact." CTA

**Group 3 — Core (Tab Screens)**
12. `HomeScreen` — greeting, streak hero, crew strip, feed
13. `CrewScreen` — crew overview, members, sprint progress
14. `CheckInScreen` — format selector (Photo/Note/Mood)
15. `ProfileScreen` — avatar, streak, badges, history

**Group 4 — Check-In Formats**
16. `CheckInPhotoScreen` — camera/library, optional caption
17. `CheckInNoteScreen` — journal-style textarea
18. `CheckInMoodScreen` — two sliders, emoji feedback
19. `CheckInSubmittedScreen` — THE CELEBRATION (animated, 6-beat sequence)

**Group 5 — Secondary**
20. `SprintSummaryScreen` — completion stats, re-commit vote
21. `WelcomeBackScreen` — spark flow, why reminder, crew activity
22. `MemberProfileScreen` — in-crew profile, encouragement
23. `SettingsScreen` — notifications, account, "What Pact believes"
24. `BadgeDetailScreen` — badge artwork, earned date, share

---

## Navigation Structure

```
RootNavigator (Stack)
├── OnboardingNavigator (Stack) — shown if !user
│   ├── Splash
│   ├── Welcome
│   ├── NamePhoto
│   ├── LifeArea
│   ├── Why
│   ├── InviteCrew
│   ├── YoureIn
│   └── GoalNavigator (Stack)
│       ├── GoalWhat
│       ├── GoalFrequency
│       ├── GoalSprint
│       └── GoalConfirm
│
└── MainNavigator (Bottom Tabs) — shown if user
    ├── Home (Tab 1) — Stack
    │   ├── HomeScreen
    │   └── CheckIn Stack
    │       ├── CheckInPrompt
    │       ├── CheckInPhoto / Note / Mood
    │       └── CheckInSubmitted
    ├── Crew (Tab 2) — Stack
    │   ├── CrewScreen
    │   ├── MemberProfile
    │   └── SprintSummary
    ├── Profile (Tab 3) — Stack
    │   ├── ProfileScreen
    │   ├── BadgeDetail
    │   └── Settings
    └── (CheckIn is centre tab, navigates to CheckIn stack)
```

---

## Supabase Schema

```sql
-- Users
create table profiles (
  id uuid references auth.users primary key,
  display_name text not null,
  avatar_url text,
  avatar_color text default '#C4613A',
  life_area text check (life_area in ('health','mind','work','creative','finance')),
  why_statement text,
  created_at timestamptz default now()
);

-- Crews
create table crews (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- Crew members
create table crew_members (
  crew_id uuid references crews(id),
  user_id uuid references profiles(id),
  role text default 'member' check (role in ('member','captain')),
  joined_at timestamptz default now(),
  primary key (crew_id, user_id)
);

-- Goals
create table goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  crew_id uuid references crews(id),
  title text not null,
  life_area text,
  frequency text check (frequency in ('daily','weekly')),
  sprint_weeks integer check (sprint_weeks in (2,4,8)),
  sprint_start timestamptz default now(),
  sprint_end timestamptz,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Check-ins
create table checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  goal_id uuid references goals(id),
  crew_id uuid references crews(id),
  format text check (format in ('photo','note','mood')),
  photo_url text,
  note_text text,
  mood_effort integer check (mood_effort between 1 and 5),
  mood_feeling integer check (mood_feeling between 1 and 5),
  checked_in_at timestamptz default now()
);

-- Reactions
create table reactions (
  id uuid primary key default gen_random_uuid(),
  checkin_id uuid references checkins(id),
  user_id uuid references profiles(id),
  emoji text check (emoji in ('❤️','💪','🔥','✨')),
  created_at timestamptz default now(),
  unique(checkin_id, user_id, emoji)
);

-- Streaks (computed but cached)
create table streaks (
  user_id uuid references profiles(id),
  crew_id uuid references crews(id),
  current_streak integer default 0,
  longest_streak integer default 0,
  shield_used boolean default false,
  last_checkin_date date,
  primary key (user_id, crew_id)
);

-- Invites
create table invites (
  id uuid primary key default gen_random_uuid(),
  crew_id uuid references crews(id),
  invited_by uuid references profiles(id),
  invite_token text unique default gen_random_uuid()::text,
  expires_at timestamptz default now() + interval '7 days',
  accepted_at timestamptz
);
```

---

## Key Components to Build First

Before any screens, build these reusable components:

```
components/
├── PactButton.jsx        — primary, secondary, ghost, text, danger variants
├── PactInput.jsx         — text input with all states
├── PactTextarea.jsx      — textarea with char count
├── Avatar.jsx            — all sizes, colour system, captain indicator
├── AvatarStack.jsx       — overlapping crew avatars
├── CheckInCard.jsx       — photo/note/mood variants
├── ReactionBar.jsx       — 4 reactions with pop animation
├── StreakDisplay.jsx     — number + state (active/shield/broken)
├── ProgressBar.jsx       — sprint + crew health variants
├── CrewHealthDots.jsx    — 5 dots health indicator
├── BottomNav.jsx         — custom tab bar
├── LifeAreaTile.jsx      — selectable tile
├── SprintSelector.jsx    — 2/4/8 week options
├── FormatSelector.jsx    — photo/note/mood picker
├── BadgeItem.jsx         — locked/unlocked states
├── Toast.jsx             — in-app notification
├── Modal.jsx             — bottom sheet base
└── EmptyState.jsx        — icon + title + desc
```

---

## Animation Specs (Reanimated 3)

```js
// Spring configs
export const springs = {
  snappy:      { damping: 15, stiffness: 300 },  // button presses
  bouncy:      { damping: 12, stiffness: 200 },  // streak counter, badges
  gentle:      { damping: 20, stiffness: 150 },  // screen transitions
  celebration: { damping: 10, stiffness: 180 },  // submission moment
};

// Timing
export const durations = {
  instant:     80,
  fast:        150,
  base:        250,
  slow:        400,
  celebration: 600,
  gentle:      1000,
};
```

### The Check-In Submission Sequence (CheckInSubmittedScreen)
Build this exactly — it's the most important interaction:
1. `t=0ms` — Background warms (radial gradient animates in)
2. `t=100ms` — Check icon springs in with `springs.celebration`
3. `t=100ms` — Particles emit upward (15–20 small circles)
4. `t=100ms` — Ripple rings pulse outward (3 rings, staggered 400ms)
5. `t=400ms` — Streak number flips up with spring bounce
6. `t=400ms` — Message fades + slides up
7. `t=700ms` — Streak pill scales in
8. `t=1000ms` — "Crew reacted" label fades in
9. `t=1100ms` — Reaction row 1 slides in from left
10. `t=1400ms` — Reaction row 2 slides in from left
11. `t=1700ms` — Reaction row 3 slides in from left
12. `t=2100ms` — CTA button fades + slides up

---

## Copy Tokens — Use Exact Strings

```js
export const copy = {
  tagline:         "For the people who keep you going.",
  ctaPrimary:      "Make the pact.",
  checkinDone:     "Done. Your crew will see this.",
  welcomeFirst:    "You showed up. That's always the hardest part.",
  welcomeBack:     "Good to have you back.",
  absenceNotif:    "Still here. So are they.",
  streakBroken:    "Streak reset. Still here. So are they.",
  returnCheckin:   "That's the one that counts.",
  invite:          "Pick the people who'll be glad you asked.",
  sprintEnd:       "Look what you did together.",
  crewWaiting:     "Your crew is waiting. Takes 10 seconds.",
  whyHelper:       "This is just for you. We'll remind you of it when things get hard.",
  beTheOne:        "Be the one who starts it today.",
  goalCta:         "That's it",
  frequencyCta:    "Got it",
  sprintCta:       "Let's do this",
  nameCta:         "That's me",
  lifeAreaCta:     "This is my focus",
  whyCta:          "That's my why",
};
```

---

## Rules Claude Code Must Follow

1. **Never use hex values directly in components** — always import from `colors.js`
2. **Never hardcode spacing** — always use `spacing.x` values
3. **Every screen gets a loading state and empty state**
4. **Animations use Reanimated 3** — never `Animated` from React Native core
5. **No `any` types if using TypeScript**
6. **Supabase calls go in `/hooks`** — never directly in screen components
7. **Copy comes from `copy.js`** — never hardcode strings in JSX
8. **Every CTA is a sentence** — not a single verb like "Continue" or "Next"
9. **No red/danger colours for missed check-ins** — always warm neutral tones
10. **The check-in submitted screen always runs the full animation sequence** — no skipping