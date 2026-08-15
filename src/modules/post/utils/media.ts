import { Dimensions } from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width - 32; // Card padding

// Instagram clamps posts between a portrait max (4:5) and a landscape max (1.91:1).
const MIN_RATIO = 4 / 5;
const MAX_RATIO = 1.91;

export function getMediaSize(
  width: number | null = null,
  height: number | null = null,
) {
  if (!width || !height) {
    return {
      width: SCREEN_WIDTH,
      height: SCREEN_WIDTH / MIN_RATIO,
    };
  }

  const ratio = Math.max(MIN_RATIO, Math.min(MAX_RATIO, width / height));

  return {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH / ratio,
  };
}
