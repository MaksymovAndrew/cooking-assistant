// the two things a visitor can favourite; a constant rather than bare strings so call sites stay
// clear of the literal-string lint rule inside JSX
export const FAVOURITE_TARGET = {
    recipe: "recipe",
    menu: "menu",
} as const;

export type FavouriteTarget =
    (typeof FAVOURITE_TARGET)[keyof typeof FAVOURITE_TARGET];
