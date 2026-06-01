import { apiClient } from "@/services/api/client";
import { Profile, UpdateAvatarPayload, UpdateProfilePayload } from "@/modules/profile/types";

export const profileApi = {
  getProfiles: async () => {
    const response = await apiClient.get<Profile[]>("/profiles");
    return response.data;
  },
  getProfileById: async (id: string) => {
    const response = await apiClient.get<Profile>(`/profiles/${id}`);
    return response.data;
  },
  updateMe: async (payload: UpdateProfilePayload) => {
    const response = await apiClient.patch<Profile>("/profiles/me", payload);
    return response.data;
  },
  updateAvatar: async (payload: UpdateAvatarPayload) => {
    const response = await apiClient.post<Profile>("/profiles/me/avatar", payload);
    return response.data;
  }
};
