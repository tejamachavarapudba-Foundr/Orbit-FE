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

  return (
    <Modal
      visible={visible}
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
              <SheetContent colors={colors} insets={insets} onClose={onClose} />
            </KeyboardAvoidingView>
          ) : (
            <SheetContent colors={colors} insets={insets} onClose={onClose} />
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
};

const SheetContent = ({ colors, insets, onClose }: SheetContentProps) => (
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
      <PostComposer embedded onSuccess={onClose} />
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
