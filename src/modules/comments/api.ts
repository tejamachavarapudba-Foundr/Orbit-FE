import { apiClient } from "@/services/api/client";
import { Comment, CommentResponse, CreateCommentPayload } from "@/modules/comments/types";

export const commentsApi = {
  getComments: async () => {
    const response = await apiClient.get<Comment[]>("/comments");
    return response.data;
  },
  createComment: async (payload: CreateCommentPayload) => {
    const response = await apiClient.post<CommentResponse>("/comments", payload);
    return response.data;
  },
  deleteComment: async (id: string) => {
    const response = await apiClient.delete<CommentResponse>(`/comments/${id}`);
    return response.data;
  }
};
