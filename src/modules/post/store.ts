import { create } from "zustand";
import * as ImagePicker from "expo-image-picker";
import { postApi } from "@/modules/post/api";
import { CreatePostPayload, Post, UpdatePostPayload } from "@/modules/post/types";
import { useToastStore } from "@/store/toastStore";
import { toAppError } from "@/utils/errors";

type PostState = {
  posts: Post[];
  selectedPost: Post | null;
  isLoading: boolean;
  isRefreshing: boolean;
  isSubmitting: boolean;
  isDetailLoading: boolean;
  deletingPostId: string | null;
  errorMessage: string | null;
  detailErrorMessage: string | null;
  loadPosts: () => Promise<void>;
  refreshPosts: () => Promise<void>;
  getPostById: (id: string) => Promise<void>;
  clearSelectedPost: () => void;
  createPost: (payload: CreatePostPayload, files: ImagePicker.ImagePickerAsset[]) => Promise<boolean>;
  updatePost: (id: string, payload: UpdatePostPayload) => Promise<boolean>;
  deletePost: (id: string) => Promise<boolean>;
};

const sortPosts = (posts: Post[]) =>
  [...posts].sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime());

export const usePostStore = create<PostState>((set) => ({
  posts: [],
  selectedPost: null,
  isLoading: false,
  isRefreshing: false,
  isSubmitting: false,
  isDetailLoading: false,
  deletingPostId: null,
  errorMessage: null,
  detailErrorMessage: null,
  loadPosts: async () => {
    set({ isLoading: true, errorMessage: null });

    try {
      const posts = await postApi.getPosts();
      set({ posts: sortPosts(posts), isLoading: false });
    } catch (error) {
      const appError = toAppError(error);
      set({ errorMessage: appError.message, isLoading: false });
    }
  },
  refreshPosts: async () => {
    set({ isRefreshing: true, errorMessage: null });

    try {
      const posts = await postApi.getPosts();
      set({ posts: sortPosts(posts), isRefreshing: false });
    } catch (error) {
      const appError = toAppError(error);
      set({ errorMessage: appError.message, isRefreshing: false });
    }
  },
  getPostById: async (id) => {
    set({ isDetailLoading: true, detailErrorMessage: null });

    try {
      const selectedPost = await postApi.getPostById(id);
      set({ selectedPost, isDetailLoading: false });
    } catch (error) {
      const appError = toAppError(error);
      set({ detailErrorMessage: appError.message, isDetailLoading: false });
    }
  },
  clearSelectedPost: () => set({ selectedPost: null, detailErrorMessage: null }),
  createPost: async (payload, files) => {
    set({ isSubmitting: true, errorMessage: null });
    
    try {
      const post = await postApi.createPost(payload, files);
      console.log(
        "NEW POST FROM API:",
        JSON.stringify(post, null, 2),
      );
      set((state) => ({ posts: sortPosts([post, ...state.posts]), isSubmitting: false }));
      useToastStore.getState().show({ type: "success", title: "Post published" });
      return true;
    } catch (error) {
      const appError = toAppError(error);
      set({ errorMessage: appError.message, isSubmitting: false });
      useToastStore.getState().show({ type: "error", title: "Post failed", message: appError.message });
      return false;
    }
  },
  updatePost: async (id, payload) => {
    set({ isSubmitting: true, errorMessage: null });

    try {
      const updatedPost = await postApi.updatePost(id, payload);
      set((state) => ({
        posts: sortPosts(state.posts.map((post) => (post.id === id ? updatedPost : post))),
        selectedPost: state.selectedPost?.id === id ? updatedPost : state.selectedPost,
        isSubmitting: false
      }));
      useToastStore.getState().show({ type: "success", title: "Post updated" });
      return true;
    } catch (error) {
      const appError = toAppError(error);
      set({ errorMessage: appError.message, isSubmitting: false });
      useToastStore.getState().show({ type: "error", title: "Update failed", message: appError.message });
      return false;
    }
  },
  deletePost: async (id) => {
    set({ deletingPostId: id, errorMessage: null });

    try {
      await postApi.deletePost(id);
      set((state) => ({
        posts: state.posts.filter((post) => post.id !== id),
        selectedPost: state.selectedPost?.id === id ? null : state.selectedPost,
        deletingPostId: null
      }));
      useToastStore.getState().show({ type: "success", title: "Post deleted" });
      return true;
    } catch (error) {
      const appError = toAppError(error);
      set({ errorMessage: appError.message, deletingPostId: null });
      useToastStore.getState().show({ type: "error", title: "Delete failed", message: appError.message });
      return false;
    }
  }
}));
