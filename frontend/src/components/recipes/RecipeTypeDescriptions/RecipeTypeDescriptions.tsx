import React from "react";

import type { RecipeTypeSummary } from "types/recipeType";

import styles from "./RecipeTypeDescriptions.module.scss";

interface RecipeTypeDescriptionsProps {
    descriptions: RecipeTypeSummary[];
}

export const RecipeTypeDescriptions: React.FC<RecipeTypeDescriptionsProps> = ({
    descriptions,
}) => {
    if (descriptions.length === 0) {
        return null;
    }

    return (
        <div className={styles["recipe-type-descriptions"]}>
            {descriptions.map((type) => (
                <p key={type.id}>
                    <strong>{type.type_name}:</strong> {type.description}
                </p>
            ))}
        </div>
    );
};
