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
    // #region agent log
    fetch("http://127.0.0.1:7427/ingest/b69baca5-7169-4c15-b121-a6217c30cb9c", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "ac9505" },
      body: JSON.stringify({
        sessionId: "ac9505",
        location: "SettingsScreen.tsx:handleLogout",
        message: "Sign out pressed from settings",
        data: {},
        timestamp: Date.now(),
        hypothesisId: "H3",
      }),
    }).catch(() => {});
    // #endregion
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
              <ThemeToggle
                onToggle={() => {
                  // #region agent log
                  fetch("http://127.0.0.1:7427/ingest/b69baca5-7169-4c15-b121-a6217c30cb9c", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "ac9505" },
                    body: JSON.stringify({
                      sessionId: "ac9505",
                      location: "SettingsScreen.tsx:ThemeToggle",
                      message: "Theme toggle pressed in settings",
                      data: { previousScheme: scheme },
                      timestamp: Date.now(),
                      hypothesisId: "H2",
                    }),
                  }).catch(() => {});
                  // #endregion
                }}
              />
            </View>
          </CardContent>
        </Card>

        <AppButton label="Sign out" variant="outline" onPress={handleLogout} className="mt-4" />
      </View>
    </AppScreen>
  );
};
