import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { useAuthStore } from "@/modules/auth/store";
import { usePostStore } from "@/modules/post/store";
import { useSavedPostsStore } from "@/modules/post/savedPostsStore";
import { CreatePostPayload, PostCategory, PostFormValues, PostMediaType } from "@/modules/post/types";

export const postCategoryOptions: { label: string; value: PostCategory }[] = [
  { label: "Update", value: "Update" },
  { label: "Announcement", value: "Announcement" },
  { label: "Milestone", value: "Milestone" },
  { label: "Launch", value: "Launch" },
  { label: "Hiring", value: "Hiring" },
  { label: "Advertisement", value: "Advertisement" },
  { label: "Query", value: "Query" },
  { label: "Service", value: "Service" },
  { label: "Marketing", value: "Marketing" },
  { label: "Other", value: "Other" }, 
  { label: "Funding", value: "Funding" }
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
  category: "Update",
  linkUrl: "",
  imageUrl: "",
  mediaType: "none"
};

const toPayload = (values: PostFormValues): CreatePostPayload => ({
  content: values.content.trim(),
  category: values.category,
  linkUrl: values.linkUrl.trim(),
  projectId: null
});

export const useFeed = () => {
  const posts = usePostStore((state) => state.posts);
  const isLoading = usePostStore((state) => state.isLoading);
  const isRefreshing = usePostStore((state) => state.isRefreshing);
  const errorMessage = usePostStore((state) => state.errorMessage);
  const loadPosts = usePostStore((state) => state.loadPosts);
  const refreshPosts = usePostStore((state) => state.refreshPosts);
  const user = useAuthStore((state) => state.user);
  const isSavedPostsLoading = useSavedPostsStore((state) => state.isLoading);
  const loadSavedPosts = useSavedPostsStore((state) => state.loadSavedPosts);
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const [activeCategory, setActiveCategory] = useState<PostCategory | "all">("all");
  const hasRequestedPostsRef = useRef(false);
  const requestedSavedPostsForUserRef = useRef<string | null>(null);

  // Fires once per mount — gating on "posts.length === 0" instead would
  // never converge when the feed is genuinely empty, since every load
  // resolves back to length 0 and re-triggers the request forever.
  useEffect(() => {
    if (hasRequestedPostsRef.current || isLoading) {
      return;
    }
    hasRequestedPostsRef.current = true;
    void loadPosts();
  }, [isLoading, loadPosts]);

  // Same fix, keyed per signed-in user: an account with zero saved posts
  // would otherwise re-trigger this fetch forever (this was hammering
  // /api/posts/saved continuously in practice).
  useEffect(() => {
    if (!user || requestedSavedPostsForUserRef.current === user.id || isSavedPostsLoading) {
      return;
    }
    requestedSavedPostsForUserRef.current = user.id;
    void loadSavedPosts();
  }, [isSavedPostsLoading, loadSavedPosts, user]);

  const filteredPosts = useMemo(
    () => (activeCategory === "all" ? posts : posts.filter((post) => post.category === activeCategory)),
    [activeCategory, posts]
  );
  const visiblePosts = useMemo(() => filteredPosts.slice(0, visibleCount), [filteredPosts, visibleCount]);
  const loadMore = useCallback(() => {
    setVisibleCount((current) => Math.min(current + pageSize, filteredPosts.length));
  }, [filteredPosts.length]);

  const updateCategory = useCallback(
    (category: PostCategory | "all") => {
      setActiveCategory((current) => {
        if (current === category) {
          return current;
        }
  
        setVisibleCount(pageSize);
        return category;
      });
    },
    []
  );

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

  const submit = useCallback(async (files: ImagePicker.ImagePickerAsset[]) => {
    const payload = toPayload(values);

    if (!payload.content) {
      return false;
    }

    const didSucceed = await createPost(payload, files);
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
