import { apiClient } from "@/services/api/client";
import { AuthProfile as UserProfile } from "@/modules/auth/types";
import { DeleteAccountResponse } from "@/modules/user/types";

export const userApi = {
  getUsers: async () => {
    const response = await apiClient.get<UserProfile[]>("/profiles");
    return response.data.map((profile) => ({
      id: profile.id,
      profile,
      createdAt: profile.createdAt
    }));
  },
  getUserById: async (id: string) => {
    const response = await apiClient.get<UserProfile>(`/profiles/${id}`);
    return {
      id: response.data.id,
      profile: response.data,
      createdAt: response.data.createdAt
    };
  },
  deleteMe: async () => {
    const response = await apiClient.delete<DeleteAccountResponse>("/users/me", { data: {} });
    return response.data;
  }
};
