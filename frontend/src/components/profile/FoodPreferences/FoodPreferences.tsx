import { ArrowDown, Heart, ListFilter } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { useDietPreferences } from "hooks/useDietPreferences";

import { AvoidPill } from "components/ui/AvoidPill";

import { AvoidAllergensCard } from "./AvoidAllergensCard";
import { AvoidIngredientsCard } from "./AvoidIngredientsCard";
import styles from "./FoodPreferences.module.scss";

const STRIP_ICON_SIZE = 15;

// the viewer's avoid list: allergens and single ingredients, each saved on the tap that changes it
export const FoodPreferences: React.FC = () => {
    const { t } = useTranslation("dietPreferences");
    const preferences = useDietPreferences();
    const isDisabled = !preferences.isReady;

    return (
        <section
            className={styles["food-preferences"]}
            aria-labelledby="food-preferences-title"
        >
            <div className={styles["food-preferences__head"]}>
                <div>
                    <h2
                        id="food-preferences-title"
                        className={styles["food-preferences__title"]}
                    >
                        {t("section.title")}
                    </h2>
                    <p className={styles["food-preferences__description"]}>
                        {t("section.description")}
                    </p>
                </div>
                <span className={styles["food-preferences__summary"]}>
                    {t("section.summary", {
                        allergens: t("section.allergenCount", {
                            count: preferences.allergens.length,
                        }),
                        ingredients: t("section.ingredientCount", {
                            count: preferences.ingredientIds.length,
                        }),
                    })}
                </span>
            </div>

            <div className={styles["food-preferences__grid"]}>
                <AvoidAllergensCard
                    allergens={preferences.allergens}
                    isDisabled={isDisabled}
                    onToggle={preferences.toggleAllergen}
                />
                <AvoidIngredientsCard
                    catalog={preferences.catalog}
                    ingredientIds={preferences.ingredientIds}
                    avoidedIngredients={preferences.avoidedIngredients}
                    isDisabled={isDisabled}
                    isSavedVisible={preferences.isSavedVisible}
                    onToggle={preferences.toggleIngredient}
                />
            </div>

            <ul className={styles["food-preferences__strip"]}>
                <li>
                    <ArrowDown size={STRIP_ICON_SIZE} aria-hidden="true" />
                    {t("behaviour.sorted")}
                    <AvoidPill />
                </li>
                <li>
                    <ListFilter size={STRIP_ICON_SIZE} aria-hidden="true" />
                    {t("behaviour.hideable")}
                </li>
                <li>
                    <Heart size={STRIP_ICON_SIZE} aria-hidden="true" />
                    {t("behaviour.favourites")}
                </li>
            </ul>
        </section>
    );
};
