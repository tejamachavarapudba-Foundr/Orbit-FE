import * as ImagePicker from "expo-image-picker";
import { Like } from "@/modules/likes/types";
import { Comment } from "@/modules/comments/types";
export type PostCategory = "Update" | "Announcement" | "Milestone" | "Launch" | "Hiring" | "Service" | "Marketing" | "Other" | "Advertisement" | "Query" | "Funding";

export type PostMediaType = "image" | "video" | "link" | "none";

export type Post = {
  id: string;
  authorId: string;
  content: string;
  category: string;
  linkUrl: string;
  projectId: string | null;
  createdAt: string;
  updatedAt: string;

  media: {
    id: string;
    postId: string;
    url: string;
    type: "IMAGE" | "VIDEO";
    order: number;
    createdAt: string;
    width?: number | null;
    height?: number | null;
    duration?: number | null;
    mimeType?: string | null;
    fileSize?: number | null;
    orientation?: MediaOrientation | null;
    thumbnailUrl?: string | null;
  }[];

  author: {
    id: string;
    fullName: string;
    headline: string;
    avatarUrl: string;
    identityVerified?: boolean;
  };

  likes: Like[];

  comments: Comment[];
};

export type MediaOrientation =
  | "PORTRAIT"
  | "LANDSCAPE"
  | "SQUARE"
  | "NULL";

export type CreatePostPayload = {
  content: string;
  category: PostCategory;
  linkUrl: string;
  projectId: string | null;
};

export type UpdatePostPayload = Partial<CreatePostPayload>;

export type PostFormValues = {
  content: string;
  category: PostCategory;
  linkUrl: string;
  imageUrl: string;
  mediaType: PostMediaType;
};

export interface PostMedia {
  id: string;
  url: string;
  type: "IMAGE" | "VIDEO";
  order: number;

  width?: number | null;
  height?: number | null;
  duration?: number | null;
  mimeType?: string | null;
  fileSize?: number | null;
  orientation?: "PORTRAIT" | "LANDSCAPE" | "SQUARE" | null;
  thumbnailUrl?: string | null;
}
