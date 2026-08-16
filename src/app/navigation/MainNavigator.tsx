import { useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather, Ionicons } from "@expo/vector-icons";

import { MainTabParamList } from "@/app/navigation/types";
import { EventsScreen } from "@/modules/events/screens/EventsScreen";
import { HomeScreen } from "@/app/screens/HomeScreen";
import { JobsScreen } from "@/modules/jobs/screens/JobsScreen";
import { InvestorMeetingsScreen } from "@/modules/meeting/screens/InvestorMeetingsScreen";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { ChatsScreen } from "@/modules/chat/screens/ChatsScreen";
import { ProjectsScreen } from "@/modules/project/screens/ProjectsScreen";

import { useConnectionsStore } from "@/modules/connections/store";
import { useChatStore } from "@/modules/chat/store";
import { useAuthStore } from "@/modules/auth/store";

const Tab = createBottomTabNavigator<MainTabParamList>();

type TabIconProps = {
  focused: boolean;
  color: string;
  size: number;
};

const tabIcon =
  (featherName: keyof typeof Feather.glyphMap) =>
  ({ color, size }: TabIconProps) => (
    <Feather name={featherName} size={size} color={color} />
  );

const projectsTabIcon = ({ color, size }: TabIconProps) => (
  <Ionicons name="rocket-outline" size={size} color={color} />
);

export const MainNavigator = () => {
  const colors = useThemeTokens();
  const currentUserId = useAuthStore((state) => state.user?.profile.id);
  const isInvestor = useAuthStore((state) => state.user?.profile?.role?.toLowerCase() === "investor");

  // 1. Connection invitations counter
  const incomingRequestsCount = useConnectionsStore((state) => state.incomingRequests.length);
  const loadIncomingRequests = useConnectionsStore((state) => state.loadIncomingRequests);

  // 2. 🟢 CHAT COUNTER FIX: Filter for UNREAD chats only
  // Adjust 'chat.unread' or 'chat.hasUnread' to match your exact chat schema property name
  const unreadChatsCount = useChatStore((state) =>
    (state.chats || []).filter((chat: any) => chat.messages?.[0]?.senderId !== currentUserId && !chat.messages?.[0]?.isRead).length
  );
  const loadChats = useChatStore((state) => state.loadChats);

  // 3. 🟢 COMBINED FIXED ALERT BADGE MATRIX
  const combinedMessageAlerts = unreadChatsCount + incomingRequestsCount;

  useEffect(() => {
    if (currentUserId) {
      void loadIncomingRequests();
      void loadChats();
    }
  }, [currentUserId, loadIncomingRequests, loadChats]);

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
        tabBarIconStyle: { marginTop: 4 },
        tabBarLabelStyle: { fontSize: 11, marginTop: 2, marginBottom: 4, fontWeight: "500" },
        tabBarAllowFontScaling: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: "Feed", tabBarIcon: tabIcon("home") }} />

      <Tab.Screen
        name="Messages"
        component={ChatsScreen}
        options={() => {
          const options: any = {
            tabBarIcon: tabIcon("message-square"),
          };

          if (combinedMessageAlerts > 0) {
            options.tabBarBadge = combinedMessageAlerts;
            options.tabBarBadgeStyle = {
              backgroundColor: colors.primary,
              color: "#fff",
              fontSize: 10,
              height: 16,
              minWidth: 16,
              lineHeight: 14,
              textAlign: "center",
            };
          }

          return options;
        }}
      />

      <Tab.Screen name="Projects" component={ProjectsScreen} options={{ tabBarIcon: projectsTabIcon }} />
      {isInvestor ? (
        <Tab.Screen
          name="Meetings"
          component={InvestorMeetingsScreen}
          options={{ title: "My Meetings", tabBarIcon: tabIcon("video") }}
        />
      ) : (
        <Tab.Screen name="Jobs" component={JobsScreen} options={{ tabBarIcon: tabIcon("briefcase") }} />
      )}
      <Tab.Screen name="Events" component={EventsScreen} options={{ tabBarIcon: tabIcon("calendar") }} />
    </Tab.Navigator>
  );
};
