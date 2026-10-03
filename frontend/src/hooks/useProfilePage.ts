import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { useGetMeQuery } from "redux/services/authApi";
import {
    flattenPages,
    getPaginatedTotal,
} from "redux/services/infiniteQueryHelpers";
import { useGetMenusByPersonInfiniteQuery } from "redux/services/menusApi";
import { useGetRecipesByPersonInfiniteQuery } from "redux/services/recipesApi";

import { useCalorieBudget } from "hooks/useCalorieBudget";
import { useLogoutModal } from "hooks/useLogoutModal";
import { useProfileFavourites } from "hooks/useProfileFavourites";

import { roundCalories } from "utils/calories";
import type { QueryStatusSource } from "utils/queryStatus";
import { combineQueryStatus } from "utils/queryStatus";

export const PROFILE_TAB = {
    recipes: "recipes",
    menus: "menus",
    favourites: "favourites",
    dietary: "dietary",
} as const;

export type ProfileTab = (typeof PROFILE_TAB)[keyof typeof PROFILE_TAB];

const RECIPES_PARAMS = {};
const MENUS_PARAMS = { menu_name: "" };

const isProfileTab = (value: string | null): value is ProfileTab =>
    Object.values(PROFILE_TAB).includes(value as ProfileTab);

export const useProfilePage = () => {
    const { data: currentUser } = useGetMeQuery(null);
    const searchParams = useSearchParams();
    // ?tab= deep-links on first render only; switching tabs does not write back to the URL
    const [activeTab, setActiveTab] = useState<ProfileTab>(() => {
        const requestedTab = searchParams.get("tab");

        return isProfileTab(requestedTab) ? requestedTab : PROFILE_TAB.recipes;
    });
    const openLogoutModal = useLogoutModal();

    const recipesQuery = useGetRecipesByPersonInfiniteQuery(RECIPES_PARAMS);
    const menusQuery = useGetMenusByPersonInfiniteQuery(MENUS_PARAMS);
    const favourites = useProfileFavourites();
    const todayBudget = useCalorieBudget();

    const recipes = useMemo(
        () => flattenPages(recipesQuery.data),
        [recipesQuery.data],
    );
    const menus = useMemo(
        () => flattenPages(menusQuery.data),
        [menusQuery.data],
    );
    // the dietary tab loads its own data
    const tabQueries: Record<ProfileTab, QueryStatusSource[]> = {
        recipes: [recipesQuery],
        menus: [menusQuery],
        favourites: favourites.queries,
        dietary: [],
    };

    return {
        currentUser,
        activeTab,
        setActiveTab,
        tabStatus: combineQueryStatus(tabQueries[activeTab]),
        recipesCount: getPaginatedTotal(recipesQuery.data),
        menusCount: getPaginatedTotal(menusQuery.data),
        favouritesCount: favourites.count,
        kcalToday: roundCalories(todayBudget.consumed),
        recipes,
        recipesHasNextPage: recipesQuery.hasNextPage,
        recipesIsFetchingNextPage: recipesQuery.isFetchingNextPage,
        fetchNextRecipesPage: recipesQuery.fetchNextPage,
        menus,
        menusHasNextPage: menusQuery.hasNextPage,
        menusIsFetchingNextPage: menusQuery.isFetchingNextPage,
        fetchNextMenusPage: menusQuery.fetchNextPage,
        favouriteRecipes: favourites.recipes,
        favouriteMenus: favourites.menus,
        openLogoutModal,
    };
};
