import { useState } from "react";
import { Modal, Pressable, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { PeoplePickerModal } from "@/modules/meeting/components/PeoplePickerModal";
import { iconSize } from "@/theme/designTokens";

type CreateCommunityModalProps = {
  visible: boolean;
  isCreating: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string, memberIds: string[]) => void;
};

export const CreateCommunityModal = ({ visible, isCreating, onClose, onCreate }: CreateCommunityModalProps) => {
  const colors = useThemeTokens();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [memberNames, setMemberNames] = useState<string[]>([]);
  const [isPickerVisible, setIsPickerVisible] = useState(false);

  const reset = () => {
    setName("");
    setDescription("");
    setMemberIds([]);
    setMemberNames([]);
  };

  const close = () => {
    reset();
    onClose();
  };

  const submit = () => {
    if (!name.trim()) return;
    onCreate(name.trim(), description.trim(), memberIds);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <View className="flex-1 justify-end">
        <Pressable accessibilityRole="button" className="absolute bottom-0 left-0 right-0 top-0 bg-black/50" onPress={close} />
        <View className="rounded-t-2xl bg-card p-4">
          <View className="flex-row items-center justify-between">
            <AppText weight="bold" size="lg">
              Create a community
            </AppText>
            <Pressable accessibilityRole="button" onPress={close} hitSlop={8}>
              <Feather name="x" size={iconSize.lg} color={colors.text} />
            </Pressable>
          </View>

          <View className="mt-4 gap-3">
            <AppTextInput
              label="Community name"
              placeholder="e.g. Founders Community"
              value={name}
              onChangeText={setName}
            />
            <AppTextInput
              label="Description (optional)"
              placeholder="What's this community about?"
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <Pressable
              accessibilityRole="button"
              onPress={() => setIsPickerVisible(true)}
              className="flex-row items-center justify-between rounded-md border border-input bg-background px-3 py-3"
            >
              <AppText size="sm" tone={memberNames.length ? "default" : "muted"}>
                {memberNames.length ? `${memberNames.length} people invited` : "Invite members (optional)"}
              </AppText>
              <Feather name="user-plus" size={iconSize.md} color={colors.muted} />
            </Pressable>
          </View>

          <View className="mt-4 flex-row gap-3">
            <AppButton label="Cancel" variant="outline" onPress={close} className="flex-1" />
            <AppButton
              label="Create"
              loading={isCreating}
              disabled={!name.trim()}
              onPress={submit}
              className="flex-1"
            />
          </View>
        </View>
      </View>

      <PeoplePickerModal
        visible={isPickerVisible}
        selectedIds={memberIds}
        onClose={() => setIsPickerVisible(false)}
        onDone={(ids, people) => {
          setMemberIds(ids);
          setMemberNames(people.map((p) => p.fullName));
          setIsPickerVisible(false);
        }}
      />
    </Modal>
  );
};
