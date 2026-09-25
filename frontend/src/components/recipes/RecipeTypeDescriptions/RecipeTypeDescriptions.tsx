import React from "react";
import { useTranslation } from "react-i18next";

import type { RecipeTypeSummary } from "types/recipeType";

import { recipeTypeDescription, recipeTypeName } from "utils/referenceLabels";

import styles from "./RecipeTypeDescriptions.module.scss";

interface RecipeTypeDescriptionsProps {
    descriptions: RecipeTypeSummary[];
}

export const RecipeTypeDescriptions: React.FC<RecipeTypeDescriptionsProps> = ({
    descriptions,
}) => {
    const { t } = useTranslation();

    if (descriptions.length === 0) {
        return null;
    }

    return (
        <div className={styles["recipe-type-descriptions"]}>
            {descriptions.map((type) => (
                <p key={type.id}>
                    <strong>{recipeTypeName(t, type.type_name)}:</strong>{" "}
                    {recipeTypeDescription(t, type.type_name, type.description)}
                </p>
            ))}
        </div>
    );
};
