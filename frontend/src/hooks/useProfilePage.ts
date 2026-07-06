import { useMemo, useState } from "react";

import { useGetMeQuery } from "redux/services/authApi";
import {
    flattenPages,
    getPaginatedTotal,
} from "redux/services/infiniteQueryHelpers";
import { useGetMenusByPersonInfiniteQuery } from "redux/services/menusApi";
import { useGetRecipesByPersonInfiniteQuery } from "redux/services/recipesApi";

import { useLogoutModal } from "hooks/useLogoutModal";

export const PROFILE_TAB = {
    recipes: "recipes",
    menus: "menus",
    favourites: "favourites",
    dietary: "dietary",
} as const;

export type ProfileTab = (typeof PROFILE_TAB)[keyof typeof PROFILE_TAB];

const RECIPES_PARAMS = { ingredient_name: "" };
const MENUS_PARAMS = { menu_name: "" };

export const useProfilePage = () => {
    const { data: currentUser } = useGetMeQuery(null);
    const [activeTab, setActiveTab] = useState<ProfileTab>(PROFILE_TAB.recipes);
    const openLogoutModal = useLogoutModal();

    const recipesQuery = useGetRecipesByPersonInfiniteQuery(RECIPES_PARAMS);
    const menusQuery = useGetMenusByPersonInfiniteQuery(MENUS_PARAMS);

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
