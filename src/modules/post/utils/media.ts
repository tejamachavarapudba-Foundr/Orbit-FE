// Widened from Instagram's tight 4:5 portrait clamp — that cropped anything
// taller (e.g. 9:16 reel-style images/screenshots) since the feed card's
// resizeMode is "cover": the box no longer matched the image's own shape,
// so the overflow got cut off. 9:16 (~0.5625) covers that common case; the
// landscape cap stays since wide images were never the complaint.
const MIN_RATIO = 9 / 16;
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
