import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

import SplashScreen from "../screens/onboarding/SplashScreen";
import WelcomeScreen from "../screens/onboarding/WelcomeScreen";
import SignUpScreen from "../screens/onboarding/SignUpScreen";
import SignInScreen from "../screens/onboarding/SignInScreen";

import HomeScreen from "../screens/home/HomeScreen";

import CheckInPromptScreen from "../screens/checkin/CheckInPromptScreen";
import CheckInPhotoScreen from "../screens/checkin/CheckInPhotoScreen";
import CheckInNoteScreen from "../screens/checkin/CheckInNoteScreen";
import CheckInSubmittedScreen from "../screens/checkin/CheckInSubmittedScreen";

import CrewScreen from "../screens/crew/CrewScreen";

import ProfileScreen from "../screens/profile/ProfileScreen";
import SettingsScreen from "../screens/profile/SettingsScreen";

import SprintSummaryScreen from "../screens/secondary/SprintSummaryScreen";
import WelcomeBackScreen from "../screens/secondary/WelcomeBackScreen";

import BottomNav, { type TabId } from "../components/composite/BottomNav";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// ─── Custom tab bar ───────────────────────────────────────────────────────────
// Replaces the OS tab bar with our BottomNav design component.
// Checkin is not a tab — it opens the CheckIn flow from the root stack.

const ROUTE_TO_TAB: Record<string, TabId> = {
  Home: "home",
  Partner: "partner",
  Profile: "profile",
};

const TAB_TO_ROUTE: Partial<Record<TabId, string>> = {
  home: "Home",
  partner: "Partner",
  profile: "Profile",
};

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const activeTab = ROUTE_TO_TAB[state.routes[state.index].name] ?? "home";

  const handlePress = (tab: TabId) => {
    if (tab === "checkin") {
      // CheckIn screens live in the root Stack — navigate up through parent navigators
      (navigation as any).navigate("CheckInPrompt");
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

function OnboardingNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
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

// Partner tab — will become the full PartnerView (screen 12) in Chunk 4.
function PartnerStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PartnerScreen" component={CrewScreen} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

// ─── Main tab navigator ───────────────────────────────────────────────────────

function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Partner" component={PartnerStack} />
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
      <Stack.Screen name="Main" component={MainNavigator} />
      {/* <Stack.Screen name="Onboarding" component={OnboardingNavigator} /> */}
      {/* CheckIn flow — accessible from any tab via navigate('CheckInPrompt') */}
      <Stack.Screen name="CheckInPrompt" component={CheckInPromptScreen} />
      <Stack.Screen name="CheckInPhoto" component={CheckInPhotoScreen} />
      <Stack.Screen name="CheckInNote" component={CheckInNoteScreen} />
      <Stack.Screen
        name="CheckInSubmitted"
        component={CheckInSubmittedScreen}
      />
      {/* Lifecycle screens */}
      <Stack.Screen name="WelcomeBack" component={WelcomeBackScreen} />
      <Stack.Screen name="SprintSummary" component={SprintSummaryScreen} />
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
