// a constant, not bare strings, so JSX call sites stay clear of the literal-string lint rule
export const FAVOURITE_TARGET = {
    recipe: "recipe",
    menu: "menu",
} as const;

export type FavouriteTarget =
    (typeof FAVOURITE_TARGET)[keyof typeof FAVOURITE_TARGET];
