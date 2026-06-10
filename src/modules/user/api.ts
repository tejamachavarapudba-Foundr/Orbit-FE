import { apiClient } from "@/services/api/client";
import { AuthProfile as UserProfile } from "@/modules/auth/types";
import { normalizeAuthProfile } from "@/modules/profile/normalizeProfile";
import { DeleteAccountResponse } from "@/modules/user/types";

export const userApi = {
  getUsers: async () => {
    const response = await apiClient.get<UserProfile[]>("/profiles");
    return response.data.map((profile) => {
      const normalized = normalizeAuthProfile(profile);
      return {
        id: normalized.id,
        profile: normalized,
        createdAt: normalized.createdAt
      };
    });
  },
  getUserById: async (id: string) => {
    const response = await apiClient.get<UserProfile>(`/profiles/${id}`);
    const normalized = normalizeAuthProfile(response.data);
    return {
      id: normalized.id,
      profile: normalized,
      createdAt: normalized.createdAt
    };
  },
  deleteMe: async () => {
    const response = await apiClient.delete<DeleteAccountResponse>("/users/me", { data: {} });
    return response.data;
  }
};
