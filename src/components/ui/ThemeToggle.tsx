import { Pressable } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { useThemeStore } from "@/store/themeStore";

type ThemeToggleProps = {
  className?: string;
};

export const ThemeToggle = ({ className = "" }: ThemeToggleProps) => {
  const scheme = useThemeStore((state) => state.resolvedScheme);
  const toggle = useThemeStore((state) => state.toggle);

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: scheme === "dark" }}
      onPress={() => void toggle()}
      className={`h-10 items-center justify-center rounded-md border border-border px-4 ${className}`}
    >
      <AppText tone="primary" weight="semibold" size="sm">
        {scheme === "dark" ? "Light" : "Dark"}
      </AppText>
    </Pressable>
  );
};
