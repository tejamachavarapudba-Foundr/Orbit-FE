import { useCallback } from "react";
import { FlatList, ListRenderItem, View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { Card, CardContent } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useAuthStore } from "@/modules/auth/store";
import { CategoryDropdown } from "@/modules/post/components/CategoryDropdown";
import { PostCard } from "@/modules/post/components/PostCard";
import { PostComposer } from "@/modules/post/components/PostComposer";
import { PostSkeletonList } from "@/modules/post/components/PostSkeletonList";
import { postFilterOptions, useFeed } from "@/modules/post/hooks";
import { Post, PostCategory } from "@/modules/post/types";

export const FeedScreen = () => {
  const user = useAuthStore((state) => state.user);
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
    setActiveCategory
  } = useFeed();

  const renderPost = useCallback<ListRenderItem<Post>>(
    ({ item }) => (
      <View className="w-full max-w-2xl self-center">
        <PostCard post={item} />
      </View>
    ),
    []
  );
  const keyExtractor = useCallback((item: Post) => item.id, []);

  return (
    <AppScreen withHorizontalPadding={false}>
      <FlatList
        data={posts}
        keyExtractor={keyExtractor}
        renderItem={renderPost}
        refreshing={isRefreshing}
        onRefresh={() => void refreshPosts()}
        onEndReached={hasMore ? loadMore : undefined}
        onEndReachedThreshold={0.4}
        contentContainerStyle={{ gap: 16, paddingHorizontal: 16, paddingBottom: 32, paddingTop: 8 }}
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
              <ThemeToggle />
            </View>

            {user ? <PostComposer /> : null}

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
              <AppButton label="Load more" variant="outline" size="default" onPress={loadMore} className="mt-2" />
            </View>
          ) : null
        }
      />
    </AppScreen>
  );
};
