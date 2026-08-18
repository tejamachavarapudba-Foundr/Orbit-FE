import { apiClient } from "@/services/api/client";
import { FollowCounts, FollowProfile, FollowRelationship, FollowStatusResponse } from "@/modules/follows/types";

export const followsApi = {
  getCounts: async (userId: string) => {
    const response = await apiClient.get<FollowCounts>(`/follows/counts/${userId}`);
    return response.data;
  },
  getFollowers: async (userId: string) => {
    const response = await apiClient.get<FollowProfile[]>(`/follows/followers/${userId}`);
    return response.data;
  },
  getFollowing: async (userId: string) => {
    const response = await apiClient.get<FollowProfile[]>(`/follows/following/${userId}`);
    return response.data;
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
