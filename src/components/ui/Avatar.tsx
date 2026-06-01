import { Image, View } from "react-native";

import { AppText } from "@/components/ui/AppText";

type AvatarSize = "sm" | "md" | "lg" | "xl";

type AvatarProps = {
  name: string;
  imageUrl?: string;
  size?: AvatarSize;
  fallback?: "mesh" | "muted";
  className?: string;
};

const sizeClass: Record<AvatarSize, string> = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
  xl: "h-16 w-16"
};

const textSize: Record<AvatarSize, "xs" | "sm" | "base" | "lg"> = {
  sm: "xs",
  md: "sm",
  lg: "base",
  xl: "lg"
};

export const Avatar = ({ name, imageUrl = "", size = "md", fallback = "mesh", className = "" }: AvatarProps) => {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  const fallbackClass = fallback === "mesh" ? "bg-primary" : "bg-muted-bg";

  if (imageUrl.trim()) {
    return (
      <Image
        source={{ uri: imageUrl }}
        accessibilityLabel={name}
        className={`rounded-full ${sizeClass[size]} ${className}`}
      />
    );
  }

  return (
    <View
      className={`items-center justify-center rounded-full ${sizeClass[size]} ${fallbackClass} ${className}`}
    >
      <AppText family="display" size={textSize[size]} weight="semibold" tone={fallback === "mesh" ? "onPrimary" : "primary"}>
        {initial}
      </AppText>
    </View>
  );
};
