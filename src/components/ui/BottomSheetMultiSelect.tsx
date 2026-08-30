import { useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { OtherDescribeModal } from "@/components/ui/OtherDescribeModal";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { iconSize } from "@/theme/designTokens";

type BottomSheetMultiSelectOption<T extends string> = {
  label: string;
  value: T;
};

type BottomSheetMultiSelectProps<T extends string> = {
  value: T[];
  options: readonly BottomSheetMultiSelectOption<T>[];
  onChange: (value: T[]) => void;
  placeholder?: string;
  title?: string;
  max?: number | undefined;
  /** Value that means "Other" (usually "other") — tapping it opens a popup
   * to describe it instead of toggling the option directly, and the
   * trigger/list show that description instead of the raw "Other" label. */
  otherValue?: T | undefined;
  otherText?: string | undefined;
  onOtherTextChange?: ((text: string) => void) | undefined;
};

export const BottomSheetMultiSelect = <T extends string>({
  value,
  options,
  onChange,
  placeholder = "Select",
  title = "Select options",
  max,
  otherValue,
  otherText = "",
  onOtherTextChange
}: BottomSheetMultiSelectProps<T>) => {
  const colors = useThemeTokens();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<T[]>(value);
  const [describing, setDescribing] = useState(false);

  const openSheet = () => {
    setDraft(value);
    setOpen(true);
  };

  const toggle = (option: T) => {
    setDraft((current) => {
      if (current.includes(option)) {
        return current.filter((item) => item !== option);
      }
      if (max && current.length >= max) {
        return current;
      }
      return [...current, option];
    });
  };

  const labelFor = (optionValue: T) =>
    otherValue && optionValue === otherValue && otherText
      ? otherText
      : options.find((option) => option.value === optionValue)?.label ?? optionValue;

  const selectedLabel = value.length ? value.map((v) => labelFor(v)).join(", ") : placeholder;

  return (
    <>
      <Pressable
        accessibilityRole="button"
        onPress={openSheet}
        className={`min-h-11 w-full flex-row items-center justify-between rounded-t-lg border-b-2 bg-surface-elevated px-3 py-2 ${
          open ? "border-primary" : "border-input"
        }`}
      >
        <AppText size="sm" weight="medium" numberOfLines={2} className="mr-2 flex-1">
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
            {max ? (
              <AppText tone="muted" size="xs" className="mt-1">
                {draft.length}/{max} selected
              </AppText>
            ) : null}

            <ScrollView className="mt-3" style={{ flexShrink: 1 }} keyboardShouldPersistTaps="handled">
              {options.map((option) => {
                const isSelected = draft.includes(option.value);
                const isDisabled = !isSelected && Boolean(max) && draft.length >= (max as number);
                const isOther = otherValue && option.value === otherValue;

                return (
                  <Pressable
                    key={option.value}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isSelected, disabled: isDisabled }}
                    disabled={isDisabled}
                    onPress={() => {
                      if (isOther) {
                        setDescribing(true);
                        return;
                      }
                      toggle(option.value);
                    }}
                    className="flex-row items-center gap-2 border-b border-border py-3"
                    style={isDisabled ? { opacity: 0.4 } : undefined}
                  >
                    <Feather
                      name={isSelected ? "check-square" : "square"}
                      size={iconSize.md}
                      color={isSelected ? colors.primary : colors.muted}
                    />
                    <AppText size="sm" weight={isSelected ? "semibold" : "medium"}>
                      {isOther && isSelected && otherText ? otherText : option.label}
                    </AppText>
                  </Pressable>
                );
              })}
            </ScrollView>

            <AppButton
              label="Done"
              className="mt-4"
              onPress={() => {
                onChange(draft);
                setOpen(false);
              }}
            />
          </View>
        </View>
      </Modal>

      {otherValue ? (
        <OtherDescribeModal
          visible={describing}
          label={title}
          initialText={otherText}
          allowRemove={draft.includes(otherValue)}
          onCancel={() => setDescribing(false)}
          onSave={(text) => {
            setDraft((current) => (current.includes(otherValue) ? current : [...current, otherValue]));
            onOtherTextChange?.(text);
            setDescribing(false);
          }}
          onRemove={() => {
            setDraft((current) => current.filter((item) => item !== otherValue));
            onOtherTextChange?.("");
            setDescribing(false);
          }}
        />
      ) : null}
    </>
  );
};
