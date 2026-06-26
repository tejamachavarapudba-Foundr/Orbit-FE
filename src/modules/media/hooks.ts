import { useMutation } from "@tanstack/react-query";

import { mediaApi } from "./api";

export const useUploadMedia = () => {
  return useMutation({
    mutationFn: ({
      uri,
      kind,
    }: {
      uri: string;
      kind:
        | "avatar"
        | "post"
        | "cover";
    }) =>
      mediaApi.upload(uri, kind),
  });
};