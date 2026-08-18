import { useEffect } from "react";
import { FlatList, View } from "react-native";

import { AppHeader } from "@/components/layout/AppHeader";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { Card, CardContent } from "@/components/ui/Card";
import { PostSkeletonList } from "@/modules/post/components/PostSkeletonList";
import { PostCard } from "@/modules/post/components/PostCard";
import { useSavedPostsStore } from "@/modules/post/savedPostsStore";
import { Post } from "@/modules/post/types";

export const SavedPostsScreen = () => {
  const savedPosts = useSavedPostsStore((state) => state.savedPosts);
  const isLoading = useSavedPostsStore((state) => state.isLoading);
  const loadSavedPosts = useSavedPostsStore((state) => state.loadSavedPosts);

  useEffect(() => {
    void loadSavedPosts();
  }, [loadSavedPosts]);

  return (
    <AppScreen withHorizontalPadding={false}>
      <AppHeader />
      <FlatList
        data={savedPosts}
        keyExtractor={(item: Post) => item.id}
        renderItem={({ item }) => <PostCard post={item} />}
        ItemSeparatorComponent={() => <View className="h-2 bg-background" />}
        refreshing={isLoading}
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
          isLoading ? (
            <PostSkeletonList />
          ) : (
            <View className="px-4">
              <Card>
                <CardContent className="items-center py-10">
                  <AppText tone="muted" size="sm" className="text-center">
                    Posts you save will show up here.
                  </AppText>
                </CardContent>
              </Card>
            </View>
          )
        }
      />
    </AppScreen>
  );
};
