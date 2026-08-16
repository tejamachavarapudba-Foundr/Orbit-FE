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

  const memberRole = query?.memberRole ?? null;
  // Goals only affect ranking, not whether a fetch should run — join them into a
  // stable string so the effect below doesn't depend on the array's identity.
  const goalsKey = query?.goals?.join(",") ?? "";

  const loadMatches = useCallback(async () => {
    if (!memberRole) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await recommendationsApi.getMatches({
        memberRole,
        goals: goalsKey ? goalsKey.split(",") : []
      });
      setMatches(result);
    } catch {
      setErrorMessage("Could not load recommendations right now.");
      setMatches(EMPTY_MATCHES);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberRole, goalsKey]);

  useEffect(() => {
    void loadMatches();
  }, [loadMatches]);

  return { matches, isLoading, errorMessage, reload: loadMatches };
};
