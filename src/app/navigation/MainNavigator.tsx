import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { MainTabParamList } from "@/app/navigation/types";
import { HomeScreen } from "@/app/screens/HomeScreen";
import { PlaceholderTabScreen } from "@/app/screens/PlaceholderTabScreen";
import { AppText } from "@/components/ui/AppText";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { AdminScreen } from "@/modules/admin/screens/AdminScreen";
import { ChatsScreen } from "@/modules/chat/screens/ChatsScreen";
import { ProfileScreen } from "@/modules/profile/screens/ProfileScreen";
import { ProjectsScreen } from "@/modules/project/screens/ProjectsScreen";
import { SearchScreen } from "@/modules/search/screens/SearchScreen";
import { DiscoverScreen } from "@/modules/user/screens/DiscoverScreen";
import { NetworkScreen } from "@/modules/user/screens/NetworkScreen";

const Tab = createBottomTabNavigator<MainTabParamList>();

const JobsScreen = () => (
  <PlaceholderTabScreen title="Jobs" message="Jobs APIs can be connected when you share the job module endpoints." />
);

const EventsScreen = () => (
  <PlaceholderTabScreen title="Events" message="Events APIs can be connected when you share the events module endpoints." />
);

const tabIcon = (icon: string) => {
  const Icon = ({ color }: { focused: boolean; color: string; size: number }) => (
    <AppText style={{ color }} size="xl">
      {icon}
    </AppText>
  );
  return Icon;
};

export const MainNavigator = () => {
  const colors = useThemeTokens();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600"
        }
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: "Feed", tabBarIcon: tabIcon("F") }} />
      <Tab.Screen name="Messages" component={ChatsScreen} options={{ tabBarIcon: tabIcon("M") }} />
      <Tab.Screen name="Projects" component={ProjectsScreen} options={{ tabBarIcon: tabIcon("P") }} />
      <Tab.Screen name="Jobs" component={JobsScreen} options={{ tabBarIcon: tabIcon("J") }} />
      <Tab.Screen name="Events" component={EventsScreen} options={{ tabBarIcon: tabIcon("E") }} />
      <Tab.Screen name="Search" component={SearchScreen} options={{ tabBarButton: () => null }} />
      <Tab.Screen name="Admin" component={AdminScreen} options={{ tabBarButton: () => null }} />
      <Tab.Screen name="Discover" component={DiscoverScreen} options={{ tabBarButton: () => null }} />
      <Tab.Screen name="Network" component={NetworkScreen} options={{ tabBarButton: () => null }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarButton: () => null }} />
    </Tab.Navigator>
  );
};
