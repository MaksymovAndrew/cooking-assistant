import { skipToken } from "@reduxjs/toolkit/query";
import { ChevronRight } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

import { changeMenuPath, ROUTES } from "constants/routes";

import { useAppDispatch } from "redux/hooks";
import { useGetMenuByIdQuery } from "redux/services/menusApi";
import { MODAL_TYPE, openModal } from "redux/slices/uiSlice";

import { AppShell } from "components/layout/AppShell";
import { MenuHero } from "components/menu/MenuHero";
import { MenuMissingIngredientsPanel } from "components/menu/MenuMissingIngredientsPanel";
import { MenuRecipesPanel } from "components/menu/MenuRecipesPanel";
import { ErrorState } from "components/ui/ErrorState";

import { aggregateMissingIngredients } from "utils/menuUtils";

import styles from "./MenuDetailsPage.module.scss";

const MenuDetailsPage: React.FC = () => {
    const { t } = useTranslation("menu");
    const { id } = useParams<{ id: string }>();
    const dispatch = useAppDispatch();
    const {
        data: menu,
        isError,
        refetch,
    } = useGetMenuByIdQuery(id ?? skipToken);

    if (isError) {
        return (
            <AppShell>
                <ErrorState
                    title={t("menuDetailsPage.error", {
                        message: t("menuDetailsPage.errorFetch"),
                    })}
                    onRetry={() => {
                        refetch().catch(() => undefined);
                    }}
                    retryLabel={t("common:errorState.retry")}
                />
            </AppShell>
        );
    }

    if (!menu) {
        return (
            <AppShell>
                <p>{t("menuDetailsPage.loading")}</p>
            </AppShell>
        );
    }

    const totalCookingTime = menu.recipes.reduce(
        (total, recipe) => total + recipe.cooking_time,
        0,
    );
    const missingIngredients = aggregateMissingIngredients(menu.recipes);

    return (
        <AppShell>
            <div className={styles["menu-details-page"]}>
                <nav
                    aria-label={t("menuDetailsPage.breadcrumb")}
                    className={styles["menu-details-page__breadcrumb"]}
                >
                    <Link to={ROUTES.allMenus}>
                        {t("menuDetailsPage.breadcrumbMenus")}
                    </Link>
                    <ChevronRight size={14} aria-hidden="true" />
                    <span>{menu.menu.title}</span>
                </nav>
                <MenuHero
                    menu={menu.menu}
                    totalCookingTime={totalCookingTime}
                    recipeCount={menu.recipes.length}
                    editTo={changeMenuPath(menu.menu.id)}
                    onDelete={() => {
                        dispatch(
                            openModal({
                                type: MODAL_TYPE.deleteMenu,
                                menuId: menu.menu.id,
                            }),
                        );
                    }}
                />
                <div className={styles["menu-details-page__grid"]}>
                    <MenuRecipesPanel
                        recipes={menu.recipes}
                        isOwner={menu.menu.isOwner}
                        addRecipesTo={changeMenuPath(menu.menu.id)}
                    />
                    <MenuMissingIngredientsPanel
                        ingredients={missingIngredients}
                    />
                </div>
            </div>
        </AppShell>
    );
};

export default MenuDetailsPage;
