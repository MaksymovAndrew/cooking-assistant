// the sizes an install prompt and a launcher ask for
export const APP_ICON_SIZES = [192, 512];

// what iOS asks for on the home screen
export const APPLE_ICON_SIZE = 180;

export const APP_ICON_TYPE = "image/png";

export const appIconPath = (size: number): string => `/icon/${String(size)}`;
