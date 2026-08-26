import { Modal, Pressable, ScrollView, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText } from "@/components/ui/AppText";
import { Card } from "@/components/ui/Card";
import { useThemeTokens } from "@/hooks/useThemeTokens";

type PickerSheetProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
};

export const PickerSheet = ({ visible, onClose, title, options, value, onChange }: PickerSheetProps) => {
  const colors = useThemeTokens();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.45)" }}>
        <Pressable style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} onPress={onClose} />

        <Card className="rounded-t-3xl" style={{ maxHeight: "70%" }}>
          <View className="flex-row items-center border-b border-border px-5 py-4">
            <AppText size="xl" weight="bold" className="flex-1">
              {title}
            </AppText>
            <Pressable onPress={onClose} hitSlop={8} accessibilityRole="button" accessibilityLabel="Close">
              <Feather name="x" size={22} color={colors.text} />
            </Pressable>
          </View>

          <ScrollView style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
            {options.map((option) => (
              <Pressable
                key={option.value}
                accessibilityRole="button"
                onPress={() => {
                  onChange(option.value);
                  onClose();
                }}
                className="flex-row items-center justify-between px-5 py-3"
              >
                <AppText size="base" weight={value === option.value ? "semibold" : "regular"}>
                  {option.label}
                </AppText>
                {value === option.value ? <Feather name="check" size={20} color={colors.primary} /> : null}
              </Pressable>
            ))}
          </ScrollView>
        </Card>
      </View>
    </Modal>
  );
};
