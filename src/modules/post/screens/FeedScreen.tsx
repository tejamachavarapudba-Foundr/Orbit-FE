import { useCallback } from "react";
import { FlatList, ListRenderItem, Pressable, View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { PostCard } from "@/modules/post/components/PostCard";
import { PostComposer } from "@/modules/post/components/PostComposer";
import { PostSkeletonList } from "@/modules/post/components/PostSkeletonList";
import { postFilterOptions, useFeed } from "@/modules/post/hooks";
import { Post, PostCategory } from "@/modules/post/types";

export const FeedScreen = () => {
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
      <View className="w-full max-w-3xl self-center">
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
        contentContainerStyle={{ gap: 20, paddingHorizontal: 20, paddingBottom: 32 }}
        ListHeaderComponent={
          <View className="w-full max-w-3xl self-center pt-6">
            <ThemeToggle className="self-end" />
            <AppText size="2xl" weight="bold" className="mt-4">
              Community Feed
            </AppText>
            <AppText tone="muted" className="mt-2 leading-6">
              Share updates, launches, ads, and what your startup is working on.
            </AppText>
            <View className="mt-6">
              <PostComposer />
            </View>
            <View className="mt-6 flex-row flex-wrap rounded-md bg-border/40 p-1">
              {postFilterOptions.map((option) => {
                const isActive = activeCategory === option.value;
                return (
                  <Pressable
                    key={option.value}
                    accessibilityRole="button"
                    onPress={() => setActiveCategory(option.value as PostCategory | "all")}
                    className={`mr-2 rounded-md px-4 py-2 ${isActive ? "bg-surface shadow-sm" : "bg-transparent"}`}
                  >
                    <AppText tone={isActive ? "default" : "muted"} weight="medium">
                      {option.label}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
            {totalCount > 0 ? (
              <AppText tone="muted" size="sm" className="mt-5">
                Showing {posts.length} of {totalCount} posts
              </AppText>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <PostSkeletonList />
          ) : errorMessage ? (
            <ErrorState message={errorMessage} onRetry={() => void loadPosts()} />
          ) : (
            <EmptyState title="No posts yet" message="Publish the first update for the Startuphouze network." />
          )
        }
        ListFooterComponent={
          hasMore ? <AppButton label="Load more" variant="outline" onPress={loadMore} className="mt-2" /> : null
        }
        ItemSeparatorComponent={() => <View className="h-0 w-full max-w-3xl self-center" />}
      />
    </AppScreen>
  );
};
