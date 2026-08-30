export const isValidEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

/** Accepts a bare domain ("startup.com") as well as a full URL — most
 * people type it without the scheme, and that's still a valid link once
 * we prefix it before opening. */
export const isValidUrl = (value: string): boolean => {
  const trimmed = value.trim();
  if (!trimmed) return false;
  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(candidate);
    return url.hostname.includes(".");
  } catch {
    return false;
  }
};

export const isValidLinkedInUrl = (value: string): boolean => isValidUrl(value) && /linkedin\.com/i.test(value);

const VIDEO_FILE_EXTENSIONS = /\.(mp4|mov|m4v|webm)(\?.*)?$/i;

/** The in-app player can only play a direct video file, not a webpage like
 * a YouTube/Vimeo watch link — this only accepts URLs that look like they
 * point straight at an .mp4/.mov/.webm file. */
export const isValidVideoFileUrl = (value: string): boolean => isValidUrl(value) && VIDEO_FILE_EXTENSIONS.test(value.trim());
