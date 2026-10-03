"use client";

import React from "react";
import { useTranslation } from "react-i18next";

import { useAppDispatch } from "redux/hooks";
import { MODAL_TYPE, openModal } from "redux/slices/uiSlice";

import { useIngredientCatalog } from "hooks/useIngredientCatalog";
import { usePageTitle } from "hooks/usePageTitle";
import { usePantryFilters } from "hooks/usePantryFilters";

import { IngredientGrid } from "components/ingredients/IngredientGrid";
import { IngredientsPageHeader } from "components/ingredients/IngredientsPageHeader";
import { IngredientsToolbar } from "components/ingredients/IngredientsToolbar";
import { AppShell } from "components/layout/AppShell";
import { AsyncContent } from "components/ui/AsyncContent";

import { resolvePantryIngredientName } from "utils/ingredientName";

import styles from "./page.module.scss";

const SKELETON_ROWS = 6;

const IngredientsPage: React.FC = () => {
    const { t } = useTranslation("ingredients");
    const dispatch = useAppDispatch();
    const catalog = useIngredientCatalog();
    const isPantryReady = !catalog.isLoading && !catalog.isError;

    usePageTitle(t("heading"));
    const filters = usePantryFilters({
        personIngredients: catalog.personIngredients,
    });

    return (
        <AppShell>
            <div className={styles["ingredients-page"]}>
                <IngredientsPageHeader
                    count={
                        isPantryReady ? catalog.personIngredients.length : null
                    }
                    onAddIngredient={() => {
                        dispatch(openModal({ type: MODAL_TYPE.addIngredient }));
                    }}
                />

                <IngredientsToolbar
                    query={filters.query}
                    onQueryChange={filters.setQuery}
                    expiringSoonCount={filters.expiringSoonCount}
                    expiringSoonOnly={filters.expiringSoonOnly}
                    onToggleExpiringSoon={() => {
                        filters.setExpiringSoonOnly(!filters.expiringSoonOnly);
                    }}
                    categories={filters.categories}
                    categoryFilter={filters.categoryFilter}
                    onCategoryFilterChange={filters.setCategoryFilter}
                />

                <AsyncContent
                    isLoading={catalog.isLoading}
                    isError={catalog.isError}
                    onRetry={catalog.retry}
                    rows={SKELETON_ROWS}
                >
                    <IngredientGrid
                        ingredients={filters.visibleIngredients}
                        emptyMessage={filters.emptyMessage}
                        onOpenHistory={(ingredient) => {
                            dispatch(
                                openModal({
                                    type: MODAL_TYPE.ingredientHistory,
                                    ingredientId: ingredient.id,
                                    ingredientName: resolvePantryIngredientName(
                                        t,
                                        ingredient,
                                    ),
                                }),
                            );
                        }}
                        onRestock={(ingredient) => {
                            dispatch(
                                openModal({
                                    type: MODAL_TYPE.restockIngredient,
                                    ingredient,
                                }),
                            );
                        }}
                        onDelete={(ingredient) => {
                            dispatch(
                                openModal({
                                    type: MODAL_TYPE.deleteIngredient,
                                    ingredient,
                                }),
                            );
                        }}
                    />
                </AsyncContent>
            </div>
        </AppShell>
    );
};

export default IngredientsPage;
