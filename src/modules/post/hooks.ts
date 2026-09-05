import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { InfiniteData, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { useAuthStore } from "@/modules/auth/store";
import { useSavedPostsStore } from "@/modules/post/savedPostsStore";
import { postApi } from "@/modules/post/api";
import { CreatePostPayload, Post, PostCategory, PostFormValues, PostMediaType, UpdatePostPayload } from "@/modules/post/types";
import { useToastStore } from "@/store/toastStore";
import { toAppError } from "@/utils/errors";

const PAGE_SIZE = 10;
const FEED_QUERY_KEY = ["posts", "feed"] as const;

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

const sortPosts = (posts: Post[]) =>
  [...posts].sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime());

/** Applies a page-preserving edit to the feed's cached pages — used by every
 * mutation below so create/update/delete stay in sync with whatever's
 * currently paginated in, without refetching the whole feed. */
const updateFeedCache = (
  queryClient: ReturnType<typeof useQueryClient>,
  updater: (pages: Post[][]) => Post[][]
) => {
  queryClient.setQueryData<InfiniteData<Post[], number>>(FEED_QUERY_KEY, (old: InfiniteData<Post[], number> | undefined) => {
    if (!old) return old;
    return { ...old, pages: updater(old.pages) };
  });
};

export const useFeed = () => {
  const user = useAuthStore((state) => state.user);
  const isSavedPostsLoading = useSavedPostsStore((state) => state.isLoading);
  const loadSavedPosts = useSavedPostsStore((state) => state.loadSavedPosts);
  const [activeCategory, setActiveCategory] = useState<PostCategory | "all">("all");
  const requestedSavedPostsForUserRef = useRef<string | null>(null);

  const { data, isLoading, isRefetching, isFetchingNextPage, hasNextPage, error, refetch, fetchNextPage } = useInfiniteQuery({
    queryKey: FEED_QUERY_KEY,
    queryFn: ({ pageParam }) => postApi.getPosts(pageParam, PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => (lastPage.length === PAGE_SIZE ? allPages.length + 1 : undefined)
  });

  // Same fix as before, keyed per signed-in user: an account with zero saved
  // posts would otherwise re-trigger this fetch forever (this was hammering
  // /api/posts/saved continuously in practice).
  useEffect(() => {
    if (!user || requestedSavedPostsForUserRef.current === user.id || isSavedPostsLoading) {
      return;
    }
    requestedSavedPostsForUserRef.current = user.id;
    void loadSavedPosts();
  }, [isSavedPostsLoading, loadSavedPosts, user]);

  const posts = useMemo(() => sortPosts((data?.pages ?? []).flat()), [data]);

  const filteredPosts = useMemo(
    () => (activeCategory === "all" ? posts : posts.filter((post) => post.category === activeCategory)),
    [activeCategory, posts]
  );

  const loadMore = useCallback(() => {
    if (hasNextPage) void fetchNextPage();
  }, [hasNextPage, fetchNextPage]);

  return {
    posts: filteredPosts,
    totalCount: filteredPosts.length,
    hasMore: hasNextPage ?? false,
    activeCategory,
    isLoading,
    isRefreshing: isRefetching,
    isLoadingMore: isFetchingNextPage,
    errorMessage: error ? toAppError(error).message : null,
    loadPosts: refetch,
    refreshPosts: refetch,
    loadMore,
    setActiveCategory
  };
};

export const usePostComposer = () => {
  const [values, setValues] = useState<PostFormValues>(initialForm);
  const showToast = useToastStore((state) => state.show);
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: ({ payload, files }: { payload: CreatePostPayload; files: ImagePicker.ImagePickerAsset[] }) =>
      postApi.createPost(payload, files),
    onSuccess: (newPost) => {
      updateFeedCache(queryClient, (pages) => {
        const [firstPage, ...rest] = pages;
        return [[newPost, ...(firstPage ?? [])], ...rest];
      });
      showToast({ type: "success", title: "Post published" });
    },
    onError: (error) => {
      showToast({ type: "error", title: "Post failed", message: toAppError(error).message });
    }
  });

  const setField = useCallback(<Key extends keyof PostFormValues>(key: Key, value: PostFormValues[Key]) => {
    setValues((current) => ({ ...current, [key]: value }));
  }, []);

  const submit = useCallback(
    async (files: ImagePicker.ImagePickerAsset[]) => {
      const payload = toPayload(values);
      if (!payload.content) return false;

      try {
        await createMutation.mutateAsync({ payload, files });
        setValues(initialForm);
        return true;
      } catch {
        return false;
      }
    },
    [createMutation, values]
  );

  return { values, isSubmitting: createMutation.isPending, setField, submit, canSubmit: values.content.trim().length > 0 };
};

export const usePostActions = () => {
  const currentUserId = useAuthStore((state) => state.user?.profile.id);
  const showToast = useToastStore((state) => state.show);
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePostPayload }) => postApi.updatePost(id, payload),
    onSuccess: (updatedPost) => {
      updateFeedCache(queryClient, (pages) => pages.map((page) => page.map((p) => (p.id === updatedPost.id ? updatedPost : p))));
      showToast({ type: "success", title: "Post updated" });
    },
    onError: (error) => {
      showToast({ type: "error", title: "Update failed", message: toAppError(error).message });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => postApi.deletePost(id),
    onSuccess: (_data, id) => {
      updateFeedCache(queryClient, (pages) => pages.map((page) => page.filter((p) => p.id !== id)));
      showToast({ type: "success", title: "Post deleted" });
    },
    onError: (error) => {
      showToast({ type: "error", title: "Delete failed", message: toAppError(error).message });
    }
  });

  const updatePost = useCallback(
    async (id: string, payload: UpdatePostPayload) => {
      try {
        await updateMutation.mutateAsync({ id, payload });
        return true;
      } catch {
        return false;
      }
    },
    [updateMutation]
  );

  const deletePost = useCallback(
    async (id: string) => {
      try {
        await deleteMutation.mutateAsync(id);
        return true;
      } catch {
        return false;
      }
    },
    [deleteMutation]
  );

  return {
    currentUserId,
    isSubmitting: updateMutation.isPending,
    deletingPostId: deleteMutation.isPending ? (deleteMutation.variables ?? null) : null,
    updatePost,
    deletePost
  };
};
