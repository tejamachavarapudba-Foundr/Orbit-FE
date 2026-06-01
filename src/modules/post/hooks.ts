import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuthStore } from "@/modules/auth/store";
import { usePostStore } from "@/modules/post/store";
import { CreatePostPayload, PostCategory, PostFormValues, PostMediaType } from "@/modules/post/types";

export const postCategoryOptions: { label: string; value: PostCategory }[] = [
  { label: "Update", value: "update" },
  { label: "Announcement", value: "announcement" },
  { label: "Milestone", value: "milestone" },
  { label: "Launch", value: "launch" },
  { label: "Hiring", value: "hiring" },
  { label: "Ad", value: "ad" },
  { label: "Question", value: "question" },
  { label: "Funding", value: "funding" }
];

export const postFilterOptions: { label: string; value: PostCategory | "all" }[] = [
  { label: "All", value: "all" },
  ...postCategoryOptions
];

export const mediaTypeOptions: { label: string; value: PostMediaType }[] = [
  { label: "None", value: "none" },
  { label: "Image", value: "image" },
  { label: "Video", value: "video" },
  { label: "Link", value: "link" }
];

const pageSize = 10;

const initialForm: PostFormValues = {
  content: "",
  category: "update",
  linkUrl: "",
  imageUrl: "",
  mediaType: "none"
};

const toPayload = (values: PostFormValues): CreatePostPayload => ({
  content: values.content.trim(),
  category: values.category,
  imageUrl: values.imageUrl.trim(),
  linkUrl: values.linkUrl.trim(),
  mediaType: values.mediaType,
  projectId: null
});

export const useFeed = () => {
  const posts = usePostStore((state) => state.posts);
  const isLoading = usePostStore((state) => state.isLoading);
  const isRefreshing = usePostStore((state) => state.isRefreshing);
  const errorMessage = usePostStore((state) => state.errorMessage);
  const loadPosts = usePostStore((state) => state.loadPosts);
  const refreshPosts = usePostStore((state) => state.refreshPosts);
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const [activeCategory, setActiveCategory] = useState<PostCategory | "all">("all");

  useEffect(() => {
    if (posts.length === 0 && !isLoading) {
      void loadPosts();
    }
  }, [isLoading, loadPosts, posts.length]);

  const filteredPosts = useMemo(
    () => (activeCategory === "all" ? posts : posts.filter((post) => post.category === activeCategory)),
    [activeCategory, posts]
  );
  const visiblePosts = useMemo(() => filteredPosts.slice(0, visibleCount), [filteredPosts, visibleCount]);
  const loadMore = useCallback(() => {
    setVisibleCount((current) => Math.min(current + pageSize, filteredPosts.length));
  }, [filteredPosts.length]);

  const updateCategory = useCallback((category: PostCategory | "all") => {
    setVisibleCount(pageSize);
    setActiveCategory(category);
  }, []);

  return {
    posts: visiblePosts,
    totalCount: filteredPosts.length,
    hasMore: visiblePosts.length < filteredPosts.length,
    activeCategory,
    isLoading,
    isRefreshing,
    errorMessage,
    loadPosts,
    refreshPosts,
    loadMore,
    setActiveCategory: updateCategory
  };
};

export const usePostComposer = () => {
  const [values, setValues] = useState<PostFormValues>(initialForm);
  const isSubmitting = usePostStore((state) => state.isSubmitting);
  const createPost = usePostStore((state) => state.createPost);

  const setField = useCallback(<Key extends keyof PostFormValues>(key: Key, value: PostFormValues[Key]) => {
    setValues((current) => ({ ...current, [key]: value }));
  }, []);

  const submit = useCallback(async () => {
    const payload = toPayload(values);

    if (!payload.content) {
      return false;
    }

    const didSucceed = await createPost(payload);
    if (didSucceed) {
      setValues(initialForm);
    }

    return didSucceed;
  }, [createPost, values]);

  return { values, isSubmitting, setField, submit, canSubmit: values.content.trim().length > 0 };
};

export const usePostActions = () => {
  const currentUserId = useAuthStore((state) => state.user?.profile.id);
  const isSubmitting = usePostStore((state) => state.isSubmitting);
  const deletingPostId = usePostStore((state) => state.deletingPostId);
  const updatePost = usePostStore((state) => state.updatePost);
  const deletePost = usePostStore((state) => state.deletePost);

  return { currentUserId, isSubmitting, deletingPostId, updatePost, deletePost };
};
