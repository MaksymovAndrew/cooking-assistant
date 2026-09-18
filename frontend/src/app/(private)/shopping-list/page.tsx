"use client";

import { ShoppingCart } from "lucide-react";
import React, { useRef } from "react";
import { useTranslation } from "react-i18next";

import { useFlipAnimation } from "hooks/useFlipAnimation";
import { usePageTitle } from "hooks/usePageTitle";
import { useShoppingList } from "hooks/useShoppingList";

import { AppShell } from "components/layout/AppShell";
import { ShoppingListAddForm } from "components/shopping-list/ShoppingListAddForm";
import { ShoppingListHeader } from "components/shopping-list/ShoppingListHeader";
import { ShoppingListSections } from "components/shopping-list/ShoppingListSections";
import { ShoppingListSkeleton } from "components/shopping-list/ShoppingListSkeleton";
import { EmptyState } from "components/ui/EmptyState";
import { ErrorState } from "components/ui/ErrorState";

import styles from "./page.module.scss";

const ShoppingListPage: React.FC = () => {
    const { t } = useTranslation("shoppingList");
    const list = useShoppingList();
    const hasList = !list.isError && !list.isLoading && !list.isEmpty;
    const layoutRef = useRef<HTMLDivElement>(null);

    useFlipAnimation(layoutRef, list.layoutKey);

    usePageTitle(t("page.heading"));

    const renderStatus = () => {
        if (list.isError) {
            return (
                <ErrorState
                    title={t("page.error")}
                    description={t("page.errorDescription")}
                    onRetry={list.retry}
                    retryLabel={t("page.retry")}
                />
            );
        }

        if (list.isLoading) {
            return <ShoppingListSkeleton />;
        }

        return (
            <div className={styles["shopping-list-page__empty"]}>
                <EmptyState
                    icon={ShoppingCart}
                    title={t("empty.title")}
                    description={t("empty.description")}
                />
            </div>
        );
    };

    return (
        <AppShell>
            <div className={styles["shopping-list-page"]}>
                <ShoppingListHeader
                    counts={
                        hasList
                            ? {
                                  toBuy: list.toBuy.length,
                                  bought: list.bought.length,
                                  total: list.total,
                              }
                            : null
                    }
                />

                <div
                    ref={layoutRef}
                    className={[
                        styles["shopping-list-page__layout"],
                        hasList && styles["shopping-list-page__layout--split"],
                    ]
                        .filter(Boolean)
                        .join(" ")}
                >
                    <div className={styles["shopping-list-page__add"]}>
                        <ShoppingListAddForm
                            onAdd={list.add}
                            isAdding={list.isAdding}
                        />
                    </div>

                    {!hasList && (
                        <div className={styles["shopping-list-page__status"]}>
                            {renderStatus()}
                        </div>
                    )}

                    {hasList && (
                        <ShoppingListSections
                            toBuy={list.toBuy}
                            bought={list.bought}
                            isClearing={list.isClearing}
                            toBuyClassName={
                                styles["shopping-list-page__to-buy"]
                            }
                            boughtClassName={
                                styles["shopping-list-page__bought"]
                            }
                            onToggle={list.toggle}
                            onRemove={list.remove}
                            onMove={list.move}
                            onClearBought={list.clearBought}
                        />
                    )}
                </div>
            </div>
        </AppShell>
    );
};

export default ShoppingListPage;
