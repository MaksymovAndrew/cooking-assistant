import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { useGetMeQuery } from "redux/services/authApi";
import {
    flattenPages,
    getPaginatedTotal,
} from "redux/services/infiniteQueryHelpers";
import {
    useGetMenusByPersonInfiniteQuery,
    useGetMenusInfiniteQuery,
} from "redux/services/menusApi";
import {
    useGetRecipesByFiltersInfiniteQuery,
    useGetRecipesByPersonInfiniteQuery,
} from "redux/services/recipesApi";

import { useCalorieBudget } from "hooks/useCalorieBudget";
import { useLogoutModal } from "hooks/useLogoutModal";

import { roundCalories } from "utils/calories";

export const PROFILE_TAB = {
    recipes: "recipes",
    menus: "menus",
    favourites: "favourites",
    dietary: "dietary",
} as const;

export type ProfileTab = (typeof PROFILE_TAB)[keyof typeof PROFILE_TAB];

const RECIPES_PARAMS = {};
const MENUS_PARAMS = { menu_name: "" };
// the shared browse lists narrowed to the viewer's own favourites - fetched up front, since the
// profile hero shows their combined count whichever tab is open
const FAVOURITES_PARAMS = { favourites: true };

const isProfileTab = (value: string | null): value is ProfileTab =>
    Object.values(PROFILE_TAB).includes(value as ProfileTab);

export const useProfilePage = () => {
    const { data: currentUser } = useGetMeQuery(null);
    const searchParams = useSearchParams();
    // supports deep-linking into a tab (e.g. profileDietaryPath()) - only the initial value is read, clicking a tab does not sync back to the URL
    const [activeTab, setActiveTab] = useState<ProfileTab>(() => {
        const requestedTab = searchParams.get("tab");

        return isProfileTab(requestedTab) ? requestedTab : PROFILE_TAB.recipes;
    });
    const openLogoutModal = useLogoutModal();

    const recipesQuery = useGetRecipesByPersonInfiniteQuery(RECIPES_PARAMS);
    const menusQuery = useGetMenusByPersonInfiniteQuery(MENUS_PARAMS);
    const favouriteRecipesQuery =
        useGetRecipesByFiltersInfiniteQuery(FAVOURITES_PARAMS);
    const favouriteMenusQuery = useGetMenusInfiniteQuery(FAVOURITES_PARAMS);
    const todayBudget = useCalorieBudget();

    const recipes = useMemo(
        () => flattenPages(recipesQuery.data),
        [recipesQuery.data],
    );
    const menus = useMemo(
        () => flattenPages(menusQuery.data),
        [menusQuery.data],
    );
    const favouriteRecipes = useMemo(
        () => flattenPages(favouriteRecipesQuery.data),
        [favouriteRecipesQuery.data],
    );
    const favouriteMenus = useMemo(
        () => flattenPages(favouriteMenusQuery.data),
        [favouriteMenusQuery.data],
    );
    const favouriteRecipesTotal = getPaginatedTotal(favouriteRecipesQuery.data);
    const favouriteMenusTotal = getPaginatedTotal(favouriteMenusQuery.data);

    return {
        currentUser,
        activeTab,
        setActiveTab,
        recipesCount: getPaginatedTotal(recipesQuery.data),
        menusCount: getPaginatedTotal(menusQuery.data),
        favouritesCount: favouriteRecipesTotal + favouriteMenusTotal,
        kcalToday: roundCalories(todayBudget.consumed),
        recipes,
        recipesHasNextPage: recipesQuery.hasNextPage,
        recipesIsFetchingNextPage: recipesQuery.isFetchingNextPage,
        fetchNextRecipesPage: recipesQuery.fetchNextPage,
        menus,
        menusHasNextPage: menusQuery.hasNextPage,
        menusIsFetchingNextPage: menusQuery.isFetchingNextPage,
        fetchNextMenusPage: menusQuery.fetchNextPage,
        favouriteRecipes: {
            items: favouriteRecipes,
            total: favouriteRecipesTotal,
            hasNextPage: favouriteRecipesQuery.hasNextPage,
            isFetchingNextPage: favouriteRecipesQuery.isFetchingNextPage,
            fetchNextPage: () => {
                favouriteRecipesQuery.fetchNextPage().catch(() => undefined);
            },
        },
        favouriteMenus: {
            items: favouriteMenus,
            total: favouriteMenusTotal,
            hasNextPage: favouriteMenusQuery.hasNextPage,
            isFetchingNextPage: favouriteMenusQuery.isFetchingNextPage,
            fetchNextPage: () => {
                favouriteMenusQuery.fetchNextPage().catch(() => undefined);
            },
        },
        openLogoutModal,
    };
};
