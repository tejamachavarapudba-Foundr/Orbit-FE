import { Image, Modal, Pressable, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { iconSize } from "@/theme/designTokens";

type FullPhotoModalProps = {
  visible: boolean;
  imageUrl: string;
  onClose: () => void;
};

export const FullPhotoModal = ({ visible, imageUrl, onClose }: FullPhotoModalProps) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <Pressable accessibilityRole="button" onPress={onClose} className="flex-1 items-center justify-center bg-black">
      <Image source={{ uri: imageUrl }} resizeMode="contain" className="h-full w-full" />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close photo"
        onPress={onClose}
        hitSlop={12}
        className="absolute right-4 top-12 h-10 w-10 items-center justify-center rounded-full bg-black/50"
      >
        <Feather name="x" size={iconSize.lg} color="#ffffff" />
      </Pressable>
    </Pressable>
  </Modal>
);
