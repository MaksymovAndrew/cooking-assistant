"use client";

import React from "react";
import { useTranslation } from "react-i18next";

import { changeMenuPath, ROUTES } from "constants/routes";
import type { MenuDetails } from "types/menu";

import { useAppDispatch } from "redux/hooks";
import { MODAL_TYPE, openModal } from "redux/slices/uiSlice";

import { useCookedItHandler } from "hooks/useCookedItHandler";
import { useExceedsCalorieBudget } from "hooks/useExceedsCalorieBudget";
import { useLogIntakeHandler } from "hooks/useLogIntakeHandler";
import { useRefreshOnServerData } from "hooks/useRefreshOnServerData";

import { AppShell } from "components/layout/AppShell";
import { MenuHero } from "components/menu/MenuHero";
import { Breadcrumb } from "components/ui/Breadcrumb";

import { menuCookRequirements } from "utils/cookPreview";
import { menuCaloriesPerPortion, menuTotalCookingTime } from "utils/menuUtils";

import { MenuDetailsSecondary } from "./MenuDetailsSecondary";
import styles from "./MenuDetailsView.module.scss";

interface MenuDetailsViewProps {
    menu: MenuDetails;
}

// the menu comes from the server render; only what depends on the viewer lives here
export const MenuDetailsView: React.FC<MenuDetailsViewProps> = ({ menu }) => {
    const { t } = useTranslation("menu");
    const dispatch = useAppDispatch();
    const menuCalories = menuCaloriesPerPortion(menu.recipes);
    const handleLogIntake = useLogIntakeHandler({
        menuId: menu.menu.id,
        title: menu.menu.title,
        caloriesPerPortion: menuCalories,
    });
    const handleCook = useCookedItHandler({
        menuId: menu.menu.id,
        title: menu.menu.title,
        requirements: menuCookRequirements(menu.recipes),
        caloriesPerPortion: menuCalories,
        isSignedIn: menu.menu.isFavourite !== null,
    });
    const exceedsBudget = useExceedsCalorieBudget(menuCalories);

    // the missing-ingredients panel was computed by the server render
    useRefreshOnServerData();

    return (
        <AppShell mobileBackTo={ROUTES.allMenus}>
            <div className={styles["menu-details-page"]}>
                <Breadcrumb
                    label={t("menuDetailsPage.breadcrumb")}
                    parentHref={ROUTES.allMenus}
                    parentLabel={t("menuDetailsPage.breadcrumbMenus")}
                    current={menu.menu.title}
                    desktopOnly
                />
                <MenuHero
                    menu={menu.menu}
                    totalCookingTime={menuTotalCookingTime(menu.recipes)}
                    recipeCount={menu.recipes.length}
                    caloriesPerPortion={menuCalories}
                    exceedsBudget={exceedsBudget}
                />
                <MenuDetailsSecondary
                    menuId={menu.menu.id}
                    title={menu.menu.title}
                    isFavourite={menu.menu.isFavourite}
                    recipes={menu.recipes}
                    allergens={menu.allergens}
                    isOwner={menu.menu.isOwner}
                    addRecipesTo={changeMenuPath(menu.menu.id)}
                    editTo={changeMenuPath(menu.menu.id)}
                    onDelete={() => {
                        dispatch(
                            openModal({
                                type: MODAL_TYPE.deleteMenu,
                                menuId: menu.menu.id,
                                menuTitle: menu.menu.title,
                            }),
                        );
                    }}
                    onLogIntake={handleLogIntake}
                    onCook={handleCook}
                />
            </div>
        </AppShell>
    );
};
