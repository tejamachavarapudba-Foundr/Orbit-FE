import { useCallback, useEffect, useMemo } from "react";

import { SearchGroupedResults, SearchType } from "@/modules/search/types";
import { useSearchStore } from "@/modules/search/store";

export const searchTypeOptions: { label: string; value: SearchType }[] = [
  { label: "All", value: "all" },
  { label: "Users", value: "users" },
  { label: "Projects", value: "projects" },
  { label: "Jobs", value: "jobs" },
  { label: "Events", value: "events" },
  { label: "Posts", value: "posts" }
];

const normalize = (value: string) => value.trim().toLowerCase();

const scoreText = (text: string, query: string) => {
  const normalizedText = normalize(text);
  const normalizedQuery = normalize(query);

  if (!normalizedQuery) {
    return 0;
  }

  if (normalizedText === normalizedQuery) {
    return 100;
  }

  if (normalizedText.startsWith(normalizedQuery)) {
    return 75;
  }

  if (normalizedText.includes(normalizedQuery)) {
    return 50;
  }

  return normalizedQuery
    .split(/\s+/)
    .filter((term) => normalizedText.includes(term)).length;
};

export const useGlobalSearch = () => {
  const query = useSearchStore((state) => state.query);
  const type = useSearchStore((state) => state.type);
  const results = useSearchStore((state) => state.results);
  const isLoading = useSearchStore((state) => state.isLoading);
  const errorMessage = useSearchStore((state) => state.errorMessage);
  const setQuery = useSearchStore((state) => state.setQuery);
  const setType = useSearchStore((state) => state.setType);
  const search = useSearchStore((state) => state.search);
  const clear = useSearchStore((state) => state.clear);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void search();
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [query, search, type]);

  const rankedResults = useMemo<SearchGroupedResults>(() => {
    const rankedUsers = [...results.users].sort(
      (first, second) =>
        scoreText(second.profile.fullName, query) +
        scoreText(second.profile.headline, query) -
        scoreText(first.profile.fullName, query) -
        scoreText(first.profile.headline, query)
    );

    const rankedProjects = [...results.projects].sort(
      (first, second) =>
        scoreText(second.name, query) +
        scoreText(second.tagline, query) -
        scoreText(first.name, query) -
        scoreText(first.tagline, query)
    );

    return {
      users: rankedUsers,
      projects: rankedProjects,
      jobs: results.jobs,
      events: results.events,
      posts: results.posts,
      messages: results.messages
    };
  }, [query, results.events, results.jobs, results.posts, results.projects, results.users]);

  const updateType = useCallback(
    (nextType: SearchType) => {
      setType(nextType);
      void search();
    },
    [search, setType]
  );

  return {
    query,
    type,
    results: rankedResults,
    totalCount: results.totalCount,
    isLoading,
    errorMessage,
    setQuery,
    setType: updateType,
    search,
    clear
  };
};
