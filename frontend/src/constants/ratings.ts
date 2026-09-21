export const RATING_TARGET = {
    recipe: "recipe",
    menu: "menu",
} as const;

export const MAX_RATING = 5;

// every star value, lowest first - the order the stars are drawn in
export const RATING_VALUES = [1, 2, 3, 4, 5] as const;
