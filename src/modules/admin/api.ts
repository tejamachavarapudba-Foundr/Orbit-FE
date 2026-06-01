import { apiClient } from "@/services/api/client";
import {
  AdminPostDeleteResponse,
  AdminStats,
  AdminUser,
  BanUserPayload,
  BanUserResponse,
  PaginatedResponse
} from "@/modules/admin/types";

export const adminApi = {
  getStats: async () => {
    const response = await apiClient.get<AdminStats>("/admin/stats");
    return response.data;
  },
  getUsers: async (page = 1, limit = 50) => {
    const response = await apiClient.get<PaginatedResponse<AdminUser>>("/admin/users", {
      params: { page, limit }
    });
    return response.data;
  },
  banUser: async (id: string, payload: BanUserPayload) => {
    const response = await apiClient.patch<BanUserResponse>(`/admin/users/${id}/ban`, payload);
    return response.data;
  },
  deletePost: async (id: string) => {
    const response = await apiClient.delete<AdminPostDeleteResponse>(`/admin/posts/${id}`);
    return response.data;
  }
};
