import { useMemo } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { Avatar } from "@/components/ui/Avatar";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { usePostComments } from "@/modules/comments/hooks";
import { Comment } from "@/modules/comments/types";

type CommentsModalProps = {
  visible: boolean;
  onClose: () => void;
  postId: string;
  initialComments: Comment[];
};

export const CommentsModal = ({ visible, onClose, postId, initialComments }: CommentsModalProps) => {
  const colors = useThemeTokens();
  const insets = useSafeAreaInsets();
  const {
    currentUserId,
    comments,
    isLoading,
    isSubmitting,
    deletingCommentId,
    errorMessage,
    draft,
    setDraft,
    submitComment,
    deleteComment
  } = usePostComments(postId, initialComments);

  const emptyMessage = useMemo(() => (isLoading ? "Loading…" : "Be the first to comment on this post."), [isLoading]);

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ width: "100%", maxHeight: "80%" }}
        >
          <View className="rounded-t-3xl bg-card" style={{ height: "100%" }}>
            <View className="flex-row items-center justify-between border-b border-border px-5 py-4">
              <AppText size="lg" weight="bold">
                Comments
              </AppText>
              <Pressable onPress={onClose} hitSlop={8} accessibilityRole="button" accessibilityLabel="Close">
                <Feather name="x" size={22} color={colors.text} />
              </Pressable>
            </View>

            <FlatList
              data={comments}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ padding: 16, gap: 12, flexGrow: 1 }}
              ListEmptyComponent={
                <AppText tone="muted" size="xs" className="mt-6 text-center">
                  {emptyMessage}
                </AppText>
              }
              renderItem={({ item: comment }) => {
                const authorName = comment.author?.fullName || `Member ${comment.authorId.slice(0, 8)}`;
                const isOwnComment = currentUserId === comment.authorId;
                const isDeleting = deletingCommentId === comment.id;

                return (
                  <View className="flex-row gap-2">
                    <Avatar name={authorName} imageUrl={comment.author?.avatarUrl ?? ""} size="sm" fallback="mesh" />
                    <View className="min-w-0 flex-1 rounded-lg bg-muted-bg px-3 py-2">
                      <View className="flex-row items-center justify-between gap-2">
                        <AppText size="xs" weight="medium">
                          {authorName}
                        </AppText>
                        {isOwnComment ? (
                          <Pressable
                            accessibilityRole="button"
                            disabled={isDeleting}
                            onPress={() =>
                              Alert.alert("Delete comment", "Remove this comment from the post?", [
                                { text: "Cancel", style: "cancel" },
                                {
                                  text: "Delete",
                                  style: "destructive",
                                  onPress: () => void deleteComment(comment.id)
                                }
                              ])
                            }
                          >
                            <AppText tone="danger" size="xs">
                              {isDeleting ? "Deleting" : "Delete"}
                            </AppText>
                          </Pressable>
                        ) : null}
                      </View>
                      <AppText size="sm" className="mt-1 leading-relaxed">
                        {comment.content}
                      </AppText>
                    </View>
                  </View>
                );
              }}
            />

            {errorMessage ? (
              <AppText tone="danger" size="sm" className="px-4">
                {errorMessage}
              </AppText>
            ) : null}

            <View
              className="flex-row items-center gap-2 border-t border-border px-4 py-3"
              style={{ paddingBottom: Math.max(insets.bottom, 12) }}
            >
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder="Write a comment…"
                placeholderTextColor={colors.muted}
                selectionColor={colors.primary}
                maxLength={1000}
                className="min-h-[40px] flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm leading-5 text-text"
              />
              <AppButton
                label="Send"
                size="sm"
                loading={isSubmitting}
                disabled={!draft.trim()}
                onPress={() => void submitComment()}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
});
