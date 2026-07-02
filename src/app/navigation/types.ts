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
    
    InvestorMeetings: undefined;
    FounderMeetings: { startupId: string;
    };
    AdminMeetings: undefined;
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
