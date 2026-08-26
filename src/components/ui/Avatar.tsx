import { Image, View } from "react-native";

import { AppText } from "@/components/ui/AppText";

type AvatarSize = "sm" | "md" | "lg" | "xl";

type AvatarProps = {
  name: string;
  imageUrl?: string;
  size?: AvatarSize;
  fallback?: "mesh" | "muted";
  shape?: "circle" | "square";
  className?: string;
};

const sizeClass: Record<AvatarSize, string> = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-14 w-14",
  xl: "h-20 w-20"
};

const textSize: Record<AvatarSize, "xs" | "sm" | "base" | "lg"> = {
  sm: "xs",
  md: "sm",
  lg: "base",
  xl: "lg"
};

export const Avatar = ({ name, imageUrl = "", size = "md", fallback = "mesh", shape = "circle", className = "" }: AvatarProps) => {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  const fallbackClass = fallback === "mesh" ? "bg-primary" : "bg-muted-bg";
  const shapeClass = shape === "square" ? "rounded-lg" : "rounded-full";

  if (imageUrl.trim()) {
    return (
      <Image
        source={{ uri: imageUrl }}
        accessibilityLabel={name}
        className={`${shapeClass} ${sizeClass[size]} ${className}`}
      />
    );
  }

  return (
    <View
      className={`items-center justify-center ${shapeClass} ${sizeClass[size]} ${fallbackClass} ${className}`}
    >
      <AppText family="display" size={textSize[size]} weight="semibold" tone={fallback === "mesh" ? "onPrimary" : "primary"}>
        {initial}
      </AppText>
    </View>
  );
};
