import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { MainNavigator } from "@/app/navigation/MainNavigator";
import { MainStackParamList } from "@/app/navigation/types";
import { InvestmentWatchlistScreen } from "@/modules/project/screens/InvestmentWatchlistScreen";
import { InvestorSnapshotViewScreen } from "@/modules/investor/screens/InvestorSnapshotViewScreen";
import { UserPublicProfileScreen } from "@/modules/user/screens/UserPublicProfileScreen";
import { ProjectDetailScreen } from "@/modules/project/screens/ProjectDetailScreen";
import { NotificationsScreen } from "@/modules/notifications/screens/NotificationsScreen";
import { CommunityScreen } from "@/modules/community/screens/CommunityScreen";
import { ProfileScreen } from "@/modules/profile/screens/ProfileScreen";
import { SettingsScreen } from "@/modules/settings/screens/SettingsScreen";
import { DiscoverScreen } from "@/modules/user/screens/DiscoverScreen";
import { NetworkScreen } from "@/modules/user/screens/NetworkScreen";
import { SearchScreen } from "@/modules/search/screens/SearchScreen";
import { AdminScreen } from "@/modules/admin/screens/AdminScreen";
import { BusinessSummaryScreen } from "@/modules/investorSnapshot/screens/BusinessSummaryScreen";
import { TractionScreen } from "@/modules/investorSnapshot/screens/TractionScreen";
import { FinancialScreen } from "@/modules/investorSnapshot/screens/FinancialScreen";
import { OwnershipScreen } from "@/modules/investorSnapshot/screens/OwnershipScreen";
import { ReviewScreen } from "@/modules/investorSnapshot/screens/ReviewScreen";
import { InvestorMeetingsScreen } from "@/modules/meeting/screens/InvestorMeetingsScreen";
import { FounderMeetingRequestsScreen } from "@/modules/meeting/screens/FounderMeetingRequestsScreen";
import { AdminMeetingRequestsScreen } from "@/modules/meeting/screens/AdminMeetingRequestsScreen";

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
      name="Discover"
      component={DiscoverScreen}
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
      name="Notifications"
      component={NotificationsScreen}
    />

    <Stack.Screen
      name="Community"
      component={CommunityScreen}
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
        name="InvestorMeetings"
        component={InvestorMeetingsScreen}
    />

      <Stack.Screen
        name="FounderMeetings"
        component={FounderMeetingRequestsScreen}
    />

      <Stack.Screen
        name="AdminMeetings"
        component={AdminMeetingRequestsScreen}
    />
  </Stack.Navigator>
);