import { create } from "zustand";

import { commentsApi } from "@/modules/comments/api";
import { Comment } from "@/modules/comments/types";
import { useAuthStore } from "@/modules/auth/store";
import { useToastStore } from "@/store/toastStore";
import { toAppError } from "@/utils/errors";

type CommentState = {
  comments: Comment[];
  isLoading: boolean;
  isSubmittingByPostId: Record<string, boolean>;
  deletingCommentId: string | null;
  errorMessage: string | null;
  loadComments: () => Promise<void>;
  refreshComments: () => Promise<void>;
  createComment: (postId: string, content: string) => Promise<boolean>;
  deleteComment: (id: string) => Promise<boolean>;
};

const sortComments = (comments: Comment[]) =>
  [...comments].sort((first, second) => new Date(first.createdAt).getTime() - new Date(second.createdAt).getTime());

export const useCommentStore = create<CommentState>((set) => ({
  comments: [],
  isLoading: false,
  isSubmittingByPostId: {},
  deletingCommentId: null,
  errorMessage: null,
  loadComments: async () => {
    set({ isLoading: true, errorMessage: null });

    try {
      const comments = await commentsApi.getComments();
      set({ comments: sortComments(comments), isLoading: false });
    } catch (error) {
      const appError = toAppError(error);
      set({ errorMessage: appError.message, isLoading: false });
    }
  },
  refreshComments: async () => {
    try {
      const comments = await commentsApi.getComments();
      set({ comments: sortComments(comments), errorMessage: null });
    } catch (error) {
      const appError = toAppError(error);
      set({ errorMessage: appError.message });
    }
  },
  createComment: async (postId, content) => {
    set((state) => ({
      errorMessage: null,
      isSubmittingByPostId: {
        ...state.isSubmittingByPostId,
        [postId]: true
      }
    }));

    try {
      const createdComment = await commentsApi.createComment({ postId, content });
      const currentProfile = useAuthStore.getState().user?.profile;
      const enrichedComment: Comment = {
        ...createdComment,
        ...(currentProfile ? { author: currentProfile } : {})
      };

      set((state) => ({
        comments: sortComments([...state.comments, enrichedComment]),
        isSubmittingByPostId: {
          ...state.isSubmittingByPostId,
          [postId]: false
        }
      }));
      useToastStore.getState().show({ type: "success", title: "Comment posted" });
      return true;
    } catch (error) {
      const appError = toAppError(error);
      set((state) => ({
        errorMessage: appError.message,
        isSubmittingByPostId: {
          ...state.isSubmittingByPostId,
          [postId]: false
        }
      }));
      useToastStore.getState().show({ type: "error", title: "Comment failed", message: appError.message });
      return false;
    }
  },
  deleteComment: async (id) => {
    set({ deletingCommentId: id, errorMessage: null });

    try {
      await commentsApi.deleteComment(id);
      set((state) => ({
        comments: state.comments.filter((comment) => comment.id !== id),
        deletingCommentId: null
      }));
      useToastStore.getState().show({ type: "success", title: "Comment deleted" });
      return true;
    } catch (error) {
      const appError = toAppError(error);
      set({ errorMessage: appError.message, deletingCommentId: null });
      useToastStore.getState().show({ type: "error", title: "Delete failed", message: appError.message });
      return false;
    }
  }
}));
