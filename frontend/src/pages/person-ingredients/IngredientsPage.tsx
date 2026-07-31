import React from "react";

import { useAppDispatch } from "redux/hooks";
import { MODAL_TYPE, openModal } from "redux/slices/uiSlice";

import { useIngredientCatalog } from "hooks/useIngredientCatalog";
import { usePantryFilters } from "hooks/usePantryFilters";

import { AddIngredientModal } from "components/ingredients/AddIngredientModal";
import { IngredientGrid } from "components/ingredients/IngredientGrid";
import { IngredientsPageHeader } from "components/ingredients/IngredientsPageHeader";
import { IngredientsToolbar } from "components/ingredients/IngredientsToolbar";
import { AppShell } from "components/layout/AppShell";

import { resolvePantryIngredientName } from "utils/ingredientName";

import styles from "./IngredientsPage.module.scss";

const IngredientsPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const catalog = useIngredientCatalog();
    const filters = usePantryFilters({
        personIngredients: catalog.personIngredients,
        sourceIngredients: catalog.isEditingQuantity
            ? catalog.updatedIngredients
            : catalog.personIngredients,
    });

    return (
        <AppShell>
            <div className={styles["ingredients-page"]}>
                <IngredientsPageHeader
                    count={catalog.personIngredients.length}
                    isEditingQuantity={catalog.isEditingQuantity}
                    onToggleQuantityEdit={catalog.handleToggleQuantityEdit}
                    onAddIngredient={() => {
                        catalog.handleSaveOrToggleEdit().catch(() => undefined);
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

                <IngredientGrid
                    ingredients={filters.visibleIngredients}
                    emptyMessage={filters.emptyMessage}
                    isEditingQuantity={catalog.isEditingQuantity}
                    onQuantityChange={catalog.handleQuantityChange}
                    onSaveQuantity={(id) => {
                        catalog.handleSaveQuantity(id).catch(() => undefined);
                    }}
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

            {catalog.isEditing && (
                <AddIngredientModal
                    allIngredients={catalog.allIngredients}
                    personIngredients={catalog.personIngredients}
                    selectedIngredients={catalog.selectedIngredients}
                    onToggle={catalog.toggleIngredientSelection}
                    onSave={() => {
                        catalog.handleSaveOrToggleEdit().catch(() => undefined);
                    }}
                    onClose={catalog.handleCancelEdit}
                />
            )}
        </AppShell>
    );
};

export default IngredientsPage;
