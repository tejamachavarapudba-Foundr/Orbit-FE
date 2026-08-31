import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Image, Pressable, Share, StatusBar, View, ViewToken, useWindowDimensions } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

import { AppText } from "@/components/ui/AppText";
import { iconSize } from "@/theme/designTokens";
import { projectApi } from "@/modules/project/api";
import { useProjectStore } from "@/modules/project/store";
import { ReelVideo } from "@/modules/project/components/ReelVideo";
import { ReelCommentsSheet } from "@/modules/project/components/ReelCommentsSheet";
import { useReelVisibilityStore } from "@/modules/project/reelVisibilityStore";
import { PitchReel } from "@/modules/project/types";
import { toAppError } from "@/utils/errors";

export const PitchReelsScreen = () => {
  const navigation = useNavigation<any>();
  const { height: screenHeight } = useWindowDimensions();
  const toggleLikeStartup = useProjectStore((state) => state.toggleLikeStartup);
  const toggleSaveStartup = useProjectStore((state) => state.toggleSaveStartup);
  const setActiveReelId = useReelVisibilityStore((state) => state.setActiveReelId);

  const [reels, setReels] = useState<PitchReel[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [commentsProjectId, setCommentsProjectId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setIsLoading(true);
      try {
        const page = await projectApi.getReels();
        if (!cancelled) {
          setReels(page.items);
          setNextCursor(page.nextCursor);
          setErrorMessage(null);
        }
      } catch (error) {
        if (!cancelled) setErrorMessage(toAppError(error).message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !nextCursor) return;
    setIsLoadingMore(true);
    try {
      const page = await projectApi.getReels(nextCursor);
      setReels((current) => [...current, ...page.items]);
      setNextCursor(page.nextCursor);
    } catch {
      // Silent — the feed simply stops growing; the user can pull to
      // reopen the screen to retry rather than surfacing a toast mid-swipe.
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, nextCursor]);

  // Pause every video the moment this screen loses focus (tab switch, back
  // navigation) rather than letting one keep playing off-screen.
  useFocusEffect(
    useCallback(() => {
      return () => setActiveReelId(null);
    }, [setActiveReelId]),
  );

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 90 }).current;
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const mostVisible = viewableItems.find((token) => token.isViewable && token.item);
    setActiveReelId(mostVisible ? (mostVisible.item as PitchReel).id : null);
  }).current;

  const handleLike = (reel: PitchReel) => {
    setReels((current) =>
      current.map((item) =>
        item.id === reel.id
          ? { ...item, isLikedByMe: !item.isLikedByMe, likeCount: item.likeCount + (item.isLikedByMe ? -1 : 1) }
          : item,
      ),
    );
    void toggleLikeStartup(reel.id);
  };

  const handleSave = (reel: PitchReel) => {
    setReels((current) =>
      current.map((item) => (item.id === reel.id ? { ...item, isSavedByMe: !item.isSavedByMe } : item)),
    );
    void toggleSaveStartup(reel.id);
  };

  const handleShare = (reel: PitchReel) => {
    void Share.share({ message: `Check out ${reel.name} on Startuphouze — ${reel.tagline}` });
  };

  const handleCommentPosted = (projectId: string) => {
    setReels((current) =>
      current.map((item) => (item.id === projectId ? { ...item, commentCount: item.commentCount + 1 } : item)),
    );
  };

  const renderItem = ({ item }: { item: PitchReel }) => (
    <View style={{ width: "100%", height: screenHeight }}>
      <ReelVideo reelId={item.id} uri={item.pitchVideoUrl} />

      <View pointerEvents="box-none" style={{ position: "absolute", right: 10, bottom: 96, alignItems: "center", gap: 20 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={item.isLikedByMe ? "Unlike" : "Like"}
          onPress={() => handleLike(item)}
          style={{ alignItems: "center", gap: 3 }}
        >
          <Feather name="thumbs-up" size={24} color={item.isLikedByMe ? "#378ADD" : "#fff"} />
          <AppText size="xs" style={{ color: "#fff" }}>
            {item.likeCount}
          </AppText>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Comments"
          onPress={() => setCommentsProjectId(item.id)}
          style={{ alignItems: "center", gap: 3 }}
        >
          <Feather name="message-circle" size={24} color="#fff" />
          <AppText size="xs" style={{ color: "#fff" }}>
            {item.commentCount}
          </AppText>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={item.isSavedByMe ? "Unsave" : "Save"}
          onPress={() => handleSave(item)}
        >
          <Feather name="bookmark" size={24} color={item.isSavedByMe ? "#378ADD" : "#fff"} />
        </Pressable>

        <Pressable accessibilityRole="button" accessibilityLabel="Share" onPress={() => handleShare(item)}>
          <Feather name="share" size={24} color="#fff" />
        </Pressable>
      </View>

      <View pointerEvents="box-none" style={{ position: "absolute", left: 14, right: 70, bottom: 24 }}>
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate("ProjectDetail", { id: item.id })}
          style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
        >
          <View style={{ width: 30, height: 30, borderRadius: 15, overflow: "hidden", backgroundColor: "#333" }}>
            {item.logoUrl ? <Image source={{ uri: item.logoUrl }} style={{ width: "100%", height: "100%" }} /> : null}
          </View>
          <AppText weight="semibold" style={{ color: "#fff" }}>
            {item.name}
          </AppText>
          <Feather name="chevron-right" size={14} color="rgba(255,255,255,0.7)" />
        </Pressable>
        {item.tagline ? (
          <AppText size="sm" numberOfLines={2} style={{ color: "rgba(255,255,255,0.85)", marginTop: 8 }}>
            {item.tagline}
          </AppText>
        ) : null}
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <StatusBar barStyle="light-content" />

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color="#fff" />
        </View>
      ) : errorMessage ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
          <AppText style={{ color: "#fff", textAlign: "center" }}>{errorMessage}</AppText>
        </View>
      ) : reels.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
          <AppText style={{ color: "#fff", textAlign: "center" }}>No pitch videos yet.</AppText>
        </View>
      ) : (
        <FlatList
          data={reels}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          initialNumToRender={2}
          windowSize={3}
          maxToRenderPerBatch={2}
          removeClippedSubviews
          viewabilityConfig={viewabilityConfig}
          onViewableItemsChanged={onViewableItemsChanged}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          getItemLayout={(_, index) => ({ length: screenHeight, offset: screenHeight * index, index })}
        />
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back"
        onPress={() => navigation.goBack()}
        hitSlop={12}
        style={{
          position: "absolute",
          top: 48,
          left: 14,
          width: 34,
          height: 34,
          borderRadius: 17,
          backgroundColor: "rgba(0,0,0,0.35)",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Feather name="chevron-left" size={iconSize.lg} color="#fff" />
      </Pressable>

      <ReelCommentsSheet
        visible={commentsProjectId !== null}
        projectId={commentsProjectId}
        onClose={() => setCommentsProjectId(null)}
        onCommentPosted={handleCommentPosted}
      />
    </View>
  );
};
