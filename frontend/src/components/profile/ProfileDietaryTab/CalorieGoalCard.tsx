import { Flame } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import type { useCalorieGoalForm } from "hooks/useCalorieGoalForm";

import { Button } from "components/ui/Button";
import { FormCard } from "components/ui/FormCard";
import { FormErrorBanner } from "components/ui/FormErrorBanner";
import { FormField } from "components/ui/FormField";
import { NumberInput } from "components/ui/NumberInput";

import styles from "./ProfileDietaryTab.module.scss";

interface CalorieGoalCardProps {
    // owned by ProfileDietaryTab: this card changes place in the tree when the goal
    // loads, so state kept here would be lost together with anything already typed
    form: ReturnType<typeof useCalorieGoalForm>;
    hasGoal: boolean;
    justSaved: boolean;
    onSubmit: () => void;
}

const GOAL_ID = "dietary-calorie-goal";
const ICON_SIZE = 18;

export const CalorieGoalCard: React.FC<CalorieGoalCardProps> = ({
    form,
    hasGoal,
    justSaved,
    onSubmit,
}) => {
    const { t } = useTranslation("calories");

    return (
        <FormCard>
            <div className={styles["profile-dietary-tab__card-heading"]}>
                <Flame size={ICON_SIZE} aria-hidden="true" />
                <h2 className={styles["profile-dietary-tab__card-title"]}>
                    {t("dietaryTab.goalHeading")}
                </h2>
            </div>
            <p className={styles["profile-dietary-tab__helper"]}>
                {hasGoal
                    ? t("dietaryTab.helperPopulated")
                    : t("dietaryTab.helperEmpty")}
            </p>
            <form
                className={styles["profile-dietary-tab__form"]}
                onSubmit={(e) => {
                    e.preventDefault();
                    onSubmit();
                }}
            >
                <div className={styles["profile-dietary-tab__form-fields"]}>
                    <FormField
                        htmlFor={GOAL_ID}
                        label={t("dietaryTab.goalLabel")}
                    >
                        <NumberInput
                            id={GOAL_ID}
                            min={0}
                            placeholder={t("dietaryTab.goalPlaceholder")}
                            value={form.goal}
                            onChange={(e) => {
                                form.setGoal(e.target.value);
                            }}
                        />
                    </FormField>
                </div>
                {form.error && <FormErrorBanner message={form.error} />}
                <div className={styles["profile-dietary-tab__form-footer"]}>
                    <Button type="submit">{t("dietaryTab.saveButton")}</Button>
                    {justSaved && (
                        <span className={styles["profile-dietary-tab__saved"]}>
                            {t("dietaryTab.savedIndicator")}
                        </span>
                    )}
                </div>
            </form>
        </FormCard>
    );
};
