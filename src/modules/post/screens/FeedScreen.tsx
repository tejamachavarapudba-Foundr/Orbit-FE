import { useCallback, useRef, useState } from "react";
import {
  FlatList,
  ListRenderItem,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppButton } from "@/components/ui/AppButton";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { Card, CardContent } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { ProfileMenuButton } from "@/components/layout/ProfileMenuButton";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { useAuthStore } from "@/modules/auth/store";
import { CategoryDropdown } from "@/modules/post/components/CategoryDropdown";
import { PostCard } from "@/modules/post/components/PostCard";
import { PostComposerModal } from "@/modules/post/components/PostComposerModal";
import { PostComposerPrompt } from "@/modules/post/components/PostComposerPrompt";
import { PostSkeletonList } from "@/modules/post/components/PostSkeletonList";
import { postFilterOptions, useFeed } from "@/modules/post/hooks";
import { Post, PostCategory } from "@/modules/post/types";

const SCROLL_THRESHOLD = 120;
const TAB_BAR_HEIGHT = 80;

// #region agent log
const DEBUG_LOG_HOST = Platform.OS === "android" ? "10.0.2.2" : "127.0.0.1";
const debugLog = (
  hypothesisId: string,
  location: string,
  message: string,
  data: Record<string, unknown>,
  runId = "pre-fix",
) => {
  fetch(`http://${DEBUG_LOG_HOST}:7427/ingest/b69baca5-7169-4c15-b121-a6217c30cb9c`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "40df94",
    },
    body: JSON.stringify({
      sessionId: "40df94",
      runId,
      hypothesisId,
      location,
      message,
      data: { platform: Platform.OS, ...data },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
};
// #endregion

export const FeedScreen = () => {
  const user = useAuthStore((state) => state.user);
  const colors = useThemeTokens();
  const insets = useSafeAreaInsets();
  const [composerOpen, setComposerOpen] = useState(false);
  const [showFab, setShowFab] = useState(false);
  const showFabRef = useRef(false);

  const {
    posts,
    totalCount,
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

  const openComposer = useCallback((source: "prompt" | "fab") => {
    // #region agent log
    debugLog("C", "FeedScreen.tsx:openComposer", "composer opened", { source });
    // #endregion
    setComposerOpen(true);
  }, []);

  const closeComposer = useCallback(() => {
    // #region agent log
    debugLog("C", "FeedScreen.tsx:closeComposer", "composer closed", {});
    // #endregion
    setComposerOpen(false);
  }, []);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    const shouldShowFab = scrollY > SCROLL_THRESHOLD;

    if (shouldShowFab !== showFabRef.current) {
      showFabRef.current = shouldShowFab;
      setShowFab(shouldShowFab);
      // #region agent log
      debugLog("B", "FeedScreen.tsx:handleScroll", "fab visibility changed", {
        scrollY: Math.round(scrollY),
        showFab: shouldShowFab,
        threshold: SCROLL_THRESHOLD,
      });
      // #endregion
    }
  }, []);

  const renderPost = useCallback<ListRenderItem<Post>>(
    ({ item }) => (
      <View className="w-full max-w-2xl self-center">
        <PostCard post={item} />
      </View>
    ),
    [],
  );
  const keyExtractor = useCallback((item: Post) => item.id, []);
  const ITEM_SEPARATOR_HEIGHT = 16;
  const ItemSeparator = () => <View style={{ height: ITEM_SEPARATOR_HEIGHT }} />;

  const fabBottom = insets.bottom + TAB_BAR_HEIGHT + 16;

  return (
    <AppScreen withHorizontalPadding={false}>
      <View className="flex-1">
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
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32, paddingTop: 8 }}
          ListHeaderComponent={
            <View className="w-full max-w-2xl self-center py-4">
              <View className="mb-5 flex-row items-start justify-between gap-3">
                <View className="min-w-0 flex-1">
                  <AppText family="display" size="2xl" weight="bold" className="tracking-tight">
                    Community Feed
                  </AppText>
                  <AppText tone="muted" size="sm" className="mt-1 leading-5">
                    Share updates, launches, ads, and what your startup is working on.
                  </AppText>
                </View>
                {user ? <ProfileMenuButton /> : null}
              </View>

              {user ? <PostComposerPrompt onPress={() => openComposer("prompt")} /> : null}

              {!user ? (
                <Card className="mb-5">
                  <CardContent className="py-4">
                    <AppText tone="muted" size="sm">
                      Sign in to share an update.
                    </AppText>
                  </CardContent>
                </Card>
              ) : null}

              <View className="mb-3 mt-2">
                <AppText tone="muted" size="xs" weight="medium" className="mb-2">
                  Filter by category
                </AppText>
                <CategoryDropdown
                  value={activeCategory}
                  options={postFilterOptions}
                  onChange={(value) => setActiveCategory(value as PostCategory | "all")}
                  accessibilityLabel="Filter feed by category"
                />
              </View>

              {totalCount > 0 ? (
                <AppText tone="muted" size="xs" className="mb-2">
                  Showing {posts.length} of {totalCount} posts
                </AppText>
              ) : null}
            </View>
          }
          ListEmptyComponent={
            isLoading ? (
              <PostSkeletonList />
            ) : errorMessage ? (
              <View className="w-full max-w-2xl self-center">
                <ErrorState message={errorMessage} onRetry={() => void loadPosts()} />
              </View>
            ) : (
              <View className="w-full max-w-2xl self-center">
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
          ListFooterComponent={
            hasMore ? (
              <View className="w-full max-w-2xl self-center">
                <AppButton
                  label="Load more"
                  variant="outline"
                  size="default"
                  onPress={loadMore}
                  className="mt-2"
                />
              </View>
            ) : null
          }
        />

        {user && showFab ? (
          <Pressable
            onPress={() => openComposer("fab")}
            accessibilityRole="button"
            accessibilityLabel="Create a new post"
            style={{
              position: "absolute",
              right: 20,
              bottom: fabBottom,
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: colors.primary,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            <Feather name="edit-3" size={24} color={colors.onPrimary} />
          </Pressable>
        ) : null}

        {user ? <PostComposerModal visible={composerOpen} onClose={closeComposer} /> : null}
      </View>
    </AppScreen>
  );
};
