import { Image, ImageProps } from "expo-image";
import { cssInterop } from "nativewind";

// expo-image isn't one of NativeWind's built-in-patched core components, so
// className is a no-op on it until this runs once — registers className as
// an alias for style, same as every other NativeWind-styled component here.
cssInterop(Image, { className: "style" });

export type AppImageProps = ImageProps & { className?: string };

// Drop-in replacement for RN's <Image> with the same className-based sizing
// call sites already use, but backed by expo-image's disk+memory cache so a
// re-mounted avatar/post/cover image doesn't re-download every time.
export const AppImage = Image;
