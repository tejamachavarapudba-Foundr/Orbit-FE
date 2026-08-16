// Instagram clamps posts between a portrait max (4:5) and a landscape max (1.91:1).
const MIN_RATIO = 4 / 5;
const MAX_RATIO = 1.91;

/**
 * Returns a clamped aspect ratio (width / height) for post media. Callers
 * should render the media at `width: "100%"` with this as the `aspectRatio`
 * style so it's always correctly sized for whatever container it's actually
 * in — this deliberately avoids computing a pixel width from screen
 * dimensions, since that can't account for the real parent padding/max-width.
 */
export function getMediaAspectRatio(
  width: number | null = null,
  height: number | null = null,
) {
  if (!width || !height) {
    return MIN_RATIO;
  }

  return Math.max(MIN_RATIO, Math.min(MAX_RATIO, width / height));
}
