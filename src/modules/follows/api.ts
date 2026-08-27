import { apiClient } from "@/services/api/client";
import { normalizeAuthProfile } from "@/modules/profile/normalizeProfile";
import { FollowCounts, FollowProfile, FollowRelationship, FollowStatusResponse } from "@/modules/follows/types";

export const followsApi = {
  getCounts: async (userId: string) => {
    const response = await apiClient.get<FollowCounts>(`/follows/counts/${userId}`);
    return response.data;
  },
  getFollowers: async (userId: string) => {
    const response = await apiClient.get<FollowProfile[]>(`/follows/followers/${userId}`);
    // Backend only returns a display-safe subset (id/fullName/headline/avatarUrl)
    // — normalize so company/location/skills/etc. default to "" / [] instead
    // of undefined, since the suggestion engine reads those unconditionally.
    return response.data.map((profile) => normalizeAuthProfile(profile as FollowProfile & Record<string, unknown>));
  },
  getFollowing: async (userId: string) => {
    const response = await apiClient.get<FollowProfile[]>(`/follows/following/${userId}`);
    return response.data.map((profile) => normalizeAuthProfile(profile as FollowProfile & Record<string, unknown>));
  },
  followUser: async (userId: string) => {
    const response = await apiClient.post<FollowRelationship>(`/follows/${userId}`);
    return response.data;
  },
  unfollowUser: async (userId: string) => {
    const response = await apiClient.delete<FollowRelationship>(`/follows/${userId}`);
    return response.data;
  },
  getStatus: async (userId: string) => {
    const response = await apiClient.get<FollowStatusResponse>(`/follows/status/${userId}`);
    return response.data;
  }
};
