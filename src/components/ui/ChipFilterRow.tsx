import { Pressable, ScrollView } from "react-native";

import { AppText } from "@/components/ui/AppText";

type ChipOption<T extends string> = {
  label: string;
  value: T;
};

type ChipFilterRowProps<T extends string> = {
  value: T;
  options: ChipOption<T>[];
  onChange: (value: T) => void;
  accessibilityLabel?: string;
};

export const ChipFilterRow = <T extends string>({ value, options, onChange, accessibilityLabel }: ChipFilterRowProps<T>) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    accessibilityLabel={accessibilityLabel}
    contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
  >
    {options.map((option) => {
      const isActive = option.value === value;
      return (
        <Pressable
          key={option.value}
          accessibilityRole="button"
          accessibilityState={{ selected: isActive }}
          onPress={() => onChange(option.value)}
          className={`h-8 items-center justify-center rounded-full border px-3.5 ${
            isActive ? "border-primary bg-primary" : "border-border bg-card"
          }`}
        >
          <AppText size="sm" weight="semibold" tone={isActive ? "onPrimary" : "default"}>
            {option.label}
          </AppText>
        </Pressable>
      );
    })}
  </ScrollView>
);
