import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

// the recipe list's "no explicit sort" value (falls back to creation_date DESC server-side); the filter badge count and active-filter chips treat any other value as an active filter
export const RECIPE_DEFAULT_SORT_ORDER = "asc";

// text search stays URL-sourced; only the non-text filter fields live in the store
export interface RecipeFiltersState {
    selectedTypes: number[];
    startDate: string;
    endDate: string;
    minCookingTime: string;
    maxCookingTime: string;
    sortOrder: string;
}

export interface MenuFiltersState {
    selectedCategories: number[];
}

interface FiltersState {
    recipe: RecipeFiltersState;
    menu: MenuFiltersState;
}

const initialState: FiltersState = {
    recipe: {
        selectedTypes: [],
        startDate: "",
        endDate: "",
        minCookingTime: "",
        maxCookingTime: "",
        sortOrder: RECIPE_DEFAULT_SORT_ORDER,
    },
    menu: { selectedCategories: [] },
};

const filtersSlice = createSlice({
    name: "filters",
    initialState,
    reducers: {
        setRecipeSelectedTypes: (state, action: PayloadAction<number[]>) => {
            state.recipe.selectedTypes = action.payload;
        },
        setRecipeStartDate: (state, action: PayloadAction<string>) => {
            state.recipe.startDate = action.payload;
        },
        setRecipeEndDate: (state, action: PayloadAction<string>) => {
            state.recipe.endDate = action.payload;
        },
        setRecipeMinCookingTime: (state, action: PayloadAction<string>) => {
            state.recipe.minCookingTime = action.payload;
        },
        setRecipeMaxCookingTime: (state, action: PayloadAction<string>) => {
            state.recipe.maxCookingTime = action.payload;
        },
        setRecipeSortOrder: (state, action: PayloadAction<string>) => {
            state.recipe.sortOrder = action.payload;
        },
        setMenuSelectedCategories: (state, action: PayloadAction<number[]>) => {
            state.menu.selectedCategories = action.payload;
        },
    },
});

export const {
    setRecipeSelectedTypes,
    setRecipeStartDate,
    setRecipeEndDate,
    setRecipeMinCookingTime,
    setRecipeMaxCookingTime,
    setRecipeSortOrder,
    setMenuSelectedCategories,
} = filtersSlice.actions;
export const filtersReducer = filtersSlice.reducer;
