import { Image, View } from "react-native";

import { AppText } from "@/components/ui/AppText";

type UserAvatarProps = {
  name: string;
  imageUrl: string;
};

export const UserAvatar = ({ name, imageUrl }: UserAvatarProps) => {
  const initial = name.trim().charAt(0).toUpperCase() || "S";

  if (imageUrl.trim()) {
    return <Image source={{ uri: imageUrl }} className="h-12 w-12 rounded-md bg-primary/10" />;
  }

  return (
    <View className="h-12 w-12 items-center justify-center rounded-md bg-primary/10">
      <AppText tone="primary" weight="bold">
        {initial}
      </AppText>
    </View>
  );
};
