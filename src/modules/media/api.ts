import { apiClient } from "@/services/api/client";

import {
  MediaKind,
  UploadMediaResponse,
} from "./types";

export const mediaApi = {
  async upload(
    uri: string,
    kind: MediaKind,
  ): Promise<UploadMediaResponse> {
    const formData = new FormData();

    formData.append("kind", kind);

    formData.append(
      "file",
      {
        uri,
        name: `upload-${Date.now()}.jpg`,
        type: "image/jpeg",
      } as any,
    );

    const { data } =
      await apiClient.post(
        "/media/upload",
        formData,
      );

    return data;
  },
};