import { create } from "zustand";

import { searchApi } from "@/modules/search/api";
import { SearchGroupedResults, SearchStateResult, SearchType } from "@/modules/search/types";
import { toAppError } from "@/utils/errors";

type SearchState = {
  query: string;
  type: SearchType;
  limit: number;
  results: SearchStateResult;
  isLoading: boolean;
  errorMessage: string | null;
  setQuery: (query: string) => void;
  setType: (type: SearchType) => void;
  search: () => Promise<void>;
  clear: () => void;
};

const emptyGroupedResults = (): SearchGroupedResults => ({
  users: [],
  projects: [],
  jobs: [],
  events: [],
  posts: []
});

const countResults = (results: SearchGroupedResults) =>
  results.users.length + results.projects.length + results.jobs.length + results.events.length + results.posts.length;

export const useSearchStore = create<SearchState>((set, get) => ({
  query: "",
  type: "all",
  limit: 10,
  results: { ...emptyGroupedResults(), totalCount: 0 },
  isLoading: false,
  errorMessage: null,
  setQuery: (query) => set({ query }),
  setType: (type) => set({ type }),
  search: async () => {
    const { query, type, limit } = get();
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2 && type === "all") {
      set({ results: { ...emptyGroupedResults(), totalCount: 0 }, errorMessage: null });
      return;
    }

    set({ isLoading: true, errorMessage: null });

    try {
      const groupedResults = await searchApi.search({ query: trimmedQuery, type, limit });
      set({
        results: { ...groupedResults, totalCount: countResults(groupedResults) },
        isLoading: false
      });
    } catch (error) {
      const appError = toAppError(error);
      set({ errorMessage: appError.message, isLoading: false });
    }
  },
  clear: () => set({ query: "", results: { ...emptyGroupedResults(), totalCount: 0 }, errorMessage: null })
}));
