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

  extractFromPdf: async (
    projectId: string,
    file: { uri: string; name: string; mimeType?: string | null | undefined },
  ) => {
    const formData = new FormData();
    formData.append(
      "file",
      { uri: file.uri, name: file.name, type: file.mimeType || "application/pdf" } as any,
    );

    // Do not set Content-Type manually — axios/React Native need to generate
    // the multipart boundary themselves, which a fixed header value prevents.
    const response = await apiClient.post<{ extracted: Partial<InvestorSnapshot> }>(
      `/investor-snapshot/project/${projectId}/extract-pdf`,
      formData,
    );

    return response.data.extracted;
  },
};