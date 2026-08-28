import { useMemo } from "react";

import { useThemeTokens } from "@/hooks/useThemeTokens";

// Also used by bottom-sheet Modals opened over a tab screen (e.g.
// PostComposerModal) — Android's Modal window doesn't extend under the
// tab bar the way the screen underneath it does, so short-content sheets
// need this added to their own bottom padding or they leave a gap that
// shows the tab bar peeking through underneath.
export const TAB_BAR_HEIGHT = 80;

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
      height: TAB_BAR_HEIGHT,
      paddingTop: 8,
      paddingBottom: 10
    }),
    [colors.surface, colors.border]
  );
};
