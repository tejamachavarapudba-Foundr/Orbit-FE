import { Text, View } from "react-native";

interface Props {
    count: number;
  }
  
  export function NotificationBadge({
    count,
  }: Props) {
    if (count <= 0) return null;
  
    return (
      <View className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-red-500 px-1">
        <Text className="text-center text-[10px] text-white">
          {count > 99 ? "99+" : count}
        </Text>
      </View>
    );
  }