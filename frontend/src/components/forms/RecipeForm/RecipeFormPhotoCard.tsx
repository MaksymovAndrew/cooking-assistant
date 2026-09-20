import { ImageOff } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { FormCard } from "components/ui/FormCard";

import styles from "./RecipeForm.module.scss";

const PHOTO_ICON_SIZE = 24;

export const RecipeFormPhotoCard: React.FC = () => {
    const { t } = useTranslation("recipes");

    return (
        <FormCard className={styles["recipe-form__photo-card"]}>
            <span className={styles["recipe-form__photo-icon"]}>
                <ImageOff size={PHOTO_ICON_SIZE} aria-hidden="true" />
            </span>
            <span>
                <span className={styles["recipe-form__photo-title"]}>
                    {t("recipeForm.photoTitle")}
                </span>
                <span className={styles["recipe-form__photo-subtitle"]}>
                    {t("recipeForm.photoComingSoon")}
                </span>
            </span>
        </FormCard>
    );
};
