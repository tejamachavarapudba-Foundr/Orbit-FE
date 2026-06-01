import { AuthProfile } from "@/modules/auth/types";

export type Comment = {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
  author?: AuthProfile;
};

export type CreateCommentPayload = {
  postId: string;
  content: string;
};

export type CommentResponse = Omit<Comment, "author">;
