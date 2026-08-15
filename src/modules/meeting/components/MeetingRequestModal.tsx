import { useCallback, useState } from "react";
import { Dimensions, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";

import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Card } from "@/components/ui/Card";
import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";

import { useThemeTokens } from "@/hooks/useThemeTokens";

import { MeetingRequestForm } from "./MeetingRequestForm";

const SCREEN_HEIGHT = Dimensions.get("window").height;

type Props = {
  visible: boolean;
  startupId: string;
  startupName?: string;
  onClose: () => void;
  onSuccess?: () => void;
};

export const MeetingRequestModal = ({ visible, startupId, startupName, onClose, onSuccess }: Props) => {
  const colors = useThemeTokens();
  const insets = useSafeAreaInsets();
  const [formState, setFormState] = useState({
    canSubmit: false,
    isSubmitting: false,
    submit: () => {}
  });

  const handleFormSuccess = useCallback(() => {
    onClose();
    onSuccess?.();
  }, [onClose, onSuccess]);

  const handleFormStateChange = useCallback(
    (state: { canSubmit: boolean; isSubmitting: boolean; submit: () => void }) => {
      setFormState((prev) =>
        prev.canSubmit === state.canSubmit && prev.isSubmitting === state.isSubmitting && prev.submit === state.submit
          ? prev
          : state
      );
    },
    []
  );

  const sheetHeight = Math.round(SCREEN_HEIGHT * 0.92);
  const footerPaddingBottom = Math.max(insets.bottom, 16);

  const sheet = (
    <View style={{ width: "100%", height: sheetHeight }}>
      <Card className="rounded-t-3xl" style={{ height: "100%", flexDirection: "column" }}>
        <View className="flex-row items-center border-b border-border px-5 py-5">
          <View style={{ flex: 1 }}>
            <AppText size="xl" weight="bold">
              Book Meeting
            </AppText>
            <AppText tone="muted" size="sm">
              {startupName || "Startup"}
            </AppText>
          </View>

          <Pressable onPress={onClose} hitSlop={8}>
            <Feather name="x" size={22} color={colors.text} />
          </Pressable>
        </View>

        <ScrollView
          style={{ flex: 1, minHeight: 0 }}
          contentContainerStyle={{ padding: 20, paddingBottom: 12 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator
          nestedScrollEnabled
        >
          <MeetingRequestForm
            startupId={startupId}
            showActions={false}
            onStateChange={handleFormStateChange}
            onCancel={onClose}
            onSuccess={handleFormSuccess}
          />
        </ScrollView>

        <View className="flex-row gap-3 border-t border-border px-5 pt-4" style={{ paddingBottom: footerPaddingBottom }}>
          <AppButton label="Cancel" variant="outline" className="flex-1" onPress={onClose} />
          <AppButton
            label="Send Request"
            className="flex-1"
            loading={formState.isSubmitting}
            disabled={!formState.canSubmit}
            onPress={formState.submit}
          />
        </View>
      </Card>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={{ width: "100%" }}>
          {Platform.OS === "ios" ? <KeyboardAvoidingView behavior="padding">{sheet}</KeyboardAvoidingView> : sheet}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)"
  }
});
