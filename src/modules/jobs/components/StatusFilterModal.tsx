import { Modal, Pressable, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText } from "@/components/ui/AppText";
import { Card } from "@/components/ui/Card";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { JobApplicationStatus } from "@/modules/jobs/types";

export type StatusFilter = "all" | JobApplicationStatus;

export const STATUS_FILTERS: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Accepted", value: "accepted" },
  { label: "Rejected", value: "rejected" }
];

type StatusFilterModalProps = {
  visible: boolean;
  onClose: () => void;
  value: StatusFilter;
  onChange: (value: StatusFilter) => void;
};

export const StatusFilterModal = ({ visible, onClose, value, onChange }: StatusFilterModalProps) => {
  const colors = useThemeTokens();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.45)" }}>
        <Pressable style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} onPress={onClose} />

        <Card className="rounded-t-3xl" style={{ maxHeight: "80%" }}>
          <View className="flex-row items-center border-b border-border px-5 py-4">
            <AppText size="xl" weight="bold" className="flex-1">
              Filter by status
            </AppText>
            <Pressable onPress={onClose} hitSlop={8} accessibilityRole="button" accessibilityLabel="Close">
              <Feather name="x" size={22} color={colors.text} />
            </Pressable>
          </View>

          <View className="py-2" style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
            {STATUS_FILTERS.map((filter) => (
              <Pressable
                key={filter.value}
                accessibilityRole="button"
                onPress={() => {
                  onChange(filter.value);
                  onClose();
                }}
                className="flex-row items-center justify-between px-5 py-3"
              >
                <AppText size="base" weight={value === filter.value ? "semibold" : "regular"}>
                  {filter.label}
                </AppText>
                {value === filter.value ? <Feather name="check" size={20} color={colors.primary} /> : null}
              </Pressable>
            ))}
          </View>
        </Card>
      </View>
    </Modal>
  );
};
