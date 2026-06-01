import { useCallback, useEffect, useMemo, useState } from "react";

import { UserRole, UserSummary } from "@/modules/user/types";
import { useUserStore } from "@/modules/user/store";

export const userRoleFilters: { label: string; value: UserRole }[] = [
  { label: "All roles", value: "all" },
  { label: "Founder", value: "founder" },
  { label: "Co-Founder", value: "co-founder" },
  { label: "Software Engineer", value: "software engineer" },
  { label: "Mentor", value: "mentor" },
  { label: "Policy Maker", value: "policy maker" },
  { label: "Investor", value: "investor" },
  { label: "Designer", value: "designer" },
  { label: "Product Manager", value: "product manager" },
  { label: "Other", value: "other" }
];

const pageSize = 10;

const normalise = (value: string) => value.trim().toLowerCase();

const matchesSearch = (user: UserSummary, query: string) => {
  const needle = normalise(query);

  if (!needle) {
    return true;
  }

  const profile = user.profile;
  return [
    profile.fullName,
    profile.headline,
    profile.company,
    profile.location,
    profile.role,
    ...profile.skills,
    ...profile.lookingFor
  ]
    .map(normalise)
    .some((value) => value.includes(needle));
};

const matchesRole = (user: UserSummary, role: UserRole) => {
  if (role === "all") {
    return true;
  }

  return normalise(user.profile.role) === role;
};

export const useDiscoverUsers = () => {
  const users = useUserStore((state) => state.users);
  const filters = useUserStore((state) => state.filters);
  const isLoading = useUserStore((state) => state.isLoading);
  const isRefreshing = useUserStore((state) => state.isRefreshing);
  const errorMessage = useUserStore((state) => state.errorMessage);
  const loadUsers = useUserStore((state) => state.loadUsers);
  const refreshUsers = useUserStore((state) => state.refreshUsers);
  const setQuery = useUserStore((state) => state.setQuery);
  const setRole = useUserStore((state) => state.setRole);
  const [visibleCount, setVisibleCount] = useState(pageSize);

  useEffect(() => {
    if (users.length === 0 && !isLoading) {
      void loadUsers();
    }
  }, [isLoading, loadUsers, users.length]);

  const filteredUsers = useMemo(
    () => users.filter((user) => matchesSearch(user, filters.query) && matchesRole(user, filters.role)),
    [filters.query, filters.role, users]
  );

  const visibleUsers = useMemo(() => filteredUsers.slice(0, visibleCount), [filteredUsers, visibleCount]);

  const loadMore = useCallback(() => {
    setVisibleCount((current) => Math.min(current + pageSize, filteredUsers.length));
  }, [filteredUsers.length]);

  const updateQuery = useCallback(
    (query: string) => {
      setVisibleCount(pageSize);
      setQuery(query);
    },
    [setQuery]
  );

  const updateRole = useCallback(
    (role: UserRole) => {
      setVisibleCount(pageSize);
      setRole(role);
    },
    [setRole]
  );

  return {
    users: visibleUsers,
    totalCount: filteredUsers.length,
    hasMore: visibleUsers.length < filteredUsers.length,
    filters,
    isLoading,
    isRefreshing,
    errorMessage,
    loadUsers,
    refreshUsers,
    setQuery: updateQuery,
    setRole: updateRole,
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
