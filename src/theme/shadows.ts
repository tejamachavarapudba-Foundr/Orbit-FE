import { Platform, ViewStyle } from "react-native";

type ShadowPreset = "card" | "elevated" | "glow" | "none";

const iosShadows: Record<Exclude<ShadowPreset, "none">, ViewStyle> = {
  card: {
    shadowColor: "#1e293b",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3
  },
  elevated: {
    shadowColor: "#1e293b",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16
  },
  glow: {
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 20
  }
};

const androidElevation: Record<Exclude<ShadowPreset, "none">, ViewStyle> = {
  card: { elevation: 2 },
  elevated: { elevation: 8 },
  glow: { elevation: 6 }
};

export const getShadowStyle = (preset: ShadowPreset): ViewStyle => {
  if (preset === "none") {
    return {};
  }

  if (Platform.OS === "android") {
    return androidElevation[preset];
  }

  return iosShadows[preset];
};
