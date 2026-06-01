import { useEffect } from "react";
import { Pressable, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { useToastStore } from "@/store/toastStore";

export const Toast = () => {
  const toast = useToastStore((state) => state.toast);
  const hide = useToastStore((state) => state.hide);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timeout = setTimeout(hide, toast.durationMs);
    return () => clearTimeout(timeout);
  }, [hide, toast]);

  if (!toast) {
    return null;
  }

  return (
    <View className="absolute bottom-8 left-5 right-5">
      <Pressable onPress={hide} className="rounded-md border border-border bg-surface px-4 py-3 shadow-sm">
        <AppText weight="semibold" tone={toast.type === "error" ? "danger" : "default"}>
          {toast.title}
        </AppText>
        {toast.message ? (
          <AppText size="sm" tone="muted" className="mt-1">
            {toast.message}
          </AppText>
        ) : null}
      </Pressable>
    </View>
  );
};
