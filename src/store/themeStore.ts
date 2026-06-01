import { Appearance } from "react-native";
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

    set({
      isHydrated: true,
      preference,
      resolvedScheme: resolvePreference(preference)
    });
  },
  setPreference: async (preference) => {
    await secureStorage.setItem(appConfig.themeKey, preference);
    set({ preference, resolvedScheme: resolvePreference(preference) });
  },
  toggle: async () => {
    const nextPreference = get().resolvedScheme === "dark" ? "light" : "dark";
    await get().setPreference(nextPreference);
  }
}));
