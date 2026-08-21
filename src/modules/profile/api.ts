import { apiClient } from "@/services/api/client";
import { normalizeAuthProfile } from "@/modules/profile/normalizeProfile";
import { Profile, UpdateAvatarPayload, UpdateProfilePayload } from "@/modules/profile/types";
import { UpdateResumePayload } from "@/modules/profile/types";

export const profileApi = {
  getProfiles: async () => {
    const response = await apiClient.get<Profile[]>("/profiles");
    return response.data.map((profile) => normalizeAuthProfile(profile));
  },
  getProfileById: async (id: string) => {
    const response = await apiClient.get<Profile>(`/profiles/${id}`);
    return normalizeAuthProfile(response.data);
  },
  updateMe: async (payload: UpdateProfilePayload) => {
    const response = await apiClient.patch<Profile>("/profiles/me", payload);
    return normalizeAuthProfile(response.data);
  },
  updateAvatar: async (payload: UpdateAvatarPayload) => {
    const response = await apiClient.patch<Profile>("/profiles/me/avatar", payload);
    return normalizeAuthProfile(response.data);
  },
  updateResume: async (
    payload: UpdateResumePayload,
  ) => {
    const response =
      await apiClient.patch<Profile>(
        "/profiles/me/resume",
        payload,
      );

    return normalizeAuthProfile(
      response.data,
    );
  },

  deleteResume: async () => {
    const response = await apiClient.delete<Profile>(
      "/profiles/me/resume",
    );
  
    return normalizeAuthProfile(response.data);
  },
};

