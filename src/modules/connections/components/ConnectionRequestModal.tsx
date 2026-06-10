import { useState } from "react";
import { Modal, Pressable, View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { AppTextInput } from "@/components/ui/AppTextInput";

type ConnectionRequestModalProps = {
  visible: boolean;
  recipientName: string;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (note: string) => Promise<boolean>;
};

export const ConnectionRequestModal = ({
  visible,
  recipientName,
  isSubmitting,
  onClose,
  onSubmit
}: ConnectionRequestModalProps) => {
  const [note, setNote] = useState("");

  const handleSubmit = async () => {
    const success = await onSubmit(note);
    if (success) {
      setNote("");
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
        <Pressable className="rounded-t-2xl bg-surface p-5" onPress={(event) => event.stopPropagation()}>
          <AppText size="lg" weight="bold">
            Add a note
          </AppText>
          <AppText tone="muted" className="mt-2 leading-6">
            Introduce yourself to {recipientName}. They will need to accept before you can message.
          </AppText>
          <AppTextInput
            label="Your message"
            value={note}
            onChangeText={setNote}
            multiline
            placeholder="Hi, I'd love to connect because..."
            className="mt-4 h-28 py-3"
            textAlignVertical="top"
          />
          <View className="mt-5 flex-row gap-3">
            <AppButton label="Cancel" variant="outline" onPress={onClose} className="flex-1" />
            <AppButton
              label="Send request"
              loading={isSubmitting}
              disabled={!note.trim()}
              onPress={() => void handleSubmit()}
              className="flex-1"
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
