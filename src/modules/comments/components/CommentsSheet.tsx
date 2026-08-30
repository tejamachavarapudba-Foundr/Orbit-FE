import { useMemo } from "react";
import { Alert, FlatList, Pressable, StyleSheet, TextInput, View } from "react-native";
import Animated, { useAnimatedKeyboard, useAnimatedStyle } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { Avatar } from "@/components/ui/Avatar";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { useCommentsSheetStore } from "@/modules/comments/commentsSheetStore";
import { usePostComments } from "@/modules/comments/hooks";
import { Comment } from "@/modules/comments/types";

type CommentRowProps = {
  comment: Comment;
  isReply: boolean;
  isOwnComment: boolean;
  isDeleting: boolean;
  onReply: () => void;
  onDelete: () => void;
};

const CommentRow = ({ comment, isReply, isOwnComment, isDeleting, onReply, onDelete }: CommentRowProps) => {
  const authorName = comment.author?.fullName || `Member ${comment.authorId.slice(0, 8)}`;

  return (
    <View className={`flex-row gap-2 ${isReply ? "ml-9" : ""}`}>
      <Avatar name={authorName} imageUrl={comment.author?.avatarUrl ?? ""} size="sm" fallback="mesh" />
      <View className="min-w-0 flex-1">
        <View className="rounded-lg bg-muted-bg px-3 py-2">
          <View className="flex-row items-center justify-between gap-2">
            <AppText size="xs" weight="medium">
              {authorName}
            </AppText>
            {isOwnComment ? (
              <Pressable accessibilityRole="button" disabled={isDeleting} onPress={onDelete}>
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
        {!isReply ? (
          <Pressable accessibilityRole="button" onPress={onReply} className="mt-1 self-start px-1 py-0.5">
            <AppText tone="muted" size="xs" weight="medium">
              Reply
            </AppText>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
};

// Rendered once at the screen level (not per post) — see the store's own
// comment for why this replaces a per-post RN <Modal>.
export const CommentsSheet = () => {
  const colors = useThemeTokens();
  const insets = useSafeAreaInsets();
  // Tracks the IME's real animation frame (native-driven), matching chat's
  // MessageThread — this sheet is mounted from FeedScreen, which sits inside
  // react-navigation's fragment-based tab navigation, where manual
  // Keyboard-event height tracking (this file's previous approach) produced
  // a gap above the keyboard because the offset math didn't reliably match
  // whatever resize behavior was or wasn't visible to this fragment.
  const keyboard = useAnimatedKeyboard();
  const keyboardPadding = useAnimatedStyle(() => ({ paddingBottom: keyboard.height.value }));
  const postId = useCommentsSheetStore((state) => state.postId);
  const initialComments = useCommentsSheetStore((state) => state.initialComments);
  const close = useCommentsSheetStore((state) => state.close);

  const {
    currentUserId,
    threadedComments,
    isLoading,
    isSubmitting,
    deletingCommentId,
    errorMessage,
    draft,
    setDraft,
    replyingTo,
    startReply,
    cancelReply,
    submitComment,
    deleteComment
  } = usePostComments(postId ?? "", initialComments);

  const emptyMessage = useMemo(() => (isLoading ? "Loading…" : "Be the first to comment on this post."), [isLoading]);

  const confirmDeleteComment = (id: string) => {
    Alert.alert("Delete comment", "Remove this comment from the post?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => void deleteComment(id) }
    ]);
  };

  if (!postId) {
    return null;
  }

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: "rgba(0,0,0,0.45)", zIndex: 40, elevation: 40 }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />

        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <Animated.View className="rounded-t-3xl bg-card" style={[{ height: "80%" }, keyboardPadding]}>
            <View className="flex-row items-center justify-between border-b border-border px-5 py-4">
              <AppText size="lg" weight="bold">
                Comments
              </AppText>
              <Pressable onPress={close} hitSlop={8} accessibilityRole="button" accessibilityLabel="Close">
                <Feather name="x" size={22} color={colors.text} />
              </Pressable>
            </View>

            <FlatList
              data={threadedComments}
              keyExtractor={(item) => item.comment.id}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ padding: 16, gap: 12, flexGrow: 1 }}
              ListEmptyComponent={
                <AppText tone="muted" size="xs" className="mt-6 text-center">
                  {emptyMessage}
                </AppText>
              }
              renderItem={({ item }) => (
                <View className="gap-2">
                  <CommentRow
                    comment={item.comment}
                    isReply={false}
                    isOwnComment={currentUserId === item.comment.authorId}
                    isDeleting={deletingCommentId === item.comment.id}
                    onReply={() => startReply(item.comment)}
                    onDelete={() => confirmDeleteComment(item.comment.id)}
                  />
                  {item.replies.map((reply) => (
                    <CommentRow
                      key={reply.id}
                      comment={reply}
                      isReply
                      isOwnComment={currentUserId === reply.authorId}
                      isDeleting={deletingCommentId === reply.id}
                      onReply={() => startReply(item.comment)}
                      onDelete={() => confirmDeleteComment(reply.id)}
                    />
                  ))}
                </View>
              )}
            />

            {errorMessage ? (
              <AppText tone="danger" size="sm" className="px-4">
                {errorMessage}
              </AppText>
            ) : null}

            {replyingTo ? (
              <View className="flex-row items-center justify-between border-t border-border bg-muted-bg px-4 py-2">
                <AppText tone="muted" size="xs">
                  Replying to <AppText size="xs" weight="semibold">{replyingTo.author?.fullName || "this comment"}</AppText>
                </AppText>
                <Pressable accessibilityRole="button" onPress={cancelReply} hitSlop={8}>
                  <Feather name="x" size={16} color={colors.muted} />
                </Pressable>
              </View>
            ) : null}

            <View
              className="flex-row items-center gap-2 border-t border-border px-4 py-3"
              style={{ paddingBottom: Math.max(insets.bottom, 12) }}
            >
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder={replyingTo ? "Write a reply…" : "Write a comment…"}
                placeholderTextColor={colors.muted}
                selectionColor={colors.primary}
                multiline
                textAlignVertical="center"
                maxLength={1000}
                className="max-h-28 min-h-10 flex-1 rounded-md border border-input bg-background px-3 py-2.5 text-sm leading-5 text-text"
              />
              <AppButton
                label={replyingTo ? "Reply" : "Send"}
                size="default"
                loading={isSubmitting}
                onPress={() => void submitComment()}
              />
            </View>
          </Animated.View>
        </View>
      </View>
    </View>
  );
};
