import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { MainNavigator } from "@/app/navigation/MainNavigator";
import { MainStackParamList } from "@/app/navigation/types";

import { UserPublicProfileScreen } from "@/modules/user/screens/UserPublicProfileScreen";
import { ProfileScreen } from "@/modules/profile/screens/ProfileScreen";
import { DiscoverScreen } from "@/modules/user/screens/DiscoverScreen";
import { NetworkScreen } from "@/modules/user/screens/NetworkScreen";
import { SearchScreen } from "@/modules/search/screens/SearchScreen";
import { AdminScreen } from "@/modules/admin/screens/AdminScreen";

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
  </Stack.Navigator>
);