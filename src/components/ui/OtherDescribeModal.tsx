import { useEffect, useState } from "react";
import { Modal, Pressable, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { iconSize } from "@/theme/designTokens";

type OtherDescribeModalProps = {
  visible: boolean;
  label: string;
  initialText: string;
  /** Show a "Remove" action — only relevant when "Other" is already selected. */
  allowRemove?: boolean;
  onCancel: () => void;
  onSave: (text: string) => void;
  onRemove?: () => void;
};

/** Popup shown in place of the raw "Other"/"Custom" option — the picker
 * never shows that literal option as selected, only the description
 * entered here. */
export const OtherDescribeModal = ({
  visible,
  label,
  initialText,
  allowRemove = false,
  onCancel,
  onSave,
  onRemove
}: OtherDescribeModalProps) => {
  const colors = useThemeTokens();
  const [text, setText] = useState(initialText);

  useEffect(() => {
    if (visible) setText(initialText);
  }, [visible, initialText]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 items-center justify-center bg-black/50 px-6">
        <View className="w-full gap-3 rounded-2xl bg-card p-4">
          <View className="flex-row items-center justify-between">
            <AppText weight="bold" size="base">
              Describe your {label.toLowerCase()}
            </AppText>
            <Pressable accessibilityRole="button" onPress={onCancel} hitSlop={8}>
              <Feather name="x" size={iconSize.md} color={colors.text} />
            </Pressable>
          </View>
          <AppTextInput
            placeholder={`Describe your ${label.toLowerCase()}`}
            value={text}
            onChangeText={setText}
            multiline
            autoFocus
          />
          <View className="flex-row gap-2">
            {allowRemove ? (
              <AppButton label="Remove" variant="outline" className="flex-1" onPress={() => onRemove?.()} />
            ) : null}
            <AppButton label="Save" className="flex-1" disabled={!text.trim()} onPress={() => onSave(text.trim())} />
          </View>
        </View>
      </View>
    </Modal>
  );
};
