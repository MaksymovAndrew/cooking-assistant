import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { useAppDispatch } from "redux/hooks";
import { MODAL_TYPE, openModal } from "redux/slices/uiSlice";

import { useIngredientCatalog } from "hooks/useIngredientCatalog";

import { AddIngredientModal } from "components/ingredients/AddIngredientModal";
import { IngredientGrid } from "components/ingredients/IngredientGrid";
import { IngredientsPageHeader } from "components/ingredients/IngredientsPageHeader";
import { IngredientsToolbar } from "components/ingredients/IngredientsToolbar";
import { AppShell } from "components/layout/AppShell";

import { getExpiryStatus } from "utils/expiry";

import styles from "./IngredientsPage.module.scss";

const isUrgent = (
    daysToExpire: number | null | undefined,
    purchaseDate: string | undefined,
): boolean => {
    const status = getExpiryStatus(daysToExpire, purchaseDate);

    return status !== null && status.tone !== "ok";
};

const IngredientsPage: React.FC = () => {
    const { t } = useTranslation("ingredients");
    const dispatch = useAppDispatch();
    const catalog = useIngredientCatalog();
    const [query, setQuery] = useState("");
    const [expiringSoonOnly, setExpiringSoonOnly] = useState(false);

    const expiringSoonCount = useMemo(
        () =>
            catalog.personIngredients.filter((ingredient) =>
                isUrgent(ingredient.days_to_expire, ingredient.purchase_date),
            ).length,
        [catalog.personIngredients],
    );

    const visibleIngredients = catalog.personIngredients.filter(
        (ingredient) => {
            const matchesQuery = (ingredient.ingredient_name ?? "")
                .toLowerCase()
                .includes(query.trim().toLowerCase());

            if (!matchesQuery) {
                return false;
            }

            return (
                !expiringSoonOnly ||
                isUrgent(ingredient.days_to_expire, ingredient.purchase_date)
            );
        },
    );

    const emptyMessage =
        catalog.personIngredients.length === 0
            ? t("page.noIngredients")
            : t("page.noSearchResults");

    return (
        <AppShell>
            <div className={styles["ingredients-page"]}>
                <IngredientsPageHeader
                    count={catalog.personIngredients.length}
                    isEditingQuantity={catalog.isEditingQuantity}
                    onToggleQuantityEdit={catalog.handleToggleQuantityEdit}
                    onSaveQuantities={() => {
                        catalog.saveUpdatedQuantities().catch(() => undefined);
                    }}
                    onAddIngredient={() => {
                        catalog.handleSaveOrToggleEdit().catch(() => undefined);
                    }}
                />

                <IngredientsToolbar
                    query={query}
                    onQueryChange={setQuery}
                    expiringSoonCount={expiringSoonCount}
                    expiringSoonOnly={expiringSoonOnly}
                    onToggleExpiringSoon={() => {
                        setExpiringSoonOnly((prev) => !prev);
                    }}
                />

                <IngredientGrid
                    ingredients={visibleIngredients}
                    emptyMessage={emptyMessage}
                    isEditingQuantity={catalog.isEditingQuantity}
                    onQuantityChange={catalog.handleQuantityChange}
                    onOpenHistory={(ingredient) => {
                        dispatch(
                            openModal({
                                type: MODAL_TYPE.ingredientHistory,
                                ingredientId: ingredient.id,
                                ingredientName:
                                    ingredient.ingredient_name ?? "",
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
