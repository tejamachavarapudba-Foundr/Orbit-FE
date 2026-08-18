import { Appearance } from "react-native";
import { colorScheme as nativewindColorScheme } from "nativewind";
import { create } from "zustand";

import { appConfig } from "@/constants/config";
import { AppColorScheme } from "@/constants/theme";
import { secureStorage } from "@/services/storage/secureStorage";

export type ThemePreference = "light" | "dark" | "system";

type ThemeState = {
  isHydrated: boolean;
  preference: ThemePreference;
  resolvedScheme: AppColorScheme;
  bootstrap: () => Promise<void>;
  setPreference: (preference: ThemePreference) => Promise<void>;
  toggle: () => Promise<void>;
};

const resolvePreference = (preference: ThemePreference): AppColorScheme => {
  if (preference === "system") {
    return Appearance.getColorScheme() === "dark" ? "dark" : "light";
  }

  return preference;
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  isHydrated: false,
  preference: "light",
  resolvedScheme: "light",
  bootstrap: async () => {
    const saved = await secureStorage.getItem(appConfig.themeKey);
    const preference: ThemePreference = saved === "dark" || saved === "system" || saved === "light" ? saved : "light";
    const resolvedScheme = resolvePreference(preference);

    // NativeWind's dark: variants on native are driven by RN's Appearance
    // API, not by a className="dark" ancestor (that only works on web) —
    // without this call, className-based styling never leaves light mode.
    nativewindColorScheme.set(resolvedScheme);

    set({
      isHydrated: true,
      preference,
      resolvedScheme
    });
  },
  setPreference: async (preference) => {
    await secureStorage.setItem(appConfig.themeKey, preference);
    const resolvedScheme = resolvePreference(preference);
    nativewindColorScheme.set(resolvedScheme);
    set({ preference, resolvedScheme });
  },
  toggle: async () => {
    const nextPreference = get().resolvedScheme === "dark" ? "light" : "dark";
    await get().setPreference(nextPreference);
  }
}));
