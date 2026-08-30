import { create } from "zustand";
import * as ImagePicker from "expo-image-picker";
import { postApi } from "@/modules/post/api";
import { CreatePostPayload, Post, UpdatePostPayload } from "@/modules/post/types";
import { useToastStore } from "@/store/toastStore";
import { toAppError } from "@/utils/errors";

const PAGE_SIZE = 10;

type PostState = {
  posts: Post[];
  page: number;
  hasMore: boolean;
  selectedPost: Post | null;
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  isSubmitting: boolean;
  isDetailLoading: boolean;
  deletingPostId: string | null;
  errorMessage: string | null;
  detailErrorMessage: string | null;
  loadPosts: () => Promise<void>;
  loadMorePosts: () => Promise<void>;
  refreshPosts: () => Promise<void>;
  getPostById: (id: string) => Promise<void>;
  clearSelectedPost: () => void;
  createPost: (payload: CreatePostPayload, files: ImagePicker.ImagePickerAsset[]) => Promise<boolean>;
  updatePost: (id: string, payload: UpdatePostPayload) => Promise<boolean>;
  deletePost: (id: string) => Promise<boolean>;
};

const sortPosts = (posts: Post[]) =>
  [...posts].sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime());

export const usePostStore = create<PostState>((set, get) => ({
  posts: [],
  page: 1,
  hasMore: true,
  selectedPost: null,
  isLoading: false,
  isRefreshing: false,
  isLoadingMore: false,
  isSubmitting: false,
  isDetailLoading: false,
  deletingPostId: null,
  errorMessage: null,
  detailErrorMessage: null,
  loadPosts: async () => {
    set({ isLoading: true, errorMessage: null });

    try {
      const posts = await postApi.getPosts(1, PAGE_SIZE);
      set({ posts: sortPosts(posts), page: 1, hasMore: posts.length === PAGE_SIZE, isLoading: false });
    } catch (error) {
      const appError = toAppError(error);
      set({ errorMessage: appError.message, isLoading: false });
    }
  },
  loadMorePosts: async () => {
    if (get().isLoadingMore || !get().hasMore) return;

    set({ isLoadingMore: true, errorMessage: null });

    try {
      const nextPage = get().page + 1;
      const posts = await postApi.getPosts(nextPage, PAGE_SIZE);
      set((state) => ({
        posts: sortPosts([...state.posts, ...posts]),
        page: nextPage,
        hasMore: posts.length === PAGE_SIZE,
        isLoadingMore: false
      }));
    } catch (error) {
      const appError = toAppError(error);
      set({ errorMessage: appError.message, isLoadingMore: false });
    }
  },
  refreshPosts: async () => {
    set({ isRefreshing: true, errorMessage: null });

    try {
      const posts = await postApi.getPosts(1, PAGE_SIZE);
      set({ posts: sortPosts(posts), page: 1, hasMore: posts.length === PAGE_SIZE, isRefreshing: false });
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
