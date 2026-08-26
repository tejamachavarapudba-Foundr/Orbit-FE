import { Pressable, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { AppText } from "@/components/ui/AppText";
import { useThemeTokens } from "@/hooks/useThemeTokens";

type SelectFieldProps = {
  label: string;
  value: string;
  onPress: () => void;
  className?: string;
};

export const SelectField = ({ label, value, onPress, className = "" }: SelectFieldProps) => {
  const colors = useThemeTokens();

  return (
    <View className={`gap-2 ${className}`}>
      <AppText size="sm" weight="medium">
        {label}
      </AppText>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        className="min-h-[40px] flex-row items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 shadow-sm"
      >
        <AppText size="sm">{value}</AppText>
        <Feather name="chevron-down" size={16} color={colors.muted} />
      </Pressable>
    </View>
  );
};
