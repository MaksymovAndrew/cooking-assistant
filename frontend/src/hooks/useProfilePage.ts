import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { useGetMeQuery } from "redux/services/authApi";
import {
    flattenPages,
    getPaginatedTotal,
} from "redux/services/infiniteQueryHelpers";
import { useGetMenusByPersonInfiniteQuery } from "redux/services/menusApi";
import { useGetRecipesByPersonInfiniteQuery } from "redux/services/recipesApi";

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

const isProfileTab = (value: string | null): value is ProfileTab =>
    Object.values(PROFILE_TAB).includes(value as ProfileTab);

export const useProfilePage = () => {
    const { data: currentUser } = useGetMeQuery(null);
    const [searchParams] = useSearchParams();
    // supports deep-linking into a tab (e.g. profileDietaryPath()) - only the initial value is read, clicking a tab does not sync back to the URL
    const [activeTab, setActiveTab] = useState<ProfileTab>(() => {
        const requestedTab = searchParams.get("tab");

        return isProfileTab(requestedTab) ? requestedTab : PROFILE_TAB.recipes;
    });
    const openLogoutModal = useLogoutModal();

    const recipesQuery = useGetRecipesByPersonInfiniteQuery(RECIPES_PARAMS);
    const menusQuery = useGetMenusByPersonInfiniteQuery(MENUS_PARAMS);
    const todayBudget = useCalorieBudget();

    const recipes = useMemo(
        () => flattenPages(recipesQuery.data),
        [recipesQuery.data],
    );
    const menus = useMemo(
        () => flattenPages(menusQuery.data),
        [menusQuery.data],
    );

    return {
        currentUser,
        activeTab,
        setActiveTab,
        recipesCount: getPaginatedTotal(recipesQuery.data),
        menusCount: getPaginatedTotal(menusQuery.data),
        kcalToday: roundCalories(todayBudget.consumed),
        recipes,
        recipesHasNextPage: recipesQuery.hasNextPage,
        recipesIsFetchingNextPage: recipesQuery.isFetchingNextPage,
        fetchNextRecipesPage: recipesQuery.fetchNextPage,
        menus,
        menusHasNextPage: menusQuery.hasNextPage,
        menusIsFetchingNextPage: menusQuery.isFetchingNextPage,
        fetchNextMenusPage: menusQuery.fetchNextPage,
        openLogoutModal,
    };
};
