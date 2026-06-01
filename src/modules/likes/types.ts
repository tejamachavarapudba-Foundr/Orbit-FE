import { AuthProfile } from "@/modules/auth/types";

export type Like = {
  id: string;
  postId: string;
  userId: string;
  createdAt: string;
  user?: AuthProfile;
};

export type ToggleLikeResponse =
  | Like
  | {
      liked: boolean;
      message: string;
    };
