import { themeColors } from "@/constants/theme";
import { useThemeStore } from "@/store/themeStore";

export const useThemeTokens = () => {
  const scheme = useThemeStore((state) => state.resolvedScheme);
  return themeColors[scheme];
};
