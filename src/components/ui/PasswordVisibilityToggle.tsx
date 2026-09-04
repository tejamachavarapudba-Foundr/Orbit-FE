import { Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";

import { useThemeTokens } from "@/hooks/useThemeTokens";

interface Props {
  visible: boolean;
  onToggle: () => void;
}

export const PasswordVisibilityToggle = ({ visible, onToggle }: Props) => {
  const colors = useThemeTokens();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={visible ? "Hide password" : "Show password"}
      hitSlop={8}
      className="p-2"
      onPress={onToggle}
    >
      <Feather name={visible ? "eye-off" : "eye"} size={18} color={colors.muted} />
    </Pressable>
  );
};
