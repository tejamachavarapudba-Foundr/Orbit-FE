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

    const comments = useCommentStore(
      state => state.comments,
  );
  
  const postComments = useMemo(() => {
  
      const liveComments =
          comments.filter(
              c => c.postId === postId,
          );
  
      return liveComments.length > 0
          ? liveComments
          : initialComments;
  
  }, [
      comments,
      initialComments,
      postId,
  ]);

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
        );

      if (didSucceed) {
        setDraft("");
      }

      return didSucceed;
    }, [
      createComment,
      draft,
      postId,
    ]);

  return {
    currentUserId,
    comments: postComments,
    commentsCount:
      postComments.length,
    isLoading,
    isSubmitting,
    deletingCommentId,
    errorMessage,
    draft,
    setDraft,
    submitComment,
    deleteComment,
  };
};