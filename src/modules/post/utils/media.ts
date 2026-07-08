import { Dimensions } from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width - 32; // Card padding

const MAX_HEIGHT = 650;
const MIN_HEIGHT = 220;

export function getMediaSize(
  width: number | null = null,
  height: number | null = null,
) {
  if (!width || !height) {
    return {
      width: SCREEN_WIDTH,
      height: 350,
    };
  }

  const ratio = width / height;

  let calculatedHeight = SCREEN_WIDTH / ratio;

  calculatedHeight = Math.max(
    MIN_HEIGHT,
    Math.min(MAX_HEIGHT, calculatedHeight),
  );

  return {
    width: SCREEN_WIDTH,
    height: calculatedHeight,
  };
}