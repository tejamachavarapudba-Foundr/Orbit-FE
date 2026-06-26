import * as ImagePicker from "expo-image-picker";

import { Feather } from "@expo/vector-icons";

import { AppButton } from "@/components/ui/AppButton";

interface Props {
  onSelected: (
    uri: string,
  ) => void;
}

export const MediaPickerButton = ({
  onSelected,
}: Props) => {
  const pickImage =
    async () => {
      const result =
        await ImagePicker.launchImageLibraryAsync(
          {
            mediaTypes:
              ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
          },
        );

      if (
        !result.canceled
      ) {
        onSelected(
          result.assets[0].uri,
        );
      }
    };

  return (
    <AppButton
      label="Choose Image"
      variant="outline"
      leftIcon={
        <Feather
          name="image"
          size={16}
        />
      }
      onPress={pickImage}
    />
  );
};