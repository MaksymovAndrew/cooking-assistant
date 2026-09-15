import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import type { Menu } from "types/menu";
import type { RecipeSearchResultItem } from "types/recipe";

import { ProfileMenusTab } from "components/profile/ProfileMenusTab";
import { ProfileRecipesTab } from "components/profile/ProfileRecipesTab";
import { SegmentedControl } from "components/ui/SegmentedControl";

import styles from "./ProfileFavouritesTab.module.scss";

export interface FavouritesList<Item> {
    items: Item[];
    total: number;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    fetchNextPage: () => void;
}

interface ProfileFavouritesTabProps {
    recipes: FavouritesList<RecipeSearchResultItem>;
    menus: FavouritesList<Menu>;
}

const FAVOURITES_KIND = {
    recipes: "recipes",
    menus: "menus",
} as const;

type FavouritesKind = (typeof FAVOURITES_KIND)[keyof typeof FAVOURITES_KIND];

export const ProfileFavouritesTab: React.FC<ProfileFavouritesTabProps> = ({
    recipes,
    menus,
}) => {
    const { t } = useTranslation("profile");
    const [kind, setKind] = useState<FavouritesKind>(FAVOURITES_KIND.recipes);

    return (
        <div className={styles["profile-favourites-tab"]}>
            <div className={styles["profile-favourites-tab__switch"]}>
                <SegmentedControl
                    label={t("profilePage.favouritesKindLabel")}
                    value={kind}
                    onChange={setKind}
                    options={[
                        {
                            value: FAVOURITES_KIND.recipes,
                            label: t("profilePage.favouriteRecipes"),
                        },
                        {
                            value: FAVOURITES_KIND.menus,
                            label: t("profilePage.favouriteMenus"),
                        },
                    ]}
                />
            </div>
            {kind === FAVOURITES_KIND.recipes ? (
                <ProfileRecipesTab
                    recipes={recipes.items}
                    total={recipes.total}
                    hasNextPage={recipes.hasNextPage}
                    isFetchingNextPage={recipes.isFetchingNextPage}
                    fetchNextPage={recipes.fetchNextPage}
                    emptyTitle={t("profilePage.noFavouriteRecipes")}
                />
            ) : (
                <ProfileMenusTab
                    menus={menus.items}
                    total={menus.total}
                    hasNextPage={menus.hasNextPage}
                    isFetchingNextPage={menus.isFetchingNextPage}
                    fetchNextPage={menus.fetchNextPage}
                    emptyTitle={t("profilePage.noFavouriteMenus")}
                />
            )}
        </div>
    );
};
