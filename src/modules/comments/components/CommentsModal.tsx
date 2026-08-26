import { ElementRef, useCallback, useEffect, useMemo, useRef } from "react";
import { Alert, ActivityIndicator, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetTextInput,
  TouchableOpacity
} from "@gorhom/bottom-sheet";
import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText } from "@/components/ui/AppText";
import { Avatar } from "@/components/ui/Avatar";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { ThreadedComment, usePostComments } from "@/modules/comments/hooks";
import { Comment } from "@/modules/comments/types";

type CommentsModalProps = {
  visible: boolean;
  onClose: () => void;
  postId: string;
  initialComments: Comment[];
};

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
              <TouchableOpacity accessibilityRole="button" disabled={isDeleting} onPress={onDelete}>
                <AppText tone="danger" size="xs">
                  {isDeleting ? "Deleting" : "Delete"}
                </AppText>
              </TouchableOpacity>
            ) : null}
          </View>
          <AppText size="sm" className="mt-1 leading-relaxed">
            {comment.content}
          </AppText>
        </View>
        {!isReply ? (
          <TouchableOpacity accessibilityRole="button" onPress={onReply} style={{ marginTop: 4, alignSelf: "flex-start", paddingHorizontal: 4, paddingVertical: 2 }}>
            <AppText tone="muted" size="xs" weight="medium">
              Reply
            </AppText>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

export const CommentsModal = ({ visible, onClose, postId, initialComments }: CommentsModalProps) => {
  const colors = useThemeTokens();
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<ElementRef<typeof BottomSheetModal>>(null);
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
  } = usePostComments(postId, initialComments);

  useEffect(() => {
    if (visible) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
  }, [visible]);

  const emptyMessage = useMemo(() => (isLoading ? "Loading…" : "Be the first to comment on this post."), [isLoading]);

  const confirmDeleteComment = useCallback(
    (id: string) => {
      Alert.alert("Delete comment", "Remove this comment from the post?", [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => void deleteComment(id) }
      ]);
    },
    [deleteComment]
  );

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" />
    ),
    []
  );

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={["80%"]}
      onDismiss={onClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.card }}
      handleIndicatorStyle={{ backgroundColor: colors.border }}
      // The old plain RN <Modal> defaulted to Android's "adjustPan" for its
      // window, which is what made the Send button eat its first tap — the
      // keyboard-close pan shifted this row mid-touch. adjustResize actually
      // resizes the sheet's content around the keyboard instead of panning
      // the whole window, which this library can then account for properly.
      android_keyboardInputMode="adjustResize"
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
    >
      <View className="flex-row items-center justify-between border-b border-border px-5 py-4">
        <AppText size="lg" weight="bold">
          Comments
        </AppText>
        <TouchableOpacity onPress={onClose} accessibilityRole="button" accessibilityLabel="Close">
          <Feather name="x" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <BottomSheetFlatList
        data={threadedComments}
        keyExtractor={(item: ThreadedComment) => item.comment.id}
        contentContainerStyle={{ padding: 16, gap: 12, flexGrow: 1 }}
        ListEmptyComponent={
          <AppText tone="muted" size="xs" className="mt-6 text-center">
            {emptyMessage}
          </AppText>
        }
        renderItem={({ item }: { item: ThreadedComment }) => (
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
          <TouchableOpacity accessibilityRole="button" onPress={cancelReply}>
            <Feather name="x" size={16} color={colors.muted} />
          </TouchableOpacity>
        </View>
      ) : null}

      <View
        className="flex-row items-center gap-2 border-t border-border px-4 py-3"
        style={{ paddingBottom: Math.max(insets.bottom, 12) }}
      >
        <BottomSheetTextInput
          value={draft}
          onChangeText={setDraft}
          placeholder={replyingTo ? "Write a reply…" : "Write a comment…"}
          placeholderTextColor={colors.muted}
          selectionColor={colors.primary}
          maxLength={1000}
          // style, not className: BottomSheetTextInput isn't a NativeWind-
          // instrumented component, so a className prop here would silently
          // apply no styling at all.
          style={{
            minHeight: 40,
            flex: 1,
            borderRadius: 6,
            borderWidth: 1,
            borderColor: colors.input,
            backgroundColor: colors.background,
            paddingHorizontal: 12,
            paddingVertical: 8,
            fontSize: 14,
            lineHeight: 20,
            color: colors.text
          }}
        />
        <TouchableOpacity
          accessibilityRole="button"
          disabled={isSubmitting}
          onPress={() => void submitComment()}
          style={{
            height: 32,
            paddingHorizontal: 12,
            borderRadius: 6,
            backgroundColor: colors.primary,
            alignItems: "center",
            justifyContent: "center",
            opacity: isSubmitting ? 0.5 : 1
          }}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.onPrimary} size="small" />
          ) : (
            <AppText size="xs" weight="medium" tone="onPrimary">
              {replyingTo ? "Reply" : "Send"}
            </AppText>
          )}
        </TouchableOpacity>
      </View>
    </BottomSheetModal>
  );
};
