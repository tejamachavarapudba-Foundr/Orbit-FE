import { create } from "zustand";

import { adminApi } from "@/modules/admin/api";
import { AdminStats, AdminTab, AdminUser, BanUserPayload } from "@/modules/admin/types";
import { useToastStore } from "@/store/toastStore";
import { toAppError } from "@/utils/errors";

type AdminState = {
  activeTab: AdminTab;
  stats: AdminStats | null;
  users: AdminUser[];
  isLoading: boolean;
  mutatingId: string | null;
  errorMessage: string | null;
  setActiveTab: (tab: AdminTab) => void;
  loadDashboard: () => Promise<void>;
  banUser: (id: string, payload: BanUserPayload) => Promise<boolean>;
  deletePost: (id: string) => Promise<boolean>;
};

export const useAdminStore = create<AdminState>((set) => ({
  activeTab: "overview",
  stats: null,
  users: [],
  isLoading: false,
  mutatingId: null,
  errorMessage: null,
  setActiveTab: (activeTab) => set({ activeTab }),
  loadDashboard: async () => {
    set({ isLoading: true, errorMessage: null });

    try {
      const [stats, users] = await Promise.all([adminApi.getStats(), adminApi.getUsers()]);

      set({
        stats,
        users: users.data,
        isLoading: false
      });
    } catch (error) {
      const appError = toAppError(error);
      set({ errorMessage: appError.message, isLoading: false });
    }
  },
  banUser: async (id, payload) => {
    set({ mutatingId: id, errorMessage: null });

    try {
      const response = await adminApi.banUser(id, payload);
      set((state) => ({
        users: state.users.map((user) =>
          user.id === id ? { ...user, isBanned: response.isBanned, updatedAt: response.updatedAt } : user
        ),
        mutatingId: null
      }));
      useToastStore.getState().show({ type: "success", title: "User updated" });
      return true;
    } catch (error) {
      const appError = toAppError(error);
      set({ errorMessage: appError.message, mutatingId: null });
      useToastStore.getState().show({ type: "error", title: "Admin action failed", message: appError.message });
      return false;
    }
  },
  deletePost: async (id) => {
    set({ mutatingId: id, errorMessage: null });

    try {
      await adminApi.deletePost(id);
      set({ mutatingId: null });
      useToastStore.getState().show({ type: "success", title: "Post deleted" });
      return true;
    } catch (error) {
      const appError = toAppError(error);
      set({ errorMessage: appError.message, mutatingId: null });
      useToastStore.getState().show({ type: "error", title: "Delete failed", message: appError.message });
      return false;
    }
  }
}));
