import { create } from "zustand";

type ToastType = "success" | "error" | "info";

type Toast = {
  title: string;
  message?: string;
  type: ToastType;
  durationMs: number;
};

type ToastState = {
  toast: Toast | null;
  show: (toast: Omit<Toast, "durationMs"> & { durationMs?: number }) => void;
  hide: () => void;
};

export const useToastStore = create<ToastState>((set) => ({
  toast: null,
  show: (toast) => set({ toast: { durationMs: 3000, ...toast } }),
  hide: () => set({ toast: null })
}));
