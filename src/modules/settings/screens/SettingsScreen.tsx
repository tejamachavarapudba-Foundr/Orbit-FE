import { View } from "react-native";

import { AppHeader } from "@/components/layout/AppHeader";
import { AppButton } from "@/components/ui/AppButton";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { Card, CardContent } from "@/components/ui/Card";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useAuthStore } from "@/modules/auth/store";
import { useThemeStore } from "@/store/themeStore";

export const SettingsScreen = () => {
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

        <AppButton label="Sign out" variant="outline" onPress={handleLogout} className="mt-4" />
      </View>
    </AppScreen>
  );
};
