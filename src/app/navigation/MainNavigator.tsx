import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather, Ionicons } from "@expo/vector-icons";

import { MainTabParamList } from "@/app/navigation/types";
import { EventsScreen } from "@/modules/events/screens/EventsScreen";
import { HomeScreen } from "@/app/screens/HomeScreen";
import { JobsScreen } from "@/modules/jobs/screens/JobsScreen";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { AdminScreen } from "@/modules/admin/screens/AdminScreen";
import { ChatsScreen } from "@/modules/chat/screens/ChatsScreen";
import { ProfileScreen } from "@/modules/profile/screens/ProfileScreen";
import { ProjectsScreen } from "@/modules/project/screens/ProjectsScreen";
import { SearchScreen } from "@/modules/search/screens/SearchScreen";
import { DiscoverScreen } from "@/modules/user/screens/DiscoverScreen";
import { NetworkScreen } from "@/modules/user/screens/NetworkScreen";
import { iconSize } from "@/theme/designTokens";

const Tab = createBottomTabNavigator<MainTabParamList>();

type TabIconProps = {
  focused: boolean;
  color: string;
  size: number;
};

const tabIcon =
  (featherName: keyof typeof Feather.glyphMap) =>
  ({ color }: TabIconProps) => (
    <Feather
      name={featherName}
      size={24}
      color={color}
    />
  );

const projectsTabIcon = ({ color }: TabIconProps) => (
  <Ionicons
    name="rocket-outline"
    size={24}
    color={color}
  />
);

export const MainNavigator = () => {
  const colors = useThemeTokens();

  return (
    <Tab.Navigator
    screenOptions={{
      headerShown: false,

      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.muted,

    tabBarHideOnKeyboard: true,

    tabBarStyle: {
      backgroundColor: colors.surface,
      borderTopColor: colors.border,
      borderTopWidth: 1,

      height: 80,
      paddingTop: 8,
      paddingBottom: 10,
    },

    tabBarItemStyle: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },

    tabBarIconStyle: {
      marginTop: 4,
    },

    tabBarLabelStyle: {
      fontSize: 11,
      marginTop: 2,
      marginBottom: 4,
      fontWeight: "500",
    },

    tabBarAllowFontScaling: false,
  }}
>
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: "Feed", tabBarIcon: tabIcon("home") }} />
      <Tab.Screen name="Messages" component={ChatsScreen} options={{ tabBarIcon: tabIcon("message-square") }} />
      <Tab.Screen name="Projects" component={ProjectsScreen} options={{ tabBarIcon: projectsTabIcon }} />
      <Tab.Screen name="Jobs" component={JobsScreen} options={{ tabBarIcon: tabIcon("briefcase") }} />
      <Tab.Screen name="Events" component={EventsScreen} options={{ tabBarIcon: tabIcon("calendar") }} />
    </Tab.Navigator>
  );
};
