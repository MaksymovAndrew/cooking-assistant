import { createSelector } from "@reduxjs/toolkit";

import type { MenuWithStats } from "types/menu";

import { menusApi } from "redux/services/menusApi";

import { computeMenuStatistics } from "./computeMenuStatistics";

// no-arg list cache the stats page also subscribes to via the query hook
const selectMenusResult = menusApi.endpoints.getAllMenus.select(null);

const selectAllMenus = createSelector(
    selectMenusResult,
    (result): MenuWithStats[] => result.data ?? [],
);

export const selectMenuStatistics = createSelector(
    selectAllMenus,
    computeMenuStatistics,
);
