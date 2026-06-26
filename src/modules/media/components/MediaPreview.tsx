import {
    Image,
    View,
  } from "react-native";
  
  interface Props {
    uri: string;
  }
  
  export const MediaPreview = ({
    uri,
  }: Props) => {
    return (
      <View>
        <Image
          source={{ uri }}
          className="h-60 w-full rounded-xl"
          resizeMode="cover"
        />
      </View>
    );
  };