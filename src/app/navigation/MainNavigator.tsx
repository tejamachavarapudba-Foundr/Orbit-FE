import { useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather, Ionicons } from "@expo/vector-icons";

import { MainTabParamList } from "@/app/navigation/types";
import { DiscoverScreen } from "@/modules/user/screens/DiscoverScreen";
import { HomeScreen } from "@/app/screens/HomeScreen";
import { JobsScreen } from "@/modules/jobs/screens/JobsScreen";
import { MeetingsScreen } from "@/modules/meeting/screens/MeetingsScreen";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { ChatsScreen } from "@/modules/chat/screens/ChatsScreen";
import { ProjectsScreen } from "@/modules/project/screens/ProjectsScreen";

import { useConnectionsStore } from "@/modules/connections/store";
import { useChatStore } from "@/modules/chat/store";
import { useAuthStore } from "@/modules/auth/store";
import { useNotifications } from "@/modules/notifications/hooks";
import { countUnreadByType, JOB_NOTIFICATION_TYPES, PROJECT_NOTIFICATION_TYPES } from "@/modules/notifications/categories";

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

const badgeOptions = (tabBarIcon: (props: TabIconProps) => JSX.Element, count: number, colors: { primary: string }) => {
  const options: any = { tabBarIcon };
  if (count > 0) {
    options.tabBarBadge = count;
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
};

export const MainNavigator = () => {
  const colors = useThemeTokens();
  const currentUserId = useAuthStore((state) => state.user?.profile.id);
  const isInvestor = useAuthStore((state) => state.user?.profile?.role?.toLowerCase() === "investor");

  // Connection invitations counter — shown on the "My network" menu item
  // (ProfileMenuButton), not a tab, so it's loaded here but not used below.
  const loadIncomingRequests = useConnectionsStore((state) => state.loadIncomingRequests);

  // Unread chats: has a last message, it wasn't sent by me, and it hasn't
  // been marked read yet (backend field is `readAt`, not `isRead` — a
  // mismatched field name here meant this always evaluated to unread
  // regardless of actual state, and chats with zero messages counted too).
  const unreadChatsCount = useChatStore((state) =>
    (state.chats || []).filter((chat) => {
      const lastMessage = chat.messages?.[0];
      return Boolean(lastMessage) && lastMessage!.senderId !== currentUserId && !lastMessage!.readAt;
    }).length
  );
  const loadChats = useChatStore((state) => state.loadChats);

  // Projects/Jobs each get their own badge now instead of
  // everything piling into Messages — same split as orbit-web.
  const { data: notifications } = useNotifications();
  const projectsAlertCount = countUnreadByType(notifications ?? [], PROJECT_NOTIFICATION_TYPES);
  const jobsAlertCount = countUnreadByType(notifications ?? [], JOB_NOTIFICATION_TYPES);

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
        options={badgeOptions(tabIcon("message-square"), unreadChatsCount, colors)}
      />

      <Tab.Screen
        name="Projects"
        component={ProjectsScreen}
        options={badgeOptions(projectsTabIcon, projectsAlertCount, colors)}
      />
      {isInvestor ? (
        <Tab.Screen
          name="Meetings"
          component={MeetingsScreen}
          options={{ title: "Meetings", tabBarIcon: tabIcon("video") }}
        />
      ) : (
        <Tab.Screen
          name="Jobs"
          component={JobsScreen}
          options={badgeOptions(tabIcon("briefcase"), jobsAlertCount, colors)}
        />
      )}
      <Tab.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{ title: "Discover", tabBarIcon: tabIcon("compass") }}
      />
    </Tab.Navigator>
  );
};
