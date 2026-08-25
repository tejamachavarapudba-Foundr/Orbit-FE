import { useCallback, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  ListRenderItem,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  View,
  ViewToken,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { Card, CardContent } from "@/components/ui/Card";
import { ChipFilterRow } from "@/components/ui/ChipFilterRow";
import { ErrorState } from "@/components/ui/ErrorState";
import { ProfileMenuButton } from "@/components/layout/ProfileMenuButton";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { useAuthStore } from "@/modules/auth/store";
import { ComposerPromptCard } from "@/modules/post/components/ComposerPromptCard";
import { PostCard } from "@/modules/post/components/PostCard";
import { PostComposerModal } from "@/modules/post/components/PostComposerModal";
import { PostSkeletonList } from "@/modules/post/components/PostSkeletonList";
import { useFeedVisibilityStore } from "@/modules/post/feedVisibilityStore";
import { postFilterOptions, useFeed } from "@/modules/post/hooks";
import { Post, PostCategory } from "@/modules/post/types";

const HEADER_HEIGHT = 52;
const SCROLL_DELTA_THRESHOLD = 8;

export const FeedScreen = () => {
  const user = useAuthStore((state) => state.user);
  const colors = useThemeTokens();
  const insets = useSafeAreaInsets();
  const [composerOpen, setComposerOpen] = useState(false);

  const headerTranslate = useRef(new Animated.Value(0)).current;
  const headerVisible = useRef(true);
  const lastScrollY = useRef(0);
  const lastDirectionY = useRef(0);

  const {
    posts,
    hasMore,
    activeCategory,
    isLoading,
    isRefreshing,
    errorMessage,
    loadPosts,
    refreshPosts,
    loadMore,
    setActiveCategory,
  } = useFeed();

  const openComposer = useCallback(() => {
    setComposerOpen(true);
  }, []);

  const closeComposer = useCallback(() => {
    setComposerOpen(false);
  }, []);

  const setHeaderVisible = useCallback(
    (visible: boolean) => {
      if (headerVisible.current === visible) return;
      headerVisible.current = visible;
      Animated.timing(headerTranslate, {
        toValue: visible ? 0 : -(HEADER_HEIGHT + insets.top),
        duration: 200,
        useNativeDriver: true,
      }).start();
    },
    [headerTranslate, insets.top],
  );

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const scrollY = Math.max(0, event.nativeEvent.contentOffset.y);
      const delta = scrollY - lastScrollY.current;

      if (scrollY <= 0) {
        setHeaderVisible(true);
      } else if (delta > SCROLL_DELTA_THRESHOLD) {
        setHeaderVisible(false);
        lastDirectionY.current = scrollY;
      } else if (delta < -SCROLL_DELTA_THRESHOLD) {
        setHeaderVisible(true);
        lastDirectionY.current = scrollY;
      }

      lastScrollY.current = scrollY;
    },
    [setHeaderVisible],
  );

  const renderPost = useCallback<ListRenderItem<Post>>(
    ({ item }) => <PostCard post={item} />,
    [],
  );
  const keyExtractor = useCallback((item: Post) => item.id, []);
  const ItemSeparator = () => <View className="h-px bg-border" />;

  const setActivePostId = useFeedVisibilityStore((state) => state.setActivePostId);
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 65 }).current;
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const mostVisible = viewableItems.find((token) => token.isViewable && token.item);
    setActivePostId(mostVisible ? (mostVisible.item as Post).id : null);
  }).current;

  // Stop any playing video when this tab loses focus (e.g. switching tabs)
  // rather than letting it keep playing off-screen.
  useFocusEffect(
    useCallback(() => {
      return () => setActivePostId(null);
    }, [setActivePostId]),
  );

  return (
    <AppScreen withHorizontalPadding={false} edges={["left", "right"]}>
      <View className="flex-1">
        <Animated.View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            elevation: 10,
            paddingTop: insets.top,
            backgroundColor: colors.background,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            transform: [{ translateY: headerTranslate }],
          }}
        >
          <View
            className="flex-row items-center justify-between px-4"
            style={{ height: HEADER_HEIGHT }}
          >
            {user ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Create a new post"
                onPress={openComposer}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                className="h-9 w-9 items-center justify-center rounded-full"
              >
                <Feather name="plus" size={26} color={colors.text} />
              </Pressable>
            ) : (
              <View className="h-9 w-9" />
            )}

            <AppText family="display" size="xl" weight="bold" className="tracking-tight">
              Startuphouze
            </AppText>

            {user ? <ProfileMenuButton /> : <View className="h-9 w-9" />}
          </View>
        </Animated.View>

        <FlatList
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          windowSize={7}
          removeClippedSubviews={true}
          updateCellsBatchingPeriod={50}
          ItemSeparatorComponent={ItemSeparator}
          data={posts}
          keyExtractor={keyExtractor}
          renderItem={renderPost}
          refreshing={isRefreshing}
          onRefresh={() => void refreshPosts()}
          onEndReached={hasMore ? loadMore : undefined}
          onEndReachedThreshold={0.2}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          viewabilityConfig={viewabilityConfig}
          onViewableItemsChanged={onViewableItemsChanged}
          contentContainerStyle={{ paddingTop: HEADER_HEIGHT + insets.top, paddingBottom: 32 }}
          ListHeaderComponent={
            <View>
              {user ? (
                <ComposerPromptCard onPress={openComposer} />
              ) : (
                <Card className="mx-4 mt-3">
                  <CardContent className="py-4">
                    <AppText tone="muted" size="sm">
                      Sign in to share an update.
                    </AppText>
                  </CardContent>
                </Card>
              )}

              <View className="py-3">
                <ChipFilterRow
                  value={activeCategory}
                  options={postFilterOptions}
                  onChange={(value) => setActiveCategory(value as PostCategory | "all")}
                  accessibilityLabel="Filter feed by category"
                />
              </View>
            </View>
          }
          ListEmptyComponent={
            isLoading ? (
              <PostSkeletonList />
            ) : errorMessage ? (
              <View className="px-4">
                <ErrorState message={errorMessage} onRetry={() => void loadPosts()} />
              </View>
            ) : (
              <View className="px-4">
                <Card>
                  <CardContent className="items-center py-10">
                    <AppText tone="muted" size="sm" className="text-center">
                      No posts yet. Be the first to share.
                    </AppText>
                  </CardContent>
                </Card>
              </View>
            )
          }
        />

        {user ? <PostComposerModal visible={composerOpen} onClose={closeComposer} /> : null}
      </View>
    </AppScreen>
  );
};
