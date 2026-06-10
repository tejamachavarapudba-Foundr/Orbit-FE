import { NavigatorScreenParams } from "@react-navigation/native";

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Messages: undefined;
  Projects: undefined;
  Jobs: undefined;
  Events: undefined;
  Search: undefined;
  Admin: undefined;
  Discover: undefined;
  Network: undefined;
  Profile: undefined;
};

export type MainStackParamList = {
  Tabs: undefined;
  UserProfile: { userId: string };
};

export type OnboardingStackParamList = {
  OnboardingWelcome: undefined;
  OnboardingGoals: undefined;
  OnboardingQuickProfile: undefined;
  OnboardingMatch: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Onboarding: NavigatorScreenParams<OnboardingStackParamList>;
  Main: NavigatorScreenParams<MainStackParamList>;
};
