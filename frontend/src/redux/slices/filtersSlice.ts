import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

export interface MenuFiltersState {
    selectedCategories: number[];
}

interface FiltersState {
    menu: MenuFiltersState;
}

const initialState: FiltersState = {
    menu: { selectedCategories: [] },
};

const filtersSlice = createSlice({
    name: "filters",
    initialState,
    reducers: {
        setMenuSelectedCategories: (state, action: PayloadAction<number[]>) => {
            state.menu.selectedCategories = action.payload;
        },
    },
});

export const { setMenuSelectedCategories } = filtersSlice.actions;
export const filtersReducer = filtersSlice.reducer;
