import { useState } from "react";
import { Pressable, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";

import { MainTabParamList } from "@/app/navigation/types";
import { AppLogo } from "@/components/brand/AppLogo";
import { AppText } from "@/components/ui/AppText";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { useAuthStore } from "@/modules/auth/store";

type MenuRoute = Exclude<keyof MainTabParamList, "Home" | "Jobs" | "Events" | "Search">;

type ProfileMenuItem = {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  route?: string;
  action?: "logout";
};

const profileMenuItems: ProfileMenuItem[] = [
  { label: "My profile", icon: "user", route: "Profile" },
  { label: "Discover", icon: "compass", route: "Discover" },
  { label: "My network", icon: "users", route: "Network" },
  { label: "Projects", icon: "send", route: "Projects" },
  { label: "Messages", icon: "message-square", route: "Messages" }
];

export const AppHeader = () => {
  const colors = useThemeTokens();
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const route = useRoute();

  const showBackButton = [
    "Discover",
    "Network",
    "Profile",
    "UserProfile",
  ].includes(route.name as string);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const initial = user?.profile.fullName?.charAt(0).toUpperCase() || "S";
  const isAdmin = user?.role === "ADMIN";
  const isInvestor =
  user?.profile?.role?.toLowerCase() === "investor";

  const menuItems = [
    ...profileMenuItems,

    isInvestor
      ? {
          label: "Investment Watchlist",
          icon: "bookmark",
          route: "InvestmentWatchlist",
        }
      : {
          label: "New Project",
          icon: "plus",
          route: "Projects",
        },

    ...(isAdmin
      ? [
          {
            label: "Admin",
            icon: "shield",
            route: "Admin",
          },
        ]
      : []),
  ];

  const handleMenuPress = (item: ProfileMenuItem) => {
    setIsProfileMenuOpen(false);

    if (item.action === "logout") {
      void logout();
      return;
    }

    if (item.route) {
      navigation.navigate(
        item.route as never
      );
    }
  };

  return (
    <View className="relative z-50 border-b border-border bg-surface px-5 py-4">
      <View className="flex-row items-center justify-between"> 
        {showBackButton ? (
          <Pressable
          onPress={() => navigation.goBack()}
          className="flex-row items-center gap-2"
        >
          <Feather
            name="arrow-left"
            size={20}
            color={colors.text}
          />
        
          <AppText weight="semibold">
            Back
          </AppText>
        </Pressable>
        ) : (
          <AppLogo />
        )}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open profile menu"
          onPress={() => setIsProfileMenuOpen((isOpen) => !isOpen)}
          className="h-12 w-12 items-center justify-center rounded-full bg-primary"
        >
          <AppText tone="onPrimary" weight="bold" size="lg">
            {initial}
          </AppText>
        </Pressable>
      </View>

      {isProfileMenuOpen ? (
        <View className="absolute right-5 top-16 w-72 rounded-md border border-border bg-surface py-3 shadow-sm">
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
              onPress={() => handleMenuPress({ label: "Sign out", icon: "log-out", action: "logout" })}
              className="flex-row items-center gap-5 px-6 py-4"
            >
              <View className="w-8 items-center">
                <Feather name="log-out" size={22} color={colors.text} />
              </View>
              <AppText size="lg">Sign out</AppText>
            </Pressable>
          </View>
        </View>
      ) : null}

    </View>
  );
};
