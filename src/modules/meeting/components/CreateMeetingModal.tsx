import { Modal, Pressable, ScrollView, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { AppText } from "@/components/ui/AppText";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { CreateMeetingForm } from "@/modules/meeting/components/CreateMeetingForm";
import { iconSize } from "@/theme/designTokens";

type Props = {
  visible: boolean;
  onClose: () => void;
  startupId?: string | undefined;
};

export const CreateMeetingModal = ({ visible, onClose, startupId }: Props) => {
  const colors = useThemeTokens();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <Pressable accessibilityRole="button" className="absolute bottom-0 left-0 right-0 top-0 bg-black/50" onPress={onClose} />
        <View className="max-h-[88%] rounded-t-2xl bg-card p-4">
          <View className="mb-2 flex-row items-center justify-between">
            <AppText weight="bold" size="lg">
              New meeting
            </AppText>
            <Pressable accessibilityRole="button" onPress={onClose} hitSlop={8}>
              <Feather name="x" size={iconSize.lg} color={colors.text} />
            </Pressable>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <CreateMeetingForm onSuccess={onClose} initialStartupId={startupId} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
