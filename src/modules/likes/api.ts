import { apiClient } from "@/services/api/client";
import { Like, ToggleLikeResponse } from "@/modules/likes/types";

export const likesApi = {
  getLikes: async (postId: string) => {
    const response = await apiClient.get<Like[]>(`/likes?postId=${postId}`);
    return response.data;
  },
  toggleLike: async (postId: string) => {
    const response = await apiClient.post<ToggleLikeResponse>(`/likes/${postId}`, {});
    return response.data;
  }
};
