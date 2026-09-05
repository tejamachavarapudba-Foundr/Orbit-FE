import { useCallback, useEffect, useMemo, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";

import { UserFilters, UserRole, UserSummary } from "@/modules/user/types";
import { userApi } from "@/modules/user/api";
import { useUserStore } from "@/modules/user/store";
import { toAppError } from "@/utils/errors";

export const userRoleFilters: { label: string; value: UserRole }[] = [
  { label: "All roles", value: "all" },
  { label: "Founder", value: "founder" },
  { label: "Co-Founder", value: "co_founder" },
  { label: "Software Engineer", value: "software_engineer" },
  { label: "Mentor", value: "mentor" },
  { label: "Policy Maker", value: "policy_maker" },
  { label: "Investor", value: "investor" },
  { label: "Designer", value: "designer" },
  { label: "Product Manager", value: "product_manager" },
  { label: "Other", value: "other" }
];

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 400;

// Delays turning typed input into an actual query-key change (and
// therefore a request) until the user pauses — without this, every
// keystroke in Discover's search box would fire its own API call.
const useDebouncedValue = <T,>(value: T, delayMs: number) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
};

export const useDiscoverUsers = () => {
  const [filters, setFilters] = useState<UserFilters>({ query: "", role: "all" });
  const debouncedQuery = useDebouncedValue(filters.query, SEARCH_DEBOUNCE_MS);
  const effectiveFilters = useMemo(() => ({ query: debouncedQuery, role: filters.role }), [debouncedQuery, filters.role]);

  const { data, isLoading, isRefetching, isFetchingNextPage, hasNextPage, error, refetch, fetchNextPage } = useInfiniteQuery({
    queryKey: ["users", "discover", effectiveFilters],
    queryFn: ({ pageParam }) => userApi.discoverUsers(pageParam, PAGE_SIZE, effectiveFilters),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => (lastPage.hasMore ? allPages.length + 1 : undefined)
  });

  const users: UserSummary[] = useMemo(() => (data?.pages ?? []).flatMap((page) => page.users), [data]);
  const totalCount = data?.pages[0]?.totalCount ?? 0;

  const loadMore = useCallback(() => {
    if (hasNextPage) void fetchNextPage();
  }, [hasNextPage, fetchNextPage]);

  const setQuery = useCallback((query: string) => setFilters((current) => ({ ...current, query })), []);
  const setRole = useCallback((role: UserRole) => setFilters((current) => ({ ...current, role })), []);

  return {
    users,
    totalCount,
    hasMore: hasNextPage ?? false,
    filters,
    isLoading,
    isRefreshing: isRefetching,
    isLoadingMore: isFetchingNextPage,
    errorMessage: error ? toAppError(error).message : null,
    loadUsers: refetch,
    refreshUsers: refetch,
    setQuery,
    setRole,
    loadMore
  };
};

export const useUserDetail = () => {
  const selectedUser = useUserStore((state) => state.selectedUser);
  const isDetailLoading = useUserStore((state) => state.isDetailLoading);
  const detailErrorMessage = useUserStore((state) => state.detailErrorMessage);
  const selectUser = useUserStore((state) => state.selectUser);
  const clearSelectedUser = useUserStore((state) => state.clearSelectedUser);

  return { selectedUser, isDetailLoading, detailErrorMessage, selectUser, clearSelectedUser };
};
