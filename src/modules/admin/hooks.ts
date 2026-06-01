import { useEffect } from "react";

import { useAdminStore } from "@/modules/admin/store";

export const adminTabs = [
  { label: "Overview", value: "overview" },
  { label: "Users", value: "users" },
  { label: "Posts", value: "posts" }
] as const;

export const useAdminDashboard = () => {
  const activeTab = useAdminStore((state) => state.activeTab);
  const stats = useAdminStore((state) => state.stats);
  const users = useAdminStore((state) => state.users);
  const isLoading = useAdminStore((state) => state.isLoading);
  const mutatingId = useAdminStore((state) => state.mutatingId);
  const errorMessage = useAdminStore((state) => state.errorMessage);
  const setActiveTab = useAdminStore((state) => state.setActiveTab);
  const loadDashboard = useAdminStore((state) => state.loadDashboard);
  const banUser = useAdminStore((state) => state.banUser);
  const deletePost = useAdminStore((state) => state.deletePost);

  useEffect(() => {
    if (!stats && !isLoading) {
      void loadDashboard();
    }
  }, [isLoading, loadDashboard, stats]);

  return {
    activeTab,
    stats,
    users,
    isLoading,
    mutatingId,
    errorMessage,
    setActiveTab,
    loadDashboard,
    banUser,
    deletePost
  };
};
