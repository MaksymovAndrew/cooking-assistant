import { ShoppingCart } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { ShoppingListSkeleton } from "components/shopping-list/ShoppingListSkeleton";
import { EmptyState } from "components/ui/EmptyState";
import { ErrorState } from "components/ui/ErrorState";

import styles from "./page.module.scss";

interface ShoppingListStatusProps {
    isError: boolean;
    isLoading: boolean;
    onRetry: () => void;
}

// whatever stands in for the list when there is none to show
export const ShoppingListStatus: React.FC<ShoppingListStatusProps> = ({
    isError,
    isLoading,
    onRetry,
}) => {
    const { t } = useTranslation("shoppingList");

    if (isError) {
        return (
            <ErrorState
                title={t("page.error")}
                description={t("page.errorDescription")}
                onRetry={onRetry}
                retryLabel={t("page.retry")}
            />
        );
    }

    if (isLoading) {
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
