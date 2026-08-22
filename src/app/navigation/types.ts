import { NavigatorScreenParams } from "@react-navigation/native";

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
};

export type MainTabParamList = {
  Home: undefined;
  Messages: undefined;
  Projects: undefined;
  Jobs: undefined;
  Meetings: undefined;
  Events: undefined;
};

export type MainStackParamList = {
  Tabs: undefined;

  Profile: undefined;
  Settings: undefined;
  SavedPosts: undefined;
  Subscription: undefined;
  DataPrivacy: undefined;
  FAQ: undefined;
  Support: undefined;
  Discover: undefined;
  Network: undefined;
  Search: undefined;
  Admin: undefined;

  UserProfile: {
    userId: string;
  };

  ProjectDetail: {
    id: string;
    edit?: boolean;
  };

  InvestmentWatchlist: undefined;
  Notifications: undefined;
  Community: undefined;
  CommunityDetail: { id: string };

    BusinessSummary: {
      projectId: string;
    };
    
    Traction: {
      projectId: string;
    };
    
    Financial: {
      projectId: string;
    };
    
    Ownership: {
      projectId: string;
    };
      
    Review: {
      projectId: string;
    };
  
    InvestorSnapshotView: {
      projectId: string;
    };
    
    MyMeetings: undefined;
    MeetingResponse: { proposalId: string };
    MeetingAvailability: undefined;
    VerifyEmail: { token: string };
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
