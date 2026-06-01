import { ActivityIndicator, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { AppText } from "@/components/ui/AppText";
import { Skeleton } from "@/components/ui/Skeleton";
import { useThemeTokens } from "@/hooks/useThemeTokens";

type LoadingStateProps = {
  message?: string;
  fullScreen?: boolean;
};

export const LoadingState = ({ message = "Loading…", fullScreen = false }: LoadingStateProps) => {
  const colors = useThemeTokens();

  return (
    <View className={`items-center justify-center gap-3 ${fullScreen ? "flex-1 px-6" : "py-8"}`}>
      <ActivityIndicator size="large" color={colors.primary} />
      <AppText tone="muted" size="sm" className="text-center">
        {message}
      </AppText>
    </View>
  );
};

export const SkeletonCard = ({ className = "" }: { className?: string }) => (
  <View className={`overflow-hidden rounded-xl border border-border bg-card p-4 ${className}`}>
    <View className="flex-row gap-3">
      <Skeleton className="h-10 w-10 rounded-full" />
      <View className="flex-1 gap-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-16 w-full" />
      </View>
    </View>
  </View>
);

export const SkeletonList = ({ count = 3, className = "" }: { count?: number; className?: string }) => (
  <View className={`gap-4 ${className}`}>
    {Array.from({ length: count }, (_, index) => (
      <SkeletonCard key={index} />
    ))}
  </View>
);

export const SkeletonAvatarRow = ({ className = "" }: { className?: string }) => (
  <View className={`flex-row items-center gap-3 ${className}`}>
    <Skeleton className="h-10 w-10 rounded-full" />
    <View className="flex-1 gap-2">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-3 w-36" />
    </View>
  </View>
);

type EmptyStateIconProps = {
  name: keyof typeof Feather.glyphMap;
};

export const EmptyStateIcon = ({ name }: EmptyStateIconProps) => {
  const colors = useThemeTokens();
  return (
    <View className="mb-1 h-12 w-12 items-center justify-center rounded-full bg-muted-bg">
      <Feather name={name} size={22} color={colors.muted} />
    </View>
  );
};
