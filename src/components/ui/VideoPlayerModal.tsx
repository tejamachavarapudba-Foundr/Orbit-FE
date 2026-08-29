import { Modal, Pressable, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ResizeMode, Video } from "expo-av";

import { iconSize } from "@/theme/designTokens";

type VideoPlayerModalProps = {
  visible: boolean;
  uri: string;
  onClose: () => void;
};

/** Full-screen in-app player with native controls — for a deliberate "watch this video" tap, as opposed to PostVideo's muted feed autoplay. */
export const VideoPlayerModal = ({ visible, uri, onClose }: VideoPlayerModalProps) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <View className="flex-1 items-center justify-center bg-black">
      <Video
        source={{ uri }}
        resizeMode={ResizeMode.CONTAIN}
        useNativeControls
        shouldPlay
        style={{ width: "100%", height: "100%" }}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close"
        onPress={onClose}
        hitSlop={12}
        className="absolute right-4 top-12 h-10 w-10 items-center justify-center rounded-full bg-black/50"
      >
        <Feather name="x" size={iconSize.lg} color="#ffffff" />
      </Pressable>
    </View>
  </Modal>
);
