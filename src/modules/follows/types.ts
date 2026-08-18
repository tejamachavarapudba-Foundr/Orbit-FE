import { AuthProfile } from "@/modules/auth/types";

export type FollowProfile = AuthProfile;

export type FollowRelationship = {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
};

export type FollowStatusResponse = {
  isFollowing: boolean;
};

export type FollowCounts = {
  followers: number;
  following: number;
};

export type NetworkTab = "feed" | "following" | "followers";
