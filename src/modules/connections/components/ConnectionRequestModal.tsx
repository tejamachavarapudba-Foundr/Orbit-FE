import { useState } from "react";
import { Modal, Pressable, View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { useThemeTokens } from "@/hooks/useThemeTokens";

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
  const colors = useThemeTokens();
  const [note, setNote] = useState("");

  const handleSubmit = async () => {
    const success = await onSubmit(note);
    if (success) {
      setNote("");
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
        <Pressable
          className="w-full rounded-t-2xl p-5"
          style={{ backgroundColor: colors.surface }}
          onPress={(event) => event.stopPropagation()}
        >
          <AppText size="lg" weight="bold">
            Add a note (optional)
          </AppText>
          <AppText tone="muted" className="mt-2 leading-6">
            Introduce yourself to {recipientName}, or just send the invite as-is.
          </AppText>
          <AppTextInput
            label="Your message"
            value={note}
            onChangeText={setNote}
            multiline
            placeholder="Hi, I'm interested in connecting because..."
            className="mt-4 h-28 py-3"
            textAlignVertical="top"
          />
          <View className="mt-5 flex-row gap-3">
            <AppButton label="Cancel" variant="outline" size="sm" onPress={onClose} className="flex-1 rounded-full" />
            <AppButton
              label={note.trim() ? "Send invitation" : "Send without a note"}
              size="sm"
              loading={isSubmitting}
              onPress={() => void handleSubmit()}
              className="flex-1 rounded-full"
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
