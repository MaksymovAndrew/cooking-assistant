// mirrors what the server accepts; checked here only to answer at once instead of after an upload -
// the server reads the bytes themselves and stays the authority
export const ACCEPTED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
];

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
