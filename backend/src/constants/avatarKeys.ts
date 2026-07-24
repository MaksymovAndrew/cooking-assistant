// allowed preset avatar keys - the backend's own copy of the list the frontend registry
// (frontend/src/constants/avatars.ts) maps to SVG components. Front and back don't share code,
// so these string literals are duplicated on purpose; the two sets must stay in sync.
export const AVATAR_KEYS = [
    "chef-toque",
    "ramen-bowl",
    "tomato",
    "avocado",
    "fried-egg",
    "chili",
    "mushroom",
    "lemon",
    "sushi",
    "pot",
    "herb",
    "bread",
] as const;

export type AvatarKey = (typeof AVATAR_KEYS)[number];
