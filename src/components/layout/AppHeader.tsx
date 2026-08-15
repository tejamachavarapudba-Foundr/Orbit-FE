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
import type { Notification } from "@/modules/notifications/types";

export const AppHeader = () => {
  const colors = useThemeTokens();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { data: notifications } = useNotifications();
  const unreadCount = (notifications ?? []).filter((item: Notification) => !item.isRead).length;

  const showBackButton = [
    "Discover",
    "Network",
    "Profile",
    "UserProfile",
    "Settings",
  ].includes(route.name as string);

  return (
    <View className="relative z-50 border-b border-border bg-surface px-5 py-4">
      <View className="flex-row items-center justify-between">
        {showBackButton ? (
          <Pressable onPress={() => navigation.goBack()} className="flex-row items-center gap-2">
            <Feather name="chevron-left" size={22} color={colors.text} />
            <AppText>←</AppText>
          </Pressable>
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
