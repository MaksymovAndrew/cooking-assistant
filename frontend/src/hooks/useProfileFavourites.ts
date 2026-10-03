import { useMemo } from "react";

import {
    flattenPages,
    getPaginatedTotal,
} from "redux/services/infiniteQueryHelpers";
import { useGetMenusInfiniteQuery } from "redux/services/menusApi";
import { useGetRecipesByFiltersInfiniteQuery } from "redux/services/recipesApi";

// fetched up front: the profile hero shows the combined count whichever tab is open
const FAVOURITES_PARAMS = { favourites: true };

export const useProfileFavourites = () => {
    const recipesQuery = useGetRecipesByFiltersInfiniteQuery(FAVOURITES_PARAMS);
    const menusQuery = useGetMenusInfiniteQuery(FAVOURITES_PARAMS);

    const recipes = useMemo(
        () => flattenPages(recipesQuery.data),
        [recipesQuery.data],
    );
    const menus = useMemo(
        () => flattenPages(menusQuery.data),
        [menusQuery.data],
    );
    const recipesTotal = getPaginatedTotal(recipesQuery.data);
    const menusTotal = getPaginatedTotal(menusQuery.data);

    return {
        queries: [recipesQuery, menusQuery],
        count: recipesTotal + menusTotal,
        recipes: {
            items: recipes,
            total: recipesTotal,
            hasNextPage: recipesQuery.hasNextPage,
            isFetchingNextPage: recipesQuery.isFetchingNextPage,
            fetchNextPage: () => {
                void recipesQuery.fetchNextPage();
            },
        },
        menus: {
            items: menus,
            total: menusTotal,
            hasNextPage: menusQuery.hasNextPage,
            isFetchingNextPage: menusQuery.isFetchingNextPage,
            fetchNextPage: () => {
                void menusQuery.fetchNextPage();
            },
        },
    };
};
