import { apiClient } from "@/services/api/client";
import { Project } from "@/modules/project/types";
import { Post } from "@/modules/post/types";
import { SearchEvent, SearchGroupedResults, SearchJob, SearchType, SearchUser } from "@/modules/search/types";

type RawSearchResponse = Partial<SearchGroupedResults> | SearchUser[] | Project[] | SearchJob[] | SearchEvent[] | Post[];

const emptyResults = (): SearchGroupedResults => ({
  users: [],
  projects: [],
  jobs: [],
  events: [],
  posts: [],
  messages: []
});

const normalizeArrayResponse = (type: SearchType, data: RawSearchResponse): SearchGroupedResults => {
  const results = emptyResults();

  if (!Array.isArray(data)) {
    return {
      users: data.users ?? [],
      projects: data.projects ?? [],
      jobs: data.jobs ?? [],
      events: data.events ?? [],
      posts: data.posts ?? [],
      messages: data.messages ?? []
    };
  }

  if (type !== "all") {
    return { ...results, [type]: data } as SearchGroupedResults;
  }

  return results;
};

export const searchApi = {
  search: async ({ query, type, limit }: { query: string; type: SearchType; limit: number }) => {
    const response = await apiClient.get<RawSearchResponse>("/search", {
      params: {
        q: query,
        search: query,
        type,
        limit
      }
    });

    return normalizeArrayResponse(type, response.data);
  }
};
