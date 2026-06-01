import { memo, useMemo } from "react";
import { Alert, Pressable, TextInput, View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { Skeleton } from "@/components/ui/Skeleton";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { usePostComments } from "@/modules/comments/hooks";

type CommentsPanelProps = {
  postId: string;
};

const formatDate = (date: string) =>
  new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric"
  }).format(new Date(date));

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "SH";

export const CommentsPanel = memo(({ postId }: CommentsPanelProps) => {
  const colors = useThemeTokens();
  const {
    currentUserId,
    comments,
    commentsCount,
    isLoading,
    isSubmitting,
    deletingCommentId,
    errorMessage,
    draft,
    setDraft,
    submitComment,
    deleteComment
  } = usePostComments(postId);

  const header = useMemo(() => `${commentsCount} ${commentsCount === 1 ? "comment" : "comments"}`, [commentsCount]);

  return (
    <View className="mt-4 border-t border-border pt-4">
      <AppText weight="semibold">{header}</AppText>

      <View className="mt-3 gap-3">
        {isLoading ? (
          <View className="gap-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-4/5" />
          </View>
        ) : comments.length > 0 ? (
          comments.map((comment) => {
            const authorName = comment.author?.fullName || `Member ${comment.authorId.slice(0, 8)}`;
            const isOwnComment = currentUserId === comment.authorId;
            const isDeleting = deletingCommentId === comment.id;

            return (
              <View key={comment.id} className="rounded-md bg-background p-3">
                <View className="flex-row gap-3">
                  <View className="h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                    <AppText tone="primary" size="sm" weight="bold">
                      {getInitials(authorName)}
                    </AppText>
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-start gap-2">
                      <View className="flex-1">
                        <AppText weight="semibold" size="sm">
                          {authorName}
                        </AppText>
                        <AppText tone="muted" size="xs">
                          {formatDate(comment.createdAt)}
                        </AppText>
                      </View>
                      {isOwnComment ? (
                        <Pressable
                          accessibilityRole="button"
                          disabled={isDeleting}
                          onPress={() =>
                            Alert.alert("Delete comment", "Remove this comment from the post?", [
                              { text: "Cancel", style: "cancel" },
                              { text: "Delete", style: "destructive", onPress: () => void deleteComment(comment.id) }
                            ])
                          }
                        >
                          <AppText tone="danger" size="sm">
                            {isDeleting ? "Deleting" : "Delete"}
                          </AppText>
                        </Pressable>
                      ) : null}
                    </View>
                    <AppText className="mt-2 leading-5">{comment.content}</AppText>
                  </View>
                </View>
              </View>
            );
          })
        ) : (
          <AppText tone="muted" size="sm">
            Be the first to comment on this post.
          </AppText>
        )}
      </View>

      {errorMessage ? (
        <AppText tone="danger" size="sm" className="mt-3">
          {errorMessage}
        </AppText>
      ) : null}

      <View className="mt-4 gap-3">
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Write a comment..."
          placeholderTextColor={colors.muted}
          selectionColor={colors.primary}
          multiline
          textAlignVertical="top"
          className="min-h-16 rounded-md border border-border bg-background px-4 py-3 text-base text-text"
        />
        <AppButton
          label="Post comment"
          loading={isSubmitting}
          disabled={!draft.trim()}
          onPress={() => void submitComment()}
          className="h-10"
        />
      </View>
    </View>
  );
});

CommentsPanel.displayName = "CommentsPanel";
