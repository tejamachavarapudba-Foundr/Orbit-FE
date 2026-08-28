import { useMemo, useRef, useState } from "react";
import { FlatList, Image, LayoutChangeEvent, Pressable, View, ViewToken } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { PostMediaViewerModal } from "@/modules/post/components/PostMediaViewerModal";
import { Post } from "@/modules/post/types";
import { getMediaAspectRatio } from "@/modules/post/utils/media";
import { PostVideo } from "@/modules/post/components/PostVideo";

type PostMediaCarouselProps = {
  postId: string;
  media: Post["media"];
};

export const PostMediaCarousel = ({ postId, media }: PostMediaCarouselProps) => {
  const sortedMedia = useMemo(() => [...media].sort((a, b) => a.order - b.order), [media]);
  const aspectRatio = getMediaAspectRatio(sortedMedia[0]?.width ?? null, sortedMedia[0]?.height ?? null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const onLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    if (width > 0 && width !== containerWidth) {
      setContainerWidth(width);
    }
  };

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const visible = viewableItems.find((token) => token.isViewable);
    if (visible && typeof visible.index === "number") {
      setActiveIndex(visible.index);
    }
  }).current;

  if (sortedMedia.length <= 1) {
    const item = sortedMedia[0];
    if (!item) return null;

    return (
      <>
        <View style={{ width: "100%", aspectRatio, backgroundColor: "#000" }}>
          {item.type === "VIDEO" ? (
            <PostVideo postId={postId} uri={item.url} width={item.width ?? null} height={item.height ?? null} />
          ) : (
            <Pressable accessibilityRole="imagebutton" onPress={() => setViewerIndex(0)} style={{ width: "100%", height: "100%" }}>
              <Image source={{ uri: item.url }} resizeMode="cover" style={{ width: "100%", height: "100%" }} />
            </Pressable>
          )}
        </View>
        <PostMediaViewerModal
          visible={viewerIndex !== null}
          postId={postId}
          media={sortedMedia}
          initialIndex={viewerIndex ?? 0}
          onClose={() => setViewerIndex(null)}
        />
      </>
    );
  }

  return (
    <View style={{ width: "100%", aspectRatio, backgroundColor: "#000" }} onLayout={onLayout}>
      {containerWidth > 0 ? (
        <FlatList
          data={sortedMedia}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          viewabilityConfig={viewabilityConfig}
          onViewableItemsChanged={onViewableItemsChanged}
          renderItem={({ item, index }) => (
            <View style={{ width: containerWidth, height: "100%" }}>
              {item.type === "VIDEO" ? (
                <PostVideo postId={postId} uri={item.url} width={item.width ?? null} height={item.height ?? null} />
              ) : (
                <Pressable
                  accessibilityRole="imagebutton"
                  onPress={() => setViewerIndex(index)}
                  style={{ width: "100%", height: "100%" }}
                >
                  <Image source={{ uri: item.url }} resizeMode="cover" style={{ width: "100%", height: "100%" }} />
                </Pressable>
              )}
            </View>
          )}
        />
      ) : null}

      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          bottom: 10,
          left: 0,
          right: 0,
          flexDirection: "row",
          justifyContent: "center",
          gap: 5,
        }}
      >
        {sortedMedia.map((item, index) => (
          <View
            key={item.id}
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: index === activeIndex ? "#fff" : "rgba(255,255,255,0.5)",
            }}
          />
        ))}
      </View>

      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          borderRadius: 10,
          backgroundColor: "rgba(0,0,0,0.55)",
          paddingHorizontal: 8,
          paddingVertical: 3,
        }}
      >
        <AppText size="xs" weight="medium" style={{ color: "#fff" }}>
          {activeIndex + 1}/{sortedMedia.length}
        </AppText>
      </View>

      <PostMediaViewerModal
        visible={viewerIndex !== null}
        postId={postId}
        media={sortedMedia}
        initialIndex={viewerIndex ?? activeIndex}
        onClose={() => setViewerIndex(null)}
      />
    </View>
  );
};
