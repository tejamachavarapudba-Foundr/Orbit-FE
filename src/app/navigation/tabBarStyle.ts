import { useMemo } from "react";

import { useThemeTokens } from "@/hooks/useThemeTokens";

// Shared between MainNavigator (default) and any screen that needs to
// toggle the tab bar's visibility (e.g. ChatsScreen hiding it for a full-
// screen conversation) — using the exact same style object on both ends
// avoids any mismatch between the "hidden" and "restored" tab bar layout.
export const useTabBarStyle = () => {
  const colors = useThemeTokens();

  return useMemo(
    () => ({
      backgroundColor: colors.surface,
      borderTopColor: colors.border,
      borderTopWidth: 1,
      height: 80,
      paddingTop: 8,
      paddingBottom: 10
    }),
    [colors.surface, colors.border]
  );
};
