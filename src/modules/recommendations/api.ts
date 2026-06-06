import { apiClient } from "@/services/api/client";
import { MatchQuery, MatchRecommendations } from "@/modules/recommendations/types";
import { buildClientSideMatches } from "@/modules/recommendations/matchEngine";
import { profileApi } from "@/modules/profile/api";

export const recommendationsApi = {
  getMatches: async (query: MatchQuery): Promise<MatchRecommendations> => {
    try {
      const response = await apiClient.get<MatchRecommendations>("/recommendations/matches", {
        params: { role: query.memberRole, goals: query.goals.join(",") }
      });
      return response.data;
    } catch {
      const profiles = await profileApi.getProfiles();
      return buildClientSideMatches(profiles, query);
    }
  }
};
