import { Modal, Pressable, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { Card } from "@/components/ui/Card";
import { FilterChip } from "@/components/ui/FilterChip";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { jobRoleOptions } from "@/modules/jobs/hooks";

type JobFilterModalProps = {
  visible: boolean;
  onClose: () => void;
  role: string;
  onSetRole: (value: string) => void;
};

export const JobFilterModal = ({ visible, onClose, role, onSetRole }: JobFilterModalProps) => {
  const colors = useThemeTokens();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.45)" }}>
        <Pressable style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} onPress={onClose} />

        <Card className="rounded-t-3xl" style={{ maxHeight: "80%" }}>
          <View className="flex-row items-center border-b border-border px-5 py-4">
            <AppText size="xl" weight="bold" className="flex-1">
              Filter &amp; Sort
            </AppText>
            <Pressable onPress={onClose} hitSlop={8} accessibilityRole="button" accessibilityLabel="Close">
              <Feather name="x" size={22} color={colors.text} />
            </Pressable>
          </View>

          <View className="px-5 py-4" style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
            <AppText tone="muted" size="xs" weight="medium" className="mb-2">
              Role
            </AppText>
            <View className="flex-row flex-wrap gap-2">
              {jobRoleOptions.map((option) => (
                <FilterChip
                  key={option}
                  label={option === "all" ? "All roles" : option}
                  isActive={role === option}
                  onPress={() => onSetRole(option)}
                />
              ))}
            </View>

            <View className="mt-6 flex-row gap-3">
              <AppButton label="Clear filters" variant="outline" onPress={() => onSetRole("all")} className="flex-1" />
              <AppButton label="Done" onPress={onClose} className="flex-1" />
            </View>
          </View>
        </Card>
      </View>
    </Modal>
  );
};
