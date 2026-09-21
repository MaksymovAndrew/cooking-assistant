// the 1.91:1 frame every link preview is cropped to; the server keeps each photo in it too
export const SOCIAL_IMAGE_SIZE = { width: 1200, height: 630 };

// a preview is the same for every visitor, so the record behind it may be an hour stale
export const SOCIAL_IMAGE_REVALIDATE_SECONDS = 3600;
