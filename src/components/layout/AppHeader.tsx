import { Pressable, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";

import { AppLogo } from "@/components/brand/AppLogo";
import { AppText } from "@/components/ui/AppText";
import { ProfileMenuButton } from "@/components/layout/ProfileMenuButton";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { useNotifications } from "@/modules/notifications/hooks";
import { NotificationBadge } from "@/modules/notifications/components/NotificationBadge";
import { BELL_EXCLUDED_TYPES } from "@/modules/notifications/categories";
import { iconSize } from "@/theme/designTokens";
import type { Notification } from "@/modules/notifications/types";

export const AppHeader = () => {
  const colors = useThemeTokens();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { data: notifications } = useNotifications();
  const unreadCount = (notifications ?? []).filter(
    (item: Notification) => !item.isRead && !BELL_EXCLUDED_TYPES.has(item.type)
  ).length;

  const ROUTE_TITLES: Record<string, string> = {
    Events: "Events",
    ArchivedChats: "Archived Chats",
    Network: "My Network",
    Profile: "My Profile",
    UserProfile: "Profile",
    Settings: "Settings",
    Search: "Search",
    Admin: "Admin",
    SavedPosts: "Saved Posts",
    Subscription: "Subscription",
    DataPrivacy: "Data & Privacy",
    FAQ: "FAQ",
    Support: "Support",
    MyMeetings: "Meetings",
    MeetingResponse: "Meeting",
    MeetingAvailability: "Availability"
  };

  const showBackButton = route.name in ROUTE_TITLES;

  return (
    <View className="relative z-50 border-b border-border bg-surface px-5 py-4">
      <View className="flex-row items-center justify-between">
        {showBackButton ? (
          <View className="flex-1 flex-row items-center gap-2 pr-3">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={8}
              onPress={() => navigation.goBack()}
              className="h-9 w-9 items-center justify-center rounded-full bg-muted-bg"
            >
              <Feather name="arrow-left" size={iconSize.md} color={colors.text} />
            </Pressable>
            <AppText weight="bold" size="lg" numberOfLines={1}>
              {ROUTE_TITLES[route.name as string]}
            </AppText>
          </View>
        ) : (
          <AppLogo />
        )}
        <View className="flex-row items-center gap-3">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            onPress={() => navigation.navigate("Notifications")}
            className="relative h-9 w-9 items-center justify-center rounded-md"
          >
            <Feather name="bell" size={20} color={colors.text} />
            <NotificationBadge count={unreadCount} />
          </Pressable>
          <ProfileMenuButton />
        </View>
      </View>
    </View>
  );
};
