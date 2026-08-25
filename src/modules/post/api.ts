import { apiClient } from "@/services/api/client";
import { CreatePostPayload, Post, UpdatePostPayload } from "@/modules/post/types";
import * as ImagePicker from "expo-image-picker";

export const postApi = {
  getPosts: async () => {
    const response = await apiClient.get<Post[]>("/posts");
    return response.data;
  },
  getPostById: async (id: string) => {
    const response = await apiClient.get<Post>(`/posts/${id}`);
    return response.data;
  },
  createPost: async (payload: CreatePostPayload, files: ImagePicker.ImagePickerAsset[]) => {
    const formData = new FormData();
    formData.append(
      "content",
      payload.content,
  );
  
  formData.append(
      "category",
      payload.category,
  );
  
  if(payload.linkUrl){
     formData.append(
        "linkUrl",
        payload.linkUrl,
     );
  }
  
  if(payload.projectId){
     formData.append(
        "projectId",
        payload.projectId,
     );
  }

  files.forEach(file=>{
    formData.append(
       "files",
       {
           uri:file.uri,
           type:file.mimeType ??
                "image/jpeg",
           name:
             file.fileName ??
             `upload-${Date.now()}`,
       } as any,
    );
});

files.forEach((file, index) => {
formData.append(
  "mediaMetadata",
  JSON.stringify({
    index,
    width: file.width ?? null,
    height: file.height ?? null,
    duration: file.duration ?? null,
    mimeType: file.mimeType ?? null,
    fileSize: file.fileSize ?? null,
  }),
);
});

// Do not set Content-Type manually — axios/React Native need to generate
// the multipart boundary themselves, which a fixed header value prevents.
const response =
    await apiClient.post<Post>(
      "/posts",
      formData,
  );

   return response.data;
  },
  updatePost: async (id: string, payload: UpdatePostPayload) => {
    const response = await apiClient.patch<Post>(`/posts/${id}`, payload);
    return response.data;
  },
  deletePost: async (id: string) => {
    const response = await apiClient.delete<Post>(`/posts/${id}`, { data: { id } });
    return response.data;
  },
  getSavedPosts: async () => {
    const response = await apiClient.get<Post[]>("/posts/saved");
    return response.data;
  },
  toggleSavePost: async (id: string) => {
    const response = await apiClient.post<{ saved: boolean }>(`/posts/${id}/save`);
    return response.data;
  },
  markNotInterested: async (id: string) => {
    const response = await apiClient.post<{ notInterested: boolean }>(`/posts/${id}/not-interested`);
    return response.data;
  },
  reportPost: async (id: string, reason: string) => {
    const response = await apiClient.post<{ reported: boolean }>(`/posts/${id}/report`, { reason });
    return response.data;
  }
};
