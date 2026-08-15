import { useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { AppText } from "@/components/ui/AppText";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { useAuthStore } from "@/modules/auth/store";

const tabRoutes = new Set(["Home", "Messages", "Projects", "Jobs", "Events"]);

type ProfileMenuItem = {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  route?: string;
  action?: "settings" | "meetings";
};

const profileMenuItems: ProfileMenuItem[] = [
  { label: "My profile", icon: "user", route: "Profile" },
  { label: "Discover", icon: "compass", route: "Discover" },
  { label: "My network", icon: "users", route: "Network" },
  { label: "My Meetings", icon: "send", action: "meetings" },
  { label: "Messages", icon: "message-square", route: "Messages" },
];

type ProfileMenuButtonProps = {
  className?: string;
};

export const ProfileMenuButton = ({ className = "" }: ProfileMenuButtonProps) => {
  const colors = useThemeTokens();
  const navigation = useNavigation<any>();
  const user = useAuthStore((state) => state.user);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const initial = user?.profile.fullName?.charAt(0).toUpperCase() || "S";
  const isAdmin = user?.role === "ADMIN";
  const isInvestor = user?.profile?.role?.toLowerCase() === "investor";

  const menuItems = [
    ...profileMenuItems,
    isInvestor
      ? {
          label: "Investment Watchlist",
          icon: "bookmark" as const,
          route: "InvestmentWatchlist",
        }
      : {
          label: "New Project",
          icon: "plus" as const,
          route: "Projects",
        },
    ...(isAdmin
      ? [
          {
            label: "Admin",
            icon: "shield" as const,
            route: "Admin",
          },
        ]
      : []),
  ];

  const closeMenu = () => setIsProfileMenuOpen(false);

  const handleMenuPress = (item: ProfileMenuItem) => {
    closeMenu();

    if (item.action === "settings") {
      navigation.navigate("Settings");
      return;
    }

    if (item.action === "meetings") {
      if (user?.role === "ADMIN") {
        navigation.navigate("AdminMeetings");
        return;
      }

      if (user?.profile?.role?.toLowerCase() === "founder") {
        navigation.navigate("FounderMeetings", {
          startupId: "",
        });
        return;
      }

      navigation.navigate("InvestorMeetings");
      return;
    }

    if (item.route) {
      if (tabRoutes.has(item.route)) {
        navigation.navigate("Tabs", { screen: item.route });
      } else {
        navigation.navigate(item.route);
      }
    }
  };

  const handleToggleMenu = () => {
    setIsProfileMenuOpen((isOpen) => !isOpen);
  };

  return (
    <View className={`relative ${className}`}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open profile menu"
        onPress={handleToggleMenu}
        className="h-12 w-12 items-center justify-center rounded-full bg-primary"
      >
        <AppText tone="onPrimary" weight="bold" size="lg">
          {initial}
        </AppText>
      </Pressable>

      {isProfileMenuOpen ? (
        <Modal visible transparent animationType="fade" onRequestClose={closeMenu}>
          <View className="flex-1">
            <Pressable accessibilityRole="button" className="absolute inset-0 bg-black/20" onPress={closeMenu} />
            <View className="absolute right-4 top-16 w-72 rounded-md border border-border bg-surface py-3 shadow-sm">
              <ScrollView keyboardShouldPersistTaps="handled" bounces={false}>
                <View className="border-b border-border px-5 pb-3">
                  <View className="flex-row items-center gap-3">
                    <View className="h-10 w-10 items-center justify-center rounded-full bg-primary">
                      <AppText tone="onPrimary" weight="bold">
                        {initial}
                      </AppText>
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2">
                        <AppText weight="bold" numberOfLines={1}>
                          {user?.profile.fullName || "Startuphouze member"}
                        </AppText>
                        {user?.profile.openToConnect ? <View className="h-2 w-2 rounded-full bg-success" /> : null}
                      </View>
                      <AppText tone="muted" size="sm" numberOfLines={1}>
                        {user?.profile.openToConnect ? "Open to connect" : user?.email}
                      </AppText>
                    </View>
                  </View>
                </View>

                <View className="py-2">
                  {menuItems.map((item) => (
                    <Pressable
                      key={item.label}
                      accessibilityRole="button"
                      onPress={() => handleMenuPress(item)}
                      className="flex-row items-center gap-4 px-6 py-3"
                    >
                      <View className="w-8 items-center">
                        <Feather name={item.icon} size={22} color={colors.text} />
                      </View>
                      <AppText size="lg">{item.label}</AppText>
                    </Pressable>
                  ))}
                </View>

                <View className="border-t border-border pt-2">
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => handleMenuPress({ label: "Settings", icon: "settings", action: "settings" })}
                    className="flex-row items-center gap-5 px-6 py-4"
                  >
                    <View className="w-8 items-center">
                      <Feather name="settings" size={22} color={colors.text} />
                    </View>
                    <AppText size="lg">Settings</AppText>
                  </Pressable>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
};
