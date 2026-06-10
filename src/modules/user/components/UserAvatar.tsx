import { Image, View } from "react-native";

import { AppText } from "@/components/ui/AppText";

type UserAvatarProps = {
  name: string;
  imageUrl: string;
  size?: number;
};

export const UserAvatar = ({ name, imageUrl, size = 48 }: UserAvatarProps) => {
  const initial = name.trim().charAt(0).toUpperCase() || "S";
  const dimension = { width: size, height: size, borderRadius: size / 4 };

  if (imageUrl.trim()) {
    return <Image source={{ uri: imageUrl }} style={dimension} className="bg-primary/10" />;
  }

  return (
    <View style={dimension} className="items-center justify-center bg-primary/10">
      <AppText tone="primary" weight="bold">
        {initial}
      </AppText>
    </View>
  );
};
