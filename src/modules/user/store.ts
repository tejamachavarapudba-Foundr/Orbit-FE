import { create } from "zustand";

import { userApi } from "@/modules/user/api";
import { UserSummary } from "@/modules/user/types";
import { toAppError } from "@/utils/errors";
import { tokenService } from "@/services/api/tokenService";

type UserState = {
  users: UserSummary[];
  selectedUser: UserSummary | null;
  isLoading: boolean;
  isRefreshing: boolean;
  isDetailLoading: boolean;
  isDeletingAccount: boolean;
  errorMessage: string | null;
  detailErrorMessage: string | null;
  loadUsers: () => Promise<void>;
  refreshUsers: () => Promise<void>;
  selectUser: (id: string) => Promise<void>;
  clearSelectedUser: () => void;
  deleteAccount: () => Promise<boolean>;
};

export const useUserStore = create<UserState>((set) => ({
  users: [],
  selectedUser: null,
  isLoading: false,
  isRefreshing: false,
  isDetailLoading: false,
  isDeletingAccount: false,
  errorMessage: null,
  detailErrorMessage: null,
  loadUsers: async () => {
    set({ isLoading: true, errorMessage: null });

    try {
      const users = await userApi.getUsers();
      set({ users, isLoading: false });
    } catch (error) {
      const appError = toAppError(error);
      set({ errorMessage: appError.message, isLoading: false });
    }
  },
  refreshUsers: async () => {
    set({ isRefreshing: true, errorMessage: null });

    try {
      const users = await userApi.getUsers();
      set({ users, isRefreshing: false });
    } catch (error) {
      const appError = toAppError(error);
      set({ errorMessage: appError.message, isRefreshing: false });
    }
  },
  selectUser: async (id) => {
    set({ isDetailLoading: true, detailErrorMessage: null });

    try {
      const selectedUser = await userApi.getUserById(id);
      set({ selectedUser, isDetailLoading: false });
    } catch (error) {
      const appError = toAppError(error);
      set({ detailErrorMessage: appError.message, isDetailLoading: false });
    }
  },
  clearSelectedUser: () => set({ selectedUser: null, detailErrorMessage: null }),
  deleteAccount: async () => {
    set({ isDeletingAccount: true });

    try {
      await userApi.deleteMe();
      await tokenService.clear();
      set({ isDeletingAccount: false });
      return true;
    } catch (error) {
      const appError = toAppError(error);
      set({ errorMessage: appError.message, isDeletingAccount: false });
      return false;
    }
  }
}));
