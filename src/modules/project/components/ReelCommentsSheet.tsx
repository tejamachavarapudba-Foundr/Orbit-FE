import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { AppImage } from "@/components/ui/AppImage";
import { AppText } from "@/components/ui/AppText";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { iconSize } from "@/theme/designTokens";
import { projectApi } from "@/modules/project/api";
import { ProjectComment } from "@/modules/project/types";
import { toAppError } from "@/utils/errors";
import { useToastStore } from "@/store/toastStore";

type ReelCommentsSheetProps = {
  visible: boolean;
  projectId: string | null;
  onClose: () => void;
  onCommentPosted?: (projectId: string) => void;
};

export const ReelCommentsSheet = ({ visible, projectId, onClose, onCommentPosted }: ReelCommentsSheetProps) => {
  const colors = useThemeTokens();
  const showToast = useToastStore((state) => state.show);
  const [comments, setComments] = useState<ProjectComment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [draft, setDraft] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const load = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const data = await projectApi.getProjectComments(id);
      setComments(data);
    } catch (error) {
      showToast({ type: "error", title: "Couldn't load comments", message: toAppError(error).message });
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (visible && projectId) {
      void load(projectId);
    } else {
      setComments([]);
      setDraft("");
    }
  }, [visible, projectId, load]);

  const handlePost = async () => {
    const content = draft.trim();
    if (!content || !projectId) return;

    setIsPosting(true);
    try {
      const created = await projectApi.postProjectComment(projectId, content);
      setComments((current) => [...current, created]);
      setDraft("");
      onCommentPosted?.(projectId);
    } catch (error) {
      showToast({ type: "error", title: "Couldn't post comment", message: toAppError(error).message });
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 justify-end"
      >
        <Pressable accessibilityRole="button" className="absolute bottom-0 left-0 right-0 top-0 bg-black/50" onPress={onClose} />

        <View className="h-[70%] rounded-t-2xl bg-card">
          <View className="flex-row items-center justify-between border-b border-border p-4">
            <AppText weight="bold" size="lg">
              Comments
            </AppText>
            <Pressable accessibilityRole="button" onPress={onClose} hitSlop={8}>
              <Feather name="x" size={iconSize.lg} color={colors.text} />
            </Pressable>
          </View>

          {isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : (
            <FlatList
              data={comments}
              keyExtractor={(item) => item.id}
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={9}
              updateCellsBatchingPeriod={50}
              contentContainerStyle={{ padding: 16, gap: 14 }}
              ListEmptyComponent={
                <AppText tone="muted" size="sm" className="text-center mt-6">
                  No comments yet. Be the first to say something.
                </AppText>
              }
              renderItem={({ item }) => (
                <View className="flex-row gap-3">
                  <View className="h-8 w-8 overflow-hidden rounded-full bg-muted-bg">
                    {item.author?.avatarUrl ? (
                      <AppImage source={{ uri: item.author.avatarUrl }} style={{ width: "100%", height: "100%" }} />
                    ) : null}
                  </View>
                  <View className="flex-1">
                    <AppText size="sm" weight="semibold">
                      {item.author?.fullName ?? "Someone"}
                    </AppText>
                    <AppText size="sm" className="mt-0.5">
                      {item.content}
                    </AppText>
                  </View>
                </View>
              )}
            />
          )}

          <View className="flex-row items-center gap-2 border-t border-border p-3">
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Add a comment..."
              placeholderTextColor={colors.muted}
              selectionColor={colors.primary}
              className="h-11 flex-1 rounded-full border border-input bg-background px-4 text-sm text-text"
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Post comment"
              onPress={() => void handlePost()}
              disabled={isPosting || !draft.trim()}
              className="h-11 w-11 items-center justify-center rounded-full bg-primary"
              style={{ opacity: isPosting || !draft.trim() ? 0.5 : 1 }}
            >
              <Feather name="send" size={iconSize.md} color={colors.onPrimary} />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
