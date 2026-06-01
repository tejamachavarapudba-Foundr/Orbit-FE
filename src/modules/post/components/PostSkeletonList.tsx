import { View } from "react-native";

import { Skeleton } from "@/components/ui/Skeleton";

export const PostSkeletonList = () => (
  <View className="w-full max-w-2xl gap-3 self-center">
    {[0, 1, 2].map((item) => (
      <Skeleton key={item} className="h-40 w-full rounded-xl bg-muted-bg" />
    ))}
  </View>
);
