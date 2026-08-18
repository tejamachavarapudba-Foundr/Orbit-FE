import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText } from "@/components/ui/AppText";
import { Card } from "@/components/ui/Card";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { PostComposer } from "@/modules/post/components/PostComposer";

type PostComposerModalProps = {
  visible: boolean;
  onClose: () => void;
};

export const PostComposerModal = ({ visible, onClose }: PostComposerModalProps) => {
  const colors = useThemeTokens();
  const insets = useSafeAreaInsets();
  // Android's native image/video picker can conflict with an RN <Modal>'s
  // own native Dialog window if both are shown at once — hide this modal
  // for the duration of the picker instead of layering them.
  const [isPickerActive, setIsPickerActive] = useState(false);

  return (
    <Modal
      visible={visible && !isPickerActive}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={{ width: "100%" }}>
          {Platform.OS === "ios" ? (
            <KeyboardAvoidingView behavior="padding">
              <SheetContent
                colors={colors}
                insets={insets}
                onClose={onClose}
                onBeforePickMedia={() => setIsPickerActive(true)}
                onAfterPickMedia={() => setIsPickerActive(false)}
              />
            </KeyboardAvoidingView>
          ) : (
            <SheetContent
              colors={colors}
              insets={insets}
              onClose={onClose}
              onBeforePickMedia={() => setIsPickerActive(true)}
              onAfterPickMedia={() => setIsPickerActive(false)}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

type SheetContentProps = {
  colors: ReturnType<typeof useThemeTokens>;
  insets: ReturnType<typeof useSafeAreaInsets>;
  onClose: () => void;
  onBeforePickMedia: () => void;
  onAfterPickMedia: () => void;
};

const SheetContent = ({ colors, insets, onClose, onBeforePickMedia, onAfterPickMedia }: SheetContentProps) => (
  <Card className="rounded-t-3xl" style={{ maxHeight: "92%" }}>
    <View className="flex-row items-center border-b border-border px-5 py-4">
      <View className="flex-1">
        <AppText size="xl" weight="bold">
          Create Post
        </AppText>
        <AppText tone="muted" size="sm">
          Share with the community
        </AppText>
      </View>
      <Pressable onPress={onClose} hitSlop={8} accessibilityRole="button" accessibilityLabel="Close">
        <Feather name="x" size={22} color={colors.text} />
      </Pressable>
    </View>

    <ScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator
      contentContainerStyle={{ padding: 16, paddingBottom: Math.max(insets.bottom, 16) }}
    >
      <PostComposer
        embedded
        onSuccess={onClose}
        onBeforePickMedia={onBeforePickMedia}
        onAfterPickMedia={onAfterPickMedia}
      />
    </ScrollView>
  </Card>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
});
