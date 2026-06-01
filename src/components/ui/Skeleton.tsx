import { View } from "react-native";

type SkeletonProps = {
  className?: string;
};

export const Skeleton = ({ className = "" }: SkeletonProps) => (
  <View className={`overflow-hidden rounded-md bg-border/60 ${className}`} />
);
