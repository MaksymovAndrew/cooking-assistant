import React from "react";
import { useTranslation } from "react-i18next";

import { useAppDispatch } from "redux/hooks";
import { MODAL_TYPE, openModal } from "redux/slices/uiSlice";

import { useIngredientCatalog } from "hooks/useIngredientCatalog";
import { usePageTitle } from "hooks/usePageTitle";
import { usePantryFilters } from "hooks/usePantryFilters";

import { AddIngredientModal } from "components/ingredients/AddIngredientModal";
import { IngredientGrid } from "components/ingredients/IngredientGrid";
import { IngredientsPageHeader } from "components/ingredients/IngredientsPageHeader";
import { IngredientsToolbar } from "components/ingredients/IngredientsToolbar";
import { AppShell } from "components/layout/AppShell";

import { resolvePantryIngredientName } from "utils/ingredientName";

import styles from "./IngredientsPage.module.scss";

const IngredientsPage: React.FC = () => {
    const { t } = useTranslation("ingredients");
    const dispatch = useAppDispatch();
    const catalog = useIngredientCatalog();

    usePageTitle(t("heading"));
    const filters = usePantryFilters({
        personIngredients: catalog.personIngredients,
    });

    return (
        <AppShell>
            <div className={styles["ingredients-page"]}>
                <IngredientsPageHeader
                    count={catalog.personIngredients.length}
                    onAddIngredient={catalog.handleOpenAddModal}
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

                <IngredientGrid
                    ingredients={filters.visibleIngredients}
                    emptyMessage={filters.emptyMessage}
                    onOpenHistory={(ingredient) => {
                        dispatch(
                            openModal({
                                type: MODAL_TYPE.ingredientHistory,
                                ingredientId: ingredient.id,
                                ingredientName:
                                    resolvePantryIngredientName(ingredient),
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
            </div>

            {catalog.isAdding && (
                <AddIngredientModal
                    allIngredients={catalog.allIngredients}
                    personIngredients={catalog.personIngredients}
                    selectedIngredients={catalog.selectedIngredients}
                    onToggle={catalog.toggleIngredientSelection}
                    onConfirm={(quantities) => {
                        catalog
                            .handleConfirmAddIngredients(quantities)
                            .catch(() => undefined);
                    }}
                    onClose={catalog.handleCancelAdd}
                />
            )}
        </AppShell>
    );
};

export default IngredientsPage;
