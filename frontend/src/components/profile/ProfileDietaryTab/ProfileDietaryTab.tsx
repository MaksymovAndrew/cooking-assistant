import { Flame } from "lucide-react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import type { CurrentUser } from "types/auth";

import { useCalorieBudget } from "hooks/useCalorieBudget";
import { useCalorieGoalForm } from "hooks/useCalorieGoalForm";

import { CalorieHistoryChart } from "components/calories/CalorieHistoryChart";
import { CalorieJournal } from "components/calories/CalorieJournal";
import { CalorieTodayCard } from "components/calories/CalorieTodayCard";
import { CalorieDisclaimer } from "components/recipes/CalorieDisclaimer";
import { Button } from "components/ui/Button";
import { FormCard } from "components/ui/FormCard";
import { FormErrorBanner } from "components/ui/FormErrorBanner";
import { FormField } from "components/ui/FormField";
import { NumberInput } from "components/ui/NumberInput";

import { roundCalories } from "utils/calories";
import { calorieToneFor } from "utils/computeCalorieSummary";

import styles from "./ProfileDietaryTab.module.scss";

interface ProfileDietaryTabProps {
    currentUser?: CurrentUser | null;
}

const GOAL_ID = "dietary-calorie-goal";
const ICON_SIZE = 18;

export const ProfileDietaryTab: React.FC<ProfileDietaryTabProps> = ({
    currentUser,
}) => {
    const { t } = useTranslation("calories");
    const [justSaved, setJustSaved] = useState(false);
    const onGoalSaved = () => {
        setJustSaved(true);
    };
    const form = useCalorieGoalForm(currentUser, onGoalSaved);
    const budget = useCalorieBudget();
    // erases the promise (matches EditProfileModal) so a fire-and-forget submit needs no void/catch
    const submitForm = (): unknown => {
        setJustSaved(false);

        return form.handleSubmit();
    };

    const hasGoal = budget.goal !== null;
    const goal = budget.goal ?? 0;
    const consumed = roundCalories(budget.consumed);
    const remaining = Math.max(roundCalories(budget.remaining ?? 0), 0);
    const over = Math.abs(roundCalories(budget.remaining ?? 0));
    const tone = calorieToneFor(budget);

    const goalCard = (
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
                    submitForm();
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

    return (
        <div className={styles["profile-dietary-tab"]}>
            <CalorieDisclaimer />

            {hasGoal ? (
                <div className={styles["profile-dietary-tab__grid"]}>
                    <div className={styles["profile-dietary-tab__col"]}>
                        <FormCard>
                            <CalorieTodayCard
                                consumed={consumed}
                                goal={goal}
                                remaining={remaining}
                                over={over}
                                isOverLimit={budget.isOverLimit}
                                tone={tone}
                            />
                        </FormCard>
                        <FormCard>
                            <CalorieHistoryChart goal={goal} />
                        </FormCard>
                    </div>
                    <div className={styles["profile-dietary-tab__col"]}>
                        {goalCard}
                        <FormCard>
                            <CalorieJournal entries={budget.entries} />
                        </FormCard>
                    </div>
                </div>
            ) : (
                <div className={styles["profile-dietary-tab__empty"]}>
                    {goalCard}
                </div>
            )}
        </div>
    );
};
