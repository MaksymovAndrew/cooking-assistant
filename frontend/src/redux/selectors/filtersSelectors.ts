import type { RootState } from "redux/store";

export const selectMenuFilters = (state: RootState) => state.filters.menu;
