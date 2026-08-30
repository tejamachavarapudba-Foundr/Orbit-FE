import { Pressable, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { AppText } from "@/components/ui/AppText";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { iconSize } from "@/theme/designTokens";

type MultiSelectOption<T extends string> = {
  label: string;
  value: T;
};

type MultiSelectChecklistProps<T extends string> = {
  options: readonly MultiSelectOption<T>[];
  value: T[];
  onChange: (value: T[]) => void;
};

export const MultiSelectChecklist = <T extends string>({ options, value, onChange }: MultiSelectChecklistProps<T>) => {
  const colors = useThemeTokens();

  const toggle = (option: T) => {
    onChange(value.includes(option) ? value.filter((item) => item !== option) : [...value, option]);
  };

  return (
    <View className="gap-1 rounded-md border border-border bg-card p-1">
      {options.map((option) => {
        const isSelected = value.includes(option.value);

        return (
          <Pressable
            key={option.value}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isSelected }}
            onPress={() => toggle(option.value)}
            className="flex-row items-center gap-2 rounded-md px-3 py-2.5"
          >
            <Feather name={isSelected ? "check-square" : "square"} size={iconSize.md} color={isSelected ? colors.primary : colors.muted} />
            <AppText size="sm" weight={isSelected ? "semibold" : "medium"}>
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
};
