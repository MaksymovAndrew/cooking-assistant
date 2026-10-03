import { Plus } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { Button } from "components/ui/Button";

import styles from "./IngredientsPageHeader.module.scss";

interface IngredientsPageHeaderProps {
    // null while the pantry is still loading - "0 items" would be a lie until it arrives
    count: number | null;
    onAddIngredient: () => void;
}

const ICON_SIZE = 17;

export const IngredientsPageHeader: React.FC<IngredientsPageHeaderProps> = ({
    count,
    onAddIngredient,
}) => {
    const { t } = useTranslation("ingredients");

    return (
        <div className={styles["ingredients-page-header"]}>
            <div>
                <h1 className={styles["ingredients-page-header__heading"]}>
                    {t("page.heading")}
                </h1>
                <p className={styles["ingredients-page-header__count"]}>
                    {count !== null && t("page.itemCount", { count })}
                </p>
            </div>
            <div className={styles["ingredients-page-header__actions"]}>
                <Button type="button" onClick={onAddIngredient}>
                    <Plus size={ICON_SIZE} aria-hidden="true" />
                    {t("page.addIngredientButton")}
                </Button>
            </div>
        </div>
    );
};
