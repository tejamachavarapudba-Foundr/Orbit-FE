import { useCallback, useMemo, useState } from "react";

import { useAuthStore } from "@/modules/auth/store";
import { useCommentStore } from "@/modules/comments/store";
import { Comment } from "@/modules/comments/types";

export const usePostComments = (
  postId: string,
  initialComments: Comment[],
) => {
  const currentUserId = useAuthStore(
    (state) => state.user?.profile.id,
  );

  const isLoading = useCommentStore(
    (state) => state.isLoading,
  );

  const isSubmitting = useCommentStore(
    (state) =>
      state.isSubmittingByPostId[postId] ??
      false,
  );

  const deletingCommentId =
    useCommentStore(
      (state) => state.deletingCommentId,
    );

  const errorMessage = useCommentStore(
    (state) => state.errorMessage,
  );

  const createComment =
    useCommentStore(
      (state) => state.createComment,
    );

  const deleteComment =
    useCommentStore(
      (state) => state.deleteComment,
    );

  const [draft, setDraft] =
    useState("");

  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);

    const comments = useCommentStore(
      state => state.comments,
  );

  // Merge, don't replace — `comments` only holds what THIS session created
  // (via createComment), never a full server fetch. Switching to it whenever
  // it's non-empty threw away every other commenter's comment the instant
  // you posted your own.
  const postComments = useMemo(() => {

      const liveComments =
          comments.filter(
              c => c.postId === postId,
          );

      const liveIds = new Set(liveComments.map((c) => c.id));
      const baseline = initialComments.filter((c) => !liveIds.has(c.id));

      return [...baseline, ...liveComments];

  }, [
      comments,
      initialComments,
      postId,
  ]);

  // LinkedIn-style one level of nesting — replies attach under their parent,
  // no reply-to-a-reply, so a flat two-pass split is all this needs. Top-level
  // comments show newest first; replies within a thread stay chronological
  // (oldest first), since a reply thread reads top-to-bottom like a
  // conversation even when the comments above it are newest-first.
  const threadedComments = useMemo(() => {
    const topLevel = postComments
      .filter((comment) => !comment.parentId)
      .sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime());

    return topLevel.map((comment) => ({
      comment,
      replies: postComments
        .filter((reply) => reply.parentId === comment.id)
        .sort((first, second) => new Date(first.createdAt).getTime() - new Date(second.createdAt).getTime())
    }));
  }, [postComments]);

  const startReply = useCallback((comment: Comment) => {
    setReplyingTo(comment);
  }, []);

  const cancelReply = useCallback(() => {
    setReplyingTo(null);
  }, []);

  const submitComment =
    useCallback(async () => {
      const content = draft.trim();

      if (!content) {
        return false;
      }

      const didSucceed =
        await createComment(
          postId,
          content,
          replyingTo?.id,
        );

      if (didSucceed) {
        setDraft("");
        setReplyingTo(null);
      }

      return didSucceed;
    }, [
      createComment,
      draft,
      postId,
      replyingTo,
    ]);

  return {
    currentUserId,
    comments: postComments,
    threadedComments,
    commentsCount:
      postComments.length,
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
    deleteComment,
  };
};