import { apiClient } from "@/services/api/client";
import { CreatePostPayload, Post, UpdatePostPayload } from "@/modules/post/types";

export const postApi = {
  getPosts: async () => {
    const response = await apiClient.get<Post[]>("/posts");
    return response.data;
  },
  getPostById: async (id: string) => {
    const response = await apiClient.get<Post>(`/posts/${id}`);
    return response.data;
  },
  createPost: async (payload: CreatePostPayload) => {
    const response = await apiClient.post<Post>("/posts", payload);
    return response.data;
  },
  updatePost: async (id: string, payload: UpdatePostPayload) => {
    const response = await apiClient.patch<Post>(`/posts/${id}`, payload);
    return response.data;
  },
  deletePost: async (id: string) => {
    const response = await apiClient.delete<Post>(`/posts/${id}`, { data: { id } });
    return response.data;
  }
};
