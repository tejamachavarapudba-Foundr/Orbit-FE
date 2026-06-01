export type PostCategory = "update" | "announcement" | "milestone" | "launch" | "hiring" | "ad" | "question" | "funding";

export type PostMediaType = "image" | "video" | "link" | "none";

export type Post = {
  id: string;
  authorId: string;
  content: string;
  category: string;
  imageUrl: string;
  linkUrl: string;
  mediaType: string;
  projectId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreatePostPayload = {
  content: string;
  category: PostCategory;
  imageUrl: string;
  linkUrl: string;
  mediaType: PostMediaType;
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
