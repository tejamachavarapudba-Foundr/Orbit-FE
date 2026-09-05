import { apiClient } from "@/services/api/client";
import { AuthProfile as UserProfile } from "@/modules/auth/types";
import { normalizeAuthProfile } from "@/modules/profile/normalizeProfile";
import { DeleteAccountResponse, UserFilters } from "@/modules/user/types";

type DiscoverResponse = {
  profiles: UserProfile[];
  totalCount: number;
  hasMore: boolean;
};

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
  discoverUsers: async (page: number, limit: number, filters: UserFilters) => {
    const response = await apiClient.get<DiscoverResponse>("/profiles/discover", {
      params: { page, limit, query: filters.query || undefined, role: filters.role !== "all" ? filters.role : undefined }
    });
    const { profiles, totalCount, hasMore } = response.data;
    return {
      users: profiles.map((profile) => {
        const normalized = normalizeAuthProfile(profile);
        return { id: normalized.id, profile: normalized, createdAt: normalized.createdAt };
      }),
      totalCount,
      hasMore
    };
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
