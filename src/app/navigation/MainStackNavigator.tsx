import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { MainNavigator } from "@/app/navigation/MainNavigator";
import { MainStackParamList } from "@/app/navigation/types";
import { InvestmentWatchlistScreen } from "@/modules/project/screens/InvestmentWatchlistScreen";
import { InvestorSnapshotViewScreen } from "@/modules/investor/screens/InvestorSnapshotViewScreen";
import { UserPublicProfileScreen } from "@/modules/user/screens/UserPublicProfileScreen";
import { ProjectDetailScreen } from "@/modules/project/screens/ProjectDetailScreen";
import { JobDetailScreen } from "@/modules/jobs/screens/JobDetailScreen";
import { PostJobScreen } from "@/modules/jobs/screens/PostJobScreen";
import { NotificationsScreen } from "@/modules/notifications/screens/NotificationsScreen";
import { CommunityScreen } from "@/modules/community/screens/CommunityScreen";
import { CommunityDetailScreen } from "@/modules/community/screens/CommunityDetailScreen";
import { ProfileScreen } from "@/modules/profile/screens/ProfileScreen";
import { SettingsScreen } from "@/modules/settings/screens/SettingsScreen";
import { SavedPostsScreen } from "@/modules/settings/screens/SavedPostsScreen";
import { SubscriptionScreen } from "@/modules/settings/screens/SubscriptionScreen";
import { DataPrivacyScreen } from "@/modules/settings/screens/DataPrivacyScreen";
import { FAQScreen } from "@/modules/settings/screens/FAQScreen";
import { SupportScreen } from "@/modules/settings/screens/SupportScreen";
import { EventsScreen } from "@/modules/events/screens/EventsScreen";
import { CreateEventScreen } from "@/modules/events/screens/CreateEventScreen";
import { EventDetailScreen } from "@/modules/events/screens/EventDetailScreen";
import { CommunityEventsScreen } from "@/modules/events/screens/CommunityEventsScreen";
import { ArchivedChatsScreen } from "@/modules/chat/screens/ArchivedChatsScreen";
import { NetworkScreen } from "@/modules/user/screens/NetworkScreen";
import { SearchScreen } from "@/modules/search/screens/SearchScreen";
import { AdminScreen } from "@/modules/admin/screens/AdminScreen";
import { BusinessSummaryScreen } from "@/modules/investorSnapshot/screens/BusinessSummaryScreen";
import { TractionScreen } from "@/modules/investorSnapshot/screens/TractionScreen";
import { FinancialScreen } from "@/modules/investorSnapshot/screens/FinancialScreen";
import { OwnershipScreen } from "@/modules/investorSnapshot/screens/OwnershipScreen";
import { ReviewScreen } from "@/modules/investorSnapshot/screens/ReviewScreen";
import { MeetingsScreen } from "@/modules/meeting/screens/MeetingsScreen";
import { VerifyEmailScreen } from "@/modules/auth/screens/VerifyEmailScreen";
import { ProposalResponseScreen } from "@/modules/meeting/screens/ProposalResponseScreen";
import { AvailabilityScreen } from "@/modules/meeting/screens/AvailabilityScreen";
import { VerifyProfileScreen } from "@/modules/verification/screens/VerifyProfileScreen";
import { FounderVerificationScreen } from "@/modules/verification/screens/FounderVerificationScreen";
import { RoleVerificationScreen } from "@/modules/verification/screens/RoleVerificationScreen";
import { VerifyIdentityCallbackScreen } from "@/modules/verification/screens/VerifyIdentityCallbackScreen";

const Stack = createNativeStackNavigator<MainStackParamList>();

export const MainStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    {/* Bottom Tabs */}
    <Stack.Screen
      name="Tabs"
      component={MainNavigator}
    />

    {/* Secondary Screens */}
    <Stack.Screen
      name="Profile"
      component={ProfileScreen}
    />

    <Stack.Screen
      name="Settings"
      component={SettingsScreen}
    />

    <Stack.Screen
      name="SavedPosts"
      component={SavedPostsScreen}
    />

    <Stack.Screen
      name="Subscription"
      component={SubscriptionScreen}
    />

    <Stack.Screen
      name="DataPrivacy"
      component={DataPrivacyScreen}
    />

    <Stack.Screen
      name="FAQ"
      component={FAQScreen}
    />

    <Stack.Screen
      name="Support"
      component={SupportScreen}
    />

    <Stack.Screen
      name="Events"
      component={EventsScreen}
    />

    <Stack.Screen
      name="CreateEvent"
      component={CreateEventScreen}
    />

    <Stack.Screen
      name="EventDetail"
      component={EventDetailScreen}
    />

    <Stack.Screen
      name="CommunityEvents"
      component={CommunityEventsScreen}
    />

    <Stack.Screen
      name="ArchivedChats"
      component={ArchivedChatsScreen}
    />

    <Stack.Screen
      name="Network"
      component={NetworkScreen}
    />

    <Stack.Screen
      name="Search"
      component={SearchScreen}
    />

    <Stack.Screen
      name="Admin"
      component={AdminScreen}
    />

    <Stack.Screen
      name="UserProfile"
      component={UserPublicProfileScreen}
    />

    <Stack.Screen
      name="ProjectDetail"
      component={ProjectDetailScreen}
    />

    <Stack.Screen
      name="JobDetail"
      component={JobDetailScreen}
    />

    <Stack.Screen
      name="PostJob"
      component={PostJobScreen}
    />

    <Stack.Screen
      name="Notifications"
      component={NotificationsScreen}
    />

    <Stack.Screen
      name="Community"
      component={CommunityScreen}
    />

    <Stack.Screen
      name="CommunityDetail"
      component={CommunityDetailScreen}
    />


    <Stack.Screen
      name="BusinessSummary"
      component={BusinessSummaryScreen}
    />

    <Stack.Screen
      name="Traction"
      component={TractionScreen}
    />

    <Stack.Screen
      name="Financial"
      component={FinancialScreen}
    />

    <Stack.Screen
      name="Ownership"
      component={OwnershipScreen}
    />

      <Stack.Screen
      name="Review"
      component={ReviewScreen}
    />

      <Stack.Screen
      name="InvestorSnapshotView"
      component={InvestorSnapshotViewScreen}
    />

      <Stack.Screen
        name="InvestmentWatchlist"
        component={InvestmentWatchlistScreen}
        options={{
          title: "Investment Watchlist",
        }}
    />

      <Stack.Screen
        name="MyMeetings"
        component={MeetingsScreen}
    />

      <Stack.Screen
        name="MeetingResponse"
        component={ProposalResponseScreen}
    />

      <Stack.Screen
        name="MeetingAvailability"
        component={AvailabilityScreen}
    />

      <Stack.Screen
        name="VerifyEmail"
        component={VerifyEmailScreen}
    />

      <Stack.Screen
        name="VerifyProfile"
        component={VerifyProfileScreen}
    />

      <Stack.Screen
        name="FounderVerification"
        component={FounderVerificationScreen}
    />

      <Stack.Screen
        name="RoleVerification"
        component={RoleVerificationScreen}
    />

      <Stack.Screen
        name="VerifyIdentity"
        component={VerifyIdentityCallbackScreen}
    />
  </Stack.Navigator>
);