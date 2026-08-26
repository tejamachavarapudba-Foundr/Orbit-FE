import { useEffect, useState } from "react";
import { FlatList, View } from "react-native";

import { AppHeader } from "@/components/layout/AppHeader";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { Card, CardContent } from "@/components/ui/Card";
import { CommentsSheet } from "@/modules/comments/components/CommentsSheet";
import { PostSkeletonList } from "@/modules/post/components/PostSkeletonList";
import { PostCard } from "@/modules/post/components/PostCard";
import { useSavedPostsStore } from "@/modules/post/savedPostsStore";
import { Post } from "@/modules/post/types";

export const SavedPostsScreen = () => {
  const savedPosts = useSavedPostsStore((state) => state.savedPosts);
  const isLoading = useSavedPostsStore((state) => state.isLoading);
  const loadSavedPosts = useSavedPostsStore((state) => state.loadSavedPosts);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  useEffect(() => {
    void loadSavedPosts().finally(() => setHasLoadedOnce(true));
  }, [loadSavedPosts]);

  return (
    <AppScreen withHorizontalPadding={false}>
      <AppHeader />
      <FlatList
        data={savedPosts}
        keyExtractor={(item: Post) => item.id}
        renderItem={({ item }) => <PostCard post={item} />}
        ItemSeparatorComponent={() => <View className="h-2 bg-background" />}
        refreshing={hasLoadedOnce && isLoading}
        onRefresh={() => void loadSavedPosts()}
        contentContainerStyle={{ paddingBottom: 32 }}
        ListHeaderComponent={
          <View className="px-4 py-3">
            <AppText family="display" size="2xl" weight="bold">
              Saved
            </AppText>
          </View>
        }
        ListEmptyComponent={
          !hasLoadedOnce || isLoading ? (
            <PostSkeletonList />
          ) : (
            <View className="px-4">
              <Card>
                <CardContent className="items-center py-10">
                  <AppText weight="semibold" className="text-center">
                    No saved posts yet
                  </AppText>
                  <AppText tone="muted" size="sm" className="mt-1 text-center">
                    Tap the bookmark icon on any post to save it here.
                  </AppText>
                </CardContent>
              </Card>
            </View>
          )
        }
      />
      <CommentsSheet />
    </AppScreen>
  );
};
