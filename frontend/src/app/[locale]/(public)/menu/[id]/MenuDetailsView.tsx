"use client";

import { ChevronRight } from "lucide-react";
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
import { Link } from "components/ui/Link";

import { menuCookRequirements } from "utils/cookPreview";
import { menuCaloriesPerPortion } from "utils/menuUtils";

import { MenuDetailsSecondary } from "./MenuDetailsSecondary";
import styles from "./MenuDetailsView.module.scss";

interface MenuDetailsViewProps {
    menu: MenuDetails;
}

// the menu itself arrives from the server render; only what depends on the viewer's own
// browser - their pantry, their calorie budget, the delete modal - lives here
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
    const totalCookingTime = menu.recipes.reduce(
        (total, recipe) => total + recipe.cooking_time,
        0,
    );

    return (
        <AppShell mobileBackTo={ROUTES.allMenus} mobileTitle={menu.menu.title}>
            <div className={styles["menu-details-page"]}>
                <nav
                    aria-label={t("menuDetailsPage.breadcrumb")}
                    className={styles["menu-details-page__breadcrumb"]}
                >
                    <Link href={ROUTES.allMenus}>
                        {t("menuDetailsPage.breadcrumbMenus")}
                    </Link>
                    <ChevronRight size={14} aria-hidden="true" />
                    <span>{menu.menu.title}</span>
                </nav>
                <MenuHero
                    menu={menu.menu}
                    totalCookingTime={totalCookingTime}
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
