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
  Discover: undefined;
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
  Events: undefined;
  CreateEvent: { isPrivate?: boolean; communityId?: string } | undefined;
  EventDetail: { id: string };
  CommunityEvents: undefined;
  ArchivedChats: undefined;
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
  CreateProject: undefined;
  PitchReels: undefined;

  JobDetail: {
    id: string;
  };

  PostJob: undefined;

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

    VerifyProfile: undefined;
    FounderVerification: undefined;
    RoleVerification: { role: "investor" | "professional" | "advisor" | "service_provider" };
    VerifyIdentity: { status?: string };
};


export type OnboardingStackParamList = {
  OnboardingWelcome: undefined;
  OnboardingGoals: undefined;
  OnboardingQuickProfile: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  VerifyEmailOtp: undefined;
  Onboarding: NavigatorScreenParams<OnboardingStackParamList>;
  Main: NavigatorScreenParams<MainStackParamList>;
};
