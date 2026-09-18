import { Ban, Check } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { ALLERGEN_SLUGS, type AllergenSlug } from "constants/allergens";

import { FormCard } from "components/ui/FormCard";

import { resolveAllergen } from "utils/ingredientName";

import styles from "./FoodPreferences.module.scss";

interface AvoidAllergensCardProps {
    allergens: AllergenSlug[];
    isDisabled: boolean;
    onToggle: (slug: AllergenSlug) => void;
}

const TITLE_ICON_SIZE = 18;
const CHECK_ICON_SIZE = 13;

export const AvoidAllergensCard: React.FC<AvoidAllergensCardProps> = ({
    allergens,
    isDisabled,
    onToggle,
}) => {
    const { t } = useTranslation("dietPreferences");

    return (
        <FormCard className={styles["food-preferences__card"]}>
            <div className={styles["food-preferences__card-head"]}>
                <Ban size={TITLE_ICON_SIZE} aria-hidden="true" />
                <h3 className={styles["food-preferences__card-title"]}>
                    {t("allergens.title")}
                </h3>
                <span className={styles["food-preferences__counter"]}>
                    {allergens.length > 0
                        ? t("allergens.count", {
                              count: allergens.length,
                              total: ALLERGEN_SLUGS.length,
                          })
                        : t("allergens.none")}
                </span>
            </div>
            <p className={styles["food-preferences__helper"]}>
                {t("allergens.helper")}
            </p>
            <div className={styles["food-preferences__chips"]}>
                {ALLERGEN_SLUGS.map((slug) => {
                    const isOn = allergens.includes(slug);

                    return (
                        <button
                            key={slug}
                            type="button"
                            role="checkbox"
                            aria-checked={isOn}
                            disabled={isDisabled}
                            onClick={() => {
                                onToggle(slug);
                            }}
                            className={[
                                styles["food-preferences__chip"],
                                isOn && styles["food-preferences__chip--on"],
                            ]
                                .filter(Boolean)
                                .join(" ")}
                        >
                            {isOn && (
                                <Check
                                    size={CHECK_ICON_SIZE}
                                    aria-hidden="true"
                                />
                            )}
                            {resolveAllergen(slug)}
                        </button>
                    );
                })}
            </div>
        </FormCard>
    );
};
