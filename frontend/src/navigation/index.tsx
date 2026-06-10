import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

import SplashScreen from '../screens/onboarding/SplashScreen';
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
import SignUpScreen from '../screens/onboarding/SignUpScreen';
import SignInScreen from '../screens/onboarding/SignInScreen';
import NamePhotoScreen from '../screens/onboarding/NamePhotoScreen';
import LifeAreaScreen from '../screens/onboarding/LifeAreaScreen';
import WhyScreen from '../screens/onboarding/WhyScreen';
import InviteCrewScreen from '../screens/onboarding/InviteCrewScreen';
import WaitingRoomScreen from '../screens/onboarding/WaitingRoomScreen';
import YoureInScreen from '../screens/onboarding/YoureInScreen';
import CulturalPrimerScreen from '../screens/onboarding/CulturalPrimerScreen';

import GoalWhatScreen from '../screens/goals/GoalWhatScreen';
import GoalFrequencyScreen from '../screens/goals/GoalFrequencyScreen';
import GoalSprintScreen from '../screens/goals/GoalSprintScreen';
import GoalConfirmScreen from '../screens/goals/GoalConfirmScreen';

import HomeScreen from '../screens/home/HomeScreen';

import CheckInPromptScreen from '../screens/checkin/CheckInPromptScreen';
import CheckInPhotoScreen from '../screens/checkin/CheckInPhotoScreen';
import CheckInNoteScreen from '../screens/checkin/CheckInNoteScreen';
import CheckInMoodScreen from '../screens/checkin/CheckInMoodScreen';
import CheckInSubmittedScreen from '../screens/checkin/CheckInSubmittedScreen';

import CrewScreen from '../screens/crew/CrewScreen';
import MemberProfileScreen from '../screens/crew/MemberProfileScreen';

import ProfileScreen from '../screens/profile/ProfileScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import BadgeDetailScreen from '../screens/profile/BadgeDetailScreen';

import SprintSummaryScreen from '../screens/secondary/SprintSummaryScreen';
import WelcomeBackScreen from '../screens/secondary/WelcomeBackScreen';
import PaywallScreen from '../screens/secondary/PaywallScreen';
import PublicGroupsScreen from '../screens/secondary/PublicGroupsScreen';
import CrewBalanceScreen from '../screens/secondary/CrewBalanceScreen';
import SprintStoriesScreen from '../screens/secondary/SprintStoriesScreen';

import BottomNav, { type TabId } from '../components/composite/BottomNav';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// ─── Custom tab bar ───────────────────────────────────────────────────────────
// Replaces the OS tab bar with our BottomNav design component.
// Checkin is not a tab — it opens the CheckIn flow from the root stack.

const ROUTE_TO_TAB: Record<string, TabId> = {
  Home: 'home',
  Crew: 'crew',
  Profile: 'profile',
};

const TAB_TO_ROUTE: Partial<Record<TabId, string>> = {
  home: 'Home',
  crew: 'Crew',
  profile: 'Profile',
};

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const activeTab = ROUTE_TO_TAB[state.routes[state.index].name] ?? 'home';

  const handlePress = (tab: TabId) => {
    if (tab === 'checkin') {
      // CheckIn screens live in the root Stack — navigate up through parent navigators
      (navigation as any).navigate('CheckInPrompt');
      return;
    }
    const routeName = TAB_TO_ROUTE[tab];
    if (routeName) {
      navigation.navigate(routeName);
    }
  };

  return <BottomNav active={activeTab} onPress={handlePress} />;
}

// ─── Sub-navigators ───────────────────────────────────────────────────────────

function GoalNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GoalWhat" component={GoalWhatScreen} />
      <Stack.Screen name="GoalFrequency" component={GoalFrequencyScreen} />
      <Stack.Screen name="GoalSprint" component={GoalSprintScreen} />
      <Stack.Screen name="GoalConfirm" component={GoalConfirmScreen} />
    </Stack.Navigator>
  );
}

function OnboardingNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="NamePhoto" component={NamePhotoScreen} />
      <Stack.Screen name="LifeArea" component={LifeAreaScreen} />
      <Stack.Screen name="Why" component={WhyScreen} />
      <Stack.Screen name="InviteCrew" component={InviteCrewScreen} />
      <Stack.Screen name="WaitingRoom" component={WaitingRoomScreen} />
      <Stack.Screen name="YoureIn" component={YoureInScreen} />
      <Stack.Screen name="CulturalPrimer" component={CulturalPrimerScreen} />
      <Stack.Screen name="Goals" component={GoalNavigator} />
    </Stack.Navigator>
  );
}

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
    </Stack.Navigator>
  );
}

function CrewStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CrewScreen" component={CrewScreen} />
      <Stack.Screen name="MemberProfile" component={MemberProfileScreen} />
      <Stack.Screen name="SprintSummary" component={SprintSummaryScreen} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen name="BadgeDetail" component={BadgeDetailScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

// ─── Main tab navigator ───────────────────────────────────────────────────────
// Uses our custom BottomNav instead of the OS tab bar.

function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Crew" component={CrewStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}

// ─── Root navigator ───────────────────────────────────────────────────────────
// CheckIn screens are at root level so they're reachable from any tab or the
// bottom nav's centre button without nesting inside a specific tab stack.

function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
      <Stack.Screen name="Main" component={MainNavigator} />
      {/* CheckIn flow — accessible from any tab via navigate('CheckInPrompt') */}
      <Stack.Screen name="CheckInPrompt" component={CheckInPromptScreen} />
      <Stack.Screen name="CheckInPhoto" component={CheckInPhotoScreen} />
      <Stack.Screen name="CheckInNote" component={CheckInNoteScreen} />
      <Stack.Screen name="CheckInMood" component={CheckInMoodScreen} />
      <Stack.Screen name="CheckInSubmitted" component={CheckInSubmittedScreen} />
      {/* Secondary screens */}
      <Stack.Screen name="WelcomeBack" component={WelcomeBackScreen} />
      <Stack.Screen name="Paywall" component={PaywallScreen} />
      <Stack.Screen name="PublicGroups" component={PublicGroupsScreen} />
      <Stack.Screen name="CrewBalance" component={CrewBalanceScreen} />
      <Stack.Screen name="SprintStories" component={SprintStoriesScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}
