import { memo, useMemo } from "react";
import { Alert, Pressable, TextInput, View } from "react-native";
import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { Avatar } from "@/components/ui/Avatar";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { usePostComments } from "@/modules/comments/hooks";
import { Comment } from "@/modules/comments/types";

type CommentsPanelProps = {
  postId: string;
  initialComments: Comment[];
};

export const CommentsPanel = memo(({ postId, initialComments }: CommentsPanelProps) => {
  const colors = useThemeTokens();
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

  const emptyMessage = useMemo(() => (isLoading ? "Loading…" : null), [isLoading]);

  return (
    <View className="gap-3 pt-2">
      {isLoading ? (
        <AppText tone="muted" size="xs">
          {emptyMessage}
        </AppText>
      ) : comments.length > 0 ? (
        <View className="gap-3">
          {comments.map((comment) => {
            const authorName = comment.author?.fullName || `Member ${comment.authorId.slice(0, 8)}`;
            const isOwnComment = currentUserId === comment.authorId;
            const isDeleting = deletingCommentId === comment.id;

            return (
              <View key={comment.id} className="flex-row gap-2">
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
          })}
        </View>
      ) : (
        <AppText tone="muted" size="xs">
          Be the first to comment on this post.
        </AppText>
      )}

      {errorMessage ? (
        <AppText tone="danger" size="sm">
          {errorMessage}
        </AppText>
      ) : null}

      <View className="flex-row items-center gap-2">
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Write a comment…"
          placeholderTextColor={colors.muted}
          selectionColor={colors.primary}
          maxLength={1000}
          className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm text-text"
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
  );
});

CommentsPanel.displayName = "CommentsPanel";
