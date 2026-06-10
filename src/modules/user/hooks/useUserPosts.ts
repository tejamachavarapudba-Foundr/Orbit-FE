import { useCallback, useEffect, useState } from "react";

import { postApi } from "@/modules/post/api";
import { Post } from "@/modules/post/types";

export const useUserPosts = (userId: string | undefined) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    if (!userId) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const allPosts = await postApi.getPosts();
      setPosts(allPosts.filter((post) => post.authorId === userId).slice(0, 12));
    } catch {
      setErrorMessage("Could not load activity.");
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  return { posts, isLoading, errorMessage, reload: loadPosts };
};
