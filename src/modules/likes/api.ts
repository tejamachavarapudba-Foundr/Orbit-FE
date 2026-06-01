import { apiClient } from "@/services/api/client";
import { Like, ToggleLikeResponse } from "@/modules/likes/types";

export const likesApi = {
  getLikes: async () => {
    const response = await apiClient.get<Like[]>("/likes", { data: {} });
    return response.data;
  },
  toggleLike: async (postId: string) => {
    const response = await apiClient.post<ToggleLikeResponse>(`/likes/${postId}`, {});
    return response.data;
  }
};
