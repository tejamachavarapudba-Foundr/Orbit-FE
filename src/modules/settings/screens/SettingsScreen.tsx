import { Pressable, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { AppHeader } from "@/components/layout/AppHeader";
import { AppButton } from "@/components/ui/AppButton";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { Card, CardContent } from "@/components/ui/Card";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useAuthStore } from "@/modules/auth/store";
import { useThemeStore } from "@/store/themeStore";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { MainStackParamList } from "@/app/navigation/types";

type SettingsRoute = keyof Pick<
  MainStackParamList,
  "VerifyProfile" | "SavedPosts" | "Subscription" | "DataPrivacy" | "FAQ" | "Support"
>;

const settingsRows: { route: SettingsRoute; icon: keyof typeof Feather.glyphMap; label: string; description: string }[] = [
  { route: "VerifyProfile", icon: "check-circle", label: "Verify profile", description: "Identity and role verification" },
  { route: "SavedPosts", icon: "bookmark", label: "Saved", description: "Posts you've saved" },
  { route: "Subscription", icon: "star", label: "Subscription", description: "Manage your plan" },
  { route: "DataPrivacy", icon: "shield", label: "Data & Privacy", description: "What we collect and why" },
  { route: "FAQ", icon: "help-circle", label: "FAQ", description: "Common questions" },
  { route: "Support", icon: "life-buoy", label: "Support", description: "Get help from our team" }
];

export const SettingsScreen = () => {
  const colors = useThemeTokens();
  const navigation = useNavigation<any>();
  const logout = useAuthStore((state) => state.logout);
  const scheme = useThemeStore((state) => state.resolvedScheme);

  const handleLogout = () => {
    void logout();
  };

  return (
    <AppScreen withHorizontalPadding={false}>
      <AppHeader />
      <View className="flex-1 px-5 pt-6">
        <AppText family="display" size="2xl" weight="bold" className="mb-6">
          Settings
        </AppText>

        <Card className="mb-4">
          <CardContent className="py-4">
            <View className="flex-row items-center justify-between gap-4">
              <View className="flex-1">
                <AppText weight="semibold" size="lg">
                  Appearance
                </AppText>
                <AppText tone="muted" size="sm" className="mt-1">
                  Currently using {scheme === "dark" ? "dark" : "light"} mode
                </AppText>
              </View>
              <ThemeToggle />
            </View>
          </CardContent>
        </Card>

        <Card>
          {settingsRows.map((row, index) => (
            <Pressable
              key={row.route}
              accessibilityRole="button"
              onPress={() => navigation.navigate(row.route)}
              className={`flex-row items-center gap-4 px-4 py-3.5 ${
                index < settingsRows.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <View className="h-9 w-9 items-center justify-center rounded-full bg-muted-bg">
                <Feather name={row.icon} size={18} color={colors.text} />
              </View>
              <View className="flex-1">
                <AppText weight="semibold">{row.label}</AppText>
                <AppText tone="muted" size="sm" className="mt-0.5">
                  {row.description}
                </AppText>
              </View>
              <Feather name="chevron-right" size={18} color={colors.muted} />
            </Pressable>
          ))}
        </Card>

        <AppButton label="Sign out" variant="outline" onPress={handleLogout} className="mt-4" />
      </View>
    </AppScreen>
  );
};
