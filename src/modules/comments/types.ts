import { AuthProfile } from "@/modules/auth/types";

export type Comment = {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
  parentId?: string | null;
  author?: AuthProfile;
};

export type CreateCommentPayload = {
  postId: string;
  content: string;
  parentId?: string;
};

export type CommentResponse = Omit<Comment, "author">;
