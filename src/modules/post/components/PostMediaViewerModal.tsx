import { useMemo } from "react";
import { Dimensions, FlatList, Image, Modal, Pressable, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { PostVideo } from "@/modules/post/components/PostVideo";
import { Post } from "@/modules/post/types";
import { iconSize } from "@/theme/designTokens";

type PostMediaViewerModalProps = {
  visible: boolean;
  postId: string;
  media: Post["media"];
  initialIndex: number;
  onClose: () => void;
};

// Full, uncropped view of post media — tap-to-open like LinkedIn's post
// photo viewer, as opposed to the feed card's cover-cropped preview.
export const PostMediaViewerModal = ({ visible, postId, media, initialIndex, onClose }: PostMediaViewerModalProps) => {
  const sortedMedia = useMemo(() => [...media].sort((a, b) => a.order - b.order), [media]);
  const screenWidth = Dimensions.get("window").width;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black">
        <FlatList
          data={sortedMedia}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialIndex}
          getItemLayout={(_, index) => ({ length: screenWidth, offset: screenWidth * index, index })}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={{ width: screenWidth }} className="flex-1 items-center justify-center">
              {item.type === "VIDEO" ? (
                <PostVideo postId={postId} uri={item.url} width={item.width ?? null} height={item.height ?? null} />
              ) : (
                <Image source={{ uri: item.url }} resizeMode="contain" style={{ width: "100%", height: "100%" }} />
              )}
            </View>
          )}
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
};
