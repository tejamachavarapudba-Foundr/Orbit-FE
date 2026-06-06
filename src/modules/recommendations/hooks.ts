import { useCallback, useEffect, useState } from "react";

import { recommendationsApi } from "@/modules/recommendations/api";
import { MatchQuery, MatchRecommendations } from "@/modules/recommendations/types";

const EMPTY_MATCHES: MatchRecommendations = {
  total: 0,
  breakdown: { investors: 0, founders: 0, advisors: 0, professionals: 0, serviceProviders: 0 },
  people: [],
  startups: [],
  opportunities: []
};

export const useMatchRecommendations = (query: MatchQuery | null) => {
  const [matches, setMatches] = useState<MatchRecommendations>(EMPTY_MATCHES);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadMatches = useCallback(async () => {
    if (!query?.memberRole) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await recommendationsApi.getMatches(query);
      setMatches(result);
    } catch {
      setErrorMessage("Could not load recommendations right now.");
      setMatches(EMPTY_MATCHES);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void loadMatches();
  }, [loadMatches]);

  return { matches, isLoading, errorMessage, reload: loadMatches };
};
