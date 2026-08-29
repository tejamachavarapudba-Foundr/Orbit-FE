import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { AppText } from "@/components/ui/AppText";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { iconSize } from "@/theme/designTokens";

type BottomSheetOption<T extends string> = {
  label: string;
  value: T;
};

type BottomSheetPickerProps<T extends string> = {
  value: T | "";
  options: readonly BottomSheetOption<T>[];
  onChange: (value: T) => void;
  placeholder?: string;
  title?: string;
  accessibilityLabel?: string;
};

export const BottomSheetPicker = <T extends string>({
  value,
  options,
  onChange,
  placeholder = "Select",
  title = "Select an option",
  accessibilityLabel = "Select option"
}: BottomSheetPickerProps<T>) => {
  const colors = useThemeTokens();
  const [open, setOpen] = useState(false);

  const selectedLabel = useMemo(
    () => options.find((option) => option.value === value)?.label ?? placeholder,
    [options, value, placeholder]
  );

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={() => setOpen(true)}
        className={`h-11 w-full flex-row items-center justify-between rounded-t-lg border-b-2 bg-surface-elevated px-3 ${
          open ? "border-primary" : "border-input"
        }`}
      >
        <AppText size="sm" weight="medium" numberOfLines={1} className="mr-2 flex-1">
          {selectedLabel}
        </AppText>
        <Feather name="chevron-down" size={16} color={colors.muted} />
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <View className="flex-1 justify-end">
          <Pressable
            accessibilityRole="button"
            className="absolute bottom-0 left-0 right-0 top-0 bg-black/50"
            onPress={() => setOpen(false)}
          />
          <View className="max-h-[70%] rounded-t-2xl bg-card p-4">
            <View className="flex-row items-center justify-between">
              <AppText weight="bold" size="lg">
                {title}
              </AppText>
              <Pressable accessibilityRole="button" onPress={() => setOpen(false)} hitSlop={8}>
                <Feather name="x" size={iconSize.lg} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView className="mt-3" style={{ flexShrink: 1 }} keyboardShouldPersistTaps="handled">
              {options.map((option) => {
                const isSelected = option.value === value;

                return (
                  <Pressable
                    key={option.value}
                    accessibilityRole="button"
                    onPress={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    className="flex-row items-center justify-between border-b border-border py-3"
                  >
                    <AppText size="sm" weight={isSelected ? "semibold" : "medium"} tone={isSelected ? "primary" : "default"}>
                      {option.label}
                    </AppText>
                    {isSelected ? <Feather name="check" size={iconSize.md} color={colors.primary} /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};
