import { View } from "react-native";

import { Skeleton } from "@/components/ui/Skeleton";

export const PostSkeletonList = () => (
  <View className="gap-3">
    {[0, 1, 2].map((item) => (
      <View key={item} className="rounded-md border border-border bg-surface p-4">
        <View className="flex-row items-center gap-3">
          <Skeleton className="h-11 w-11 rounded-full" />
          <View className="flex-1 gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </View>
        </View>
        <Skeleton className="mt-5 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-4/5" />
      </View>
    ))}
  </View>
);
