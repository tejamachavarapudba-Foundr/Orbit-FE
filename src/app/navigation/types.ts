import { NavigatorScreenParams } from "@react-navigation/native";

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainStackParamList = {
  Tabs: undefined;
  Profile: undefined;
  Discover: undefined;
  Network: undefined;
  Search: undefined;
  Admin: undefined;
  UserProfile: {
    userId: string;
  };
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
