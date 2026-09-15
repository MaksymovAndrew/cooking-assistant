"use client";

import { ChevronRight } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { changeMenuPath, ROUTES } from "constants/routes";
import type { MenuDetails } from "types/menu";

import { useAppDispatch } from "redux/hooks";
import { MODAL_TYPE, openModal } from "redux/slices/uiSlice";

import { useExceedsCalorieBudget } from "hooks/useExceedsCalorieBudget";
import { useLogIntakeHandler } from "hooks/useLogIntakeHandler";

import { AppShell } from "components/layout/AppShell";
import { MenuHero } from "components/menu/MenuHero";
import { Link } from "components/ui/Link";

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
    // sum of each recipe's own per-portion calories - null recipes contribute nothing, matching the backend's SUM(COALESCE(...)) in findMenuCalories; 0 is falsy, so an empty/zero-calorie menu also reads as "no calorie data" rather than a literal 0
    const menuCalories =
        menu.recipes.reduce(
            (total, recipe) => total + (recipe.calories_per_portion ?? 0),
            0,
        ) || null;
    const handleLogIntake = useLogIntakeHandler({
        menuId: menu.menu.id,
        title: menu.menu.title,
        caloriesPerPortion: menuCalories,
    });
    const exceedsBudget = useExceedsCalorieBudget(menuCalories);
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
                />
            </div>
        </AppShell>
    );
};
