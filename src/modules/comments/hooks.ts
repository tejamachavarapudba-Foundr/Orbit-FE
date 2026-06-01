import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuthStore } from "@/modules/auth/store";
import { useCommentStore } from "@/modules/comments/store";

export const usePostComments = (postId: string) => {
  const currentUserId = useAuthStore((state) => state.user?.profile.id);
  const comments = useCommentStore((state) => state.comments);
  const isLoading = useCommentStore((state) => state.isLoading);
  const isSubmitting = useCommentStore((state) => state.isSubmittingByPostId[postId] ?? false);
  const deletingCommentId = useCommentStore((state) => state.deletingCommentId);
  const errorMessage = useCommentStore((state) => state.errorMessage);
  const loadComments = useCommentStore((state) => state.loadComments);
  const createComment = useCommentStore((state) => state.createComment);
  const deleteComment = useCommentStore((state) => state.deleteComment);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (comments.length === 0 && !isLoading) {
      void loadComments();
    }
  }, [comments.length, isLoading, loadComments]);

  const postComments = useMemo(() => comments.filter((comment) => comment.postId === postId), [comments, postId]);

  const submitComment = useCallback(async () => {
    const content = draft.trim();

    if (!content) {
      return false;
    }

    const didSucceed = await createComment(postId, content);
    if (didSucceed) {
      setDraft("");
    }

    return didSucceed;
  }, [createComment, draft, postId]);

  return {
    currentUserId,
    comments: postComments,
    commentsCount: postComments.length,
    isLoading,
    isSubmitting,
    deletingCommentId,
    errorMessage,
    draft,
    setDraft,
    submitComment,
    deleteComment
  };
};
