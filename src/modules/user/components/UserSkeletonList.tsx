import { View } from "react-native";

import { Skeleton } from "@/components/ui/Skeleton";

export const UserSkeletonList = () => (
  <View className="gap-3">
    {[0, 1, 2].map((item) => (
      <View key={item} className="rounded-md border border-border bg-surface p-4">
        <View className="flex-row gap-3">
          <Skeleton className="h-12 w-12" />
          <View className="flex-1 gap-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-full" />
          </View>
        </View>
      </View>
    ))}
  </View>
);
