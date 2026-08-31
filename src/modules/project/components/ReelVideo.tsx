import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Video, ResizeMode } from "expo-av";

import { useReelVisibilityStore } from "@/modules/project/reelVisibilityStore";

type ReelVideoProps = {
  reelId: string;
  uri: string;
};

// Full-bleed autoplay video for the pitch-reels feed — mirrors
// modules/post/components/PostVideo.tsx's active/inactive play control,
// but reels default to sound ON (a deliberate full-screen watch, unlike a
// social feed scrolled with sound off by default).
export const ReelVideo = ({ reelId, uri }: ReelVideoProps) => {
  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const isActive = useReelVisibilityStore((state) => state.activeReelId === reelId);

  useEffect(() => {
    if (isActive) {
      void videoRef.current?.playAsync();
      setIsPlaying(true);
    } else {
      void videoRef.current?.pauseAsync();
      setIsPlaying(false);
    }
  }, [isActive]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      void videoRef.current?.pauseAsync();
    } else {
      void videoRef.current?.playAsync();
    }
    setIsPlaying((current) => !current);
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    setIsMuted((current) => !current);
  }, []);

  return (
    <Pressable
      onPress={togglePlay}
      accessibilityRole="button"
      accessibilityLabel={isPlaying ? "Pause video" : "Play video"}
      style={{ width: "100%", height: "100%", backgroundColor: "#000" }}
    >
      <Video
        ref={videoRef}
        source={{ uri }}
        resizeMode={ResizeMode.COVER}
        style={{ width: "100%", height: "100%" }}
        shouldPlay={false}
        isLooping
        isMuted={isMuted}
        onPlaybackStatusUpdate={(status) => {
          if (status.isLoaded) {
            setIsPlaying(status.isPlaying);
          }
        }}
      />

      {!isPlaying ? (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: "rgba(0,0,0,0.5)",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Feather name="play" size={28} color="#fff" style={{ marginLeft: 3 }} />
          </View>
        </View>
      ) : null}

      <Pressable
        onPress={toggleMute}
        accessibilityRole="button"
        accessibilityLabel={isMuted ? "Unmute video" : "Mute video"}
        hitSlop={8}
        style={{
          position: "absolute",
          right: 14,
          top: 14,
          width: 34,
          height: 34,
          borderRadius: 17,
          backgroundColor: "rgba(0,0,0,0.35)",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Feather name={isMuted ? "volume-x" : "volume-2"} size={16} color="#fff" />
      </Pressable>
    </Pressable>
  );
};
