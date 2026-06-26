import {
    ActivityIndicator,
    View,
  } from "react-native";
  
  import { AppText } from "@/components/ui/AppText";
  
  export const UploadProgress =
    () => (
      <View className="flex-row items-center gap-2">
        <ActivityIndicator />
        <AppText>
          Uploading...
        </AppText>
      </View>
    );