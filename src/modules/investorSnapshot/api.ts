  import { apiClient } from "@/services/api/client";
import { InvestorSnapshot } from "./types";

export const investorSnapshotApi = {
  getSnapshot: async (projectId: string) => {
    const response = await apiClient.get<InvestorSnapshot>(
      `/investor-snapshot/project/${projectId}`
    );

    return response.data;
  },

  createSnapshot: async (
    projectId: string,
    payload: Partial<InvestorSnapshot>,
  ) => {
    const response = await apiClient.post<InvestorSnapshot>(
      `/investor-snapshot/project/${projectId}`,
      payload,
    );

    return response.data;
  },

  updateSnapshot: async (
    projectId: string,
    payload: Partial<InvestorSnapshot>,
  ) => {
    const response = await apiClient.patch<InvestorSnapshot>(
      `/investor-snapshot/project/${projectId}`,
      payload,
    );

    return response.data;
  },
};