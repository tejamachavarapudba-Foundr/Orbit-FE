import { Modal, Pressable, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { Card } from "@/components/ui/Card";
import { FilterChip } from "@/components/ui/FilterChip";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { projectStageOptions, projectTypeOptions } from "@/modules/project/hooks";

type ProjectFilterModalProps = {
  visible: boolean;
  onClose: () => void;
  stage: string;
  projectType: string;
  onSetStage: (value: string) => void;
  onSetProjectType: (value: string) => void;
};

export const ProjectFilterModal = ({
  visible,
  onClose,
  stage,
  projectType,
  onSetStage,
  onSetProjectType,
}: ProjectFilterModalProps) => {
  const colors = useThemeTokens();
  const insets = useSafeAreaInsets();

  const clearFilters = () => {
    onSetStage("all");
    onSetProjectType("all");
  };

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
              Stage
            </AppText>
            <View className="flex-row flex-wrap gap-2">
              {projectStageOptions.map((option) => (
                <FilterChip
                  key={option.value}
                  label={option.label}
                  isActive={stage === option.value}
                  onPress={() => onSetStage(option.value)}
                />
              ))}
            </View>

            <AppText tone="muted" size="xs" weight="medium" className="mb-2 mt-5">
              Category
            </AppText>
            <View className="flex-row flex-wrap gap-2">
              {projectTypeOptions.map((option) => (
                <FilterChip
                  key={option.value}
                  label={option.label}
                  isActive={projectType === option.value}
                  onPress={() => onSetProjectType(option.value)}
                />
              ))}
            </View>

            <View className="mt-6 flex-row gap-3">
              <AppButton label="Clear filters" variant="outline" onPress={clearFilters} className="flex-1" />
              <AppButton label="Done" onPress={onClose} className="flex-1" />
            </View>
          </View>
        </Card>
      </View>
    </Modal>
  );
};
