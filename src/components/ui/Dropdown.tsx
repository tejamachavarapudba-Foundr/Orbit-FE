import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { AppText } from "@/components/ui/AppText";
import { useThemeTokens } from "@/hooks/useThemeTokens";

type DropdownOption<T extends string> = {
  label: string;
  value: T;
};

type DropdownProps<T extends string> = {
  value: T;
  options: readonly DropdownOption<T>[];
  onChange: (value: T) => void;
  placeholder?: string;
  accessibilityLabel?: string;
  className?: string;
};

export const Dropdown = <T extends string>({
  value,
  options,
  onChange,
  placeholder = "Select",
  accessibilityLabel = "Select option",
  className = ""
}: DropdownProps<T>) => {
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
        className={[
          "h-11 w-full flex-row items-center justify-between rounded-t-lg border-b-2 bg-surface-elevated px-3",
          open ? "border-primary" : "border-input",
          className
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <AppText size="sm" weight="medium" numberOfLines={1} className="mr-2 flex-1">
          {selectedLabel}
        </AppText>
        <Feather name="chevron-down" size={16} color={colors.muted} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View className="flex-1 justify-center px-4">
          <Pressable accessibilityRole="button" className="absolute inset-0 bg-black/50" onPress={() => setOpen(false)} />
          <View className="relative max-h-80 rounded-xl border border-border bg-card p-2">
            <ScrollView keyboardShouldPersistTaps="handled">
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
                    className="rounded-md px-3 py-3"
                  >
                    {isSelected ? (
                      <AppText size="sm" weight="semibold" tone="primary">
                        {option.label}
                      </AppText>
                    ) : (
                      <AppText size="sm" weight="medium">
                        {option.label}
                      </AppText>
                    )}
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
