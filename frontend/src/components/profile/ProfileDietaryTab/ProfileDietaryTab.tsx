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
import { FormCard } from "components/ui/FormCard";

import { roundCalories } from "utils/calories";
import { calorieToneFor } from "utils/computeCalorieSummary";

import { CalorieGoalCard } from "./CalorieGoalCard";
import styles from "./ProfileDietaryTab.module.scss";

interface ProfileDietaryTabProps {
    currentUser?: CurrentUser | null;
}

const EMPTY_ICON_SIZE = 40;

export const ProfileDietaryTab: React.FC<ProfileDietaryTabProps> = ({
    currentUser,
}) => {
    const { t } = useTranslation("calories");
    const budget = useCalorieBudget();
    const [justSaved, setJustSaved] = useState(false);
    const form = useCalorieGoalForm(currentUser, () => {
        setJustSaved(true);
    });
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
        <CalorieGoalCard
            form={form}
            hasGoal={hasGoal}
            justSaved={justSaved}
            onSubmit={submitForm}
        />
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
                    <div className={styles["profile-dietary-tab__empty-intro"]}>
                        <span
                            className={
                                styles["profile-dietary-tab__empty-icon"]
                            }
                        >
                            <Flame size={EMPTY_ICON_SIZE} aria-hidden="true" />
                        </span>
                        <h2
                            className={
                                styles["profile-dietary-tab__empty-title"]
                            }
                        >
                            {t("dietaryTab.emptyTitle")}
                        </h2>
                        <p
                            className={
                                styles["profile-dietary-tab__empty-description"]
                            }
                        >
                            {t("dietaryTab.emptyDescription")}
                        </p>
                    </div>
                    {goalCard}
                </div>
            )}
        </div>
    );
};
