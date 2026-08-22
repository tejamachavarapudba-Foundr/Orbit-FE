export type CommunityMember = {
  id: string;
  role: string;
  joinedAt: string;
  user: {
    id: string;
    fullName: string;
    avatarUrl: string;
    headline: string;
  };
};

export type Community = {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  memberCount: number;
};

export type RawCommunity = Omit<Community, "memberCount"> & {
  _count?: { members: number };
};

export type CommunityDetail = Community & {
  members: CommunityMember[];
};

export type CreateCommunityPayload = {
  name: string;
  description?: string;
  memberIds?: string[];
};
