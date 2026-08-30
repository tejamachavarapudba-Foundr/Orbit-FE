import { useState } from "react";
import { Modal, Pressable, ScrollView, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { iconSize } from "@/theme/designTokens";

type PortfolioNamesBottomSheetProps = {
  value: string[];
  onChange: (value: string[]) => void;
  max?: number;
  placeholder?: string;
  title?: string;
};

/** Lets someone list a handful of named portfolio companies (e.g. "Orbit", "SH", "DLF") — a bottom sheet of up to `max` numbered text boxes, not a fixed option list, since these names are theirs to type. */
export const PortfolioNamesBottomSheet = ({
  value,
  onChange,
  max = 5,
  placeholder = "Company name",
  title = "Portfolio companies"
}: PortfolioNamesBottomSheetProps) => {
  const colors = useThemeTokens();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string[]>(value);

  const openSheet = () => {
    const seeded = [...value];
    while (seeded.length < max) seeded.push("");
    setDraft(seeded);
    setOpen(true);
  };

  const updateSlot = (index: number, text: string) => {
    setDraft((current) => current.map((item, i) => (i === index ? text : item)));
  };

  const commit = () => {
    onChange(draft.map((item) => item.trim()).filter(Boolean));
    setOpen(false);
  };

  const selectedLabel = value.length ? value.join(", ") : placeholder;

  return (
    <>
      <Pressable
        accessibilityRole="button"
        onPress={openSheet}
        className="min-h-11 w-full flex-row items-center justify-between rounded-t-lg border-b-2 border-input bg-surface-elevated px-3 py-2"
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

            <ScrollView className="mt-3" style={{ flexShrink: 1 }} keyboardShouldPersistTaps="handled">
              <View className="gap-3">
                {draft.map((entry, index) => (
                  <View key={index} className="flex-row items-center gap-2">
                    <AppText tone="muted" size="sm" style={{ width: 20 }}>
                      {index + 1}.
                    </AppText>
                    <TextInput
                      value={entry}
                      onChangeText={(text) => updateSlot(index, text)}
                      placeholder={placeholder}
                      placeholderTextColor={colors.muted}
                      selectionColor={colors.primary}
                      className="h-11 flex-1 rounded-t-lg border-b-2 border-input bg-surface-elevated px-3 text-sm text-text"
                    />
                  </View>
                ))}
              </View>
            </ScrollView>

            <AppButton label="Done" className="mt-4" onPress={commit} />
          </View>
        </View>
      </Modal>
    </>
  );
};
