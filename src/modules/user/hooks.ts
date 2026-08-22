import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useAuthStore } from "@/modules/auth/store"; // 👈 Import auth store
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
  // 1. Get the current logged-in user's ID
  const currentUserId = useAuthStore((state) => state.user?.profile.id);

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
  const hasRequestedRef = useRef(false);

  // Fires once per mount — gating on "users.length === 0" instead would
  // never converge when the directory is genuinely empty, since every load
  // resolves back to length 0 and re-triggers the request forever.
  useEffect(() => {
    if (hasRequestedRef.current || isLoading) {
      return;
    }
    hasRequestedRef.current = true;
    void loadUsers();
  }, [isLoading, loadUsers]);

  // 2. Filter out both search targets AND your own profile record
  const filteredUsers = useMemo(
    () =>
      users.filter(
        (user) =>
          user.id !== currentUserId && // 👈 Hard boundary: Omit yourself
          matchesSearch(user, filters.query) &&
          matchesRole(user, filters.role)
      ),
    [filters.query, filters.role, users, currentUserId]
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
