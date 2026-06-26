export type MediaKind =
  | "avatar"
  | "post"
  | "cover";

export interface UploadMediaResponse {
  success: boolean;
  message: string;
  filename: string;
  mimetype: string;
  sizeInBytes: number;
  url: string;
}