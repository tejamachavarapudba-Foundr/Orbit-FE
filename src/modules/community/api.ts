import { apiClient } from "@/services/api/client";
import { Community, CommunityDetail, CreateCommunityPayload, RawCommunity } from "@/modules/community/types";

const normalizeCommunity = (community: RawCommunity): Community => ({
  ...community,
  memberCount: community._count?.members ?? 0
});

export const communityApi = {
  getMine: async () => {
    const response = await apiClient.get<RawCommunity[]>("/communities/mine");
    return response.data.map(normalizeCommunity);
  },
  getById: async (id: string) => {
    const response = await apiClient.get<CommunityDetail>(`/communities/${id}`);
    return response.data;
  },
  create: async (payload: CreateCommunityPayload) => {
    const response = await apiClient.post<RawCommunity>("/communities", payload);
    return normalizeCommunity(response.data);
  },
  addMembers: async (id: string, userIds: string[]) => {
    const response = await apiClient.post<CommunityDetail>(`/communities/${id}/members`, { userIds });
    return response.data;
  }
};
