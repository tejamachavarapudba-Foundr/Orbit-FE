import { Pressable } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { useThemeStore } from "@/store/themeStore";

type ThemeToggleProps = {
  className?: string;
  onToggle?: () => void;
};

export const ThemeToggle = ({ className = "", onToggle }: ThemeToggleProps) => {
  const scheme = useThemeStore((state) => state.resolvedScheme);
  const toggle = useThemeStore((state) => state.toggle);

  const handlePress = () => {
    onToggle?.();
    void toggle();
  };

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: scheme === "dark" }}
      onPress={handlePress}
      className={`h-10 items-center justify-center rounded-md border border-border px-4 ${className}`}
    >
      <AppText tone="primary" weight="semibold" size="sm">
        {scheme === "dark" ? "Light" : "Dark"}
      </AppText>
    </Pressable>
  );
};
