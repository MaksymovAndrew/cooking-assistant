import React from "react";
import { useTranslation } from "react-i18next";

import { useAppDispatch } from "redux/hooks";
import { MODAL_TYPE, openModal } from "redux/slices/uiSlice";

import { useEmailVerificationNudge } from "hooks/useEmailVerificationNudge";
import { useHomeDashboard } from "hooks/useHomeDashboard";
import { useNewsBadge } from "hooks/useNewsBadge";

import { EmailVerificationBanner } from "components/home/EmailVerificationBanner";
import { ExpiringSoon } from "components/home/ExpiringSoon";
import { GreetingHeader } from "components/home/GreetingHeader";
import { HomeActions } from "components/home/HomeActions";
import { PantryRecipesCard } from "components/home/PantryRecipesCard";
import { RecentRecipes } from "components/home/RecentRecipes";
import { StatStrip } from "components/home/StatStrip";
import { WhatsNewCard } from "components/home/WhatsNewCard";
import { PageSpinner } from "components/layout/PageSpinner";

import styles from "./HomeDashboard.module.scss";

export const HomeDashboard: React.FC = () => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const dashboard = useHomeDashboard();
    const newsBadge = useNewsBadge();
    const emailNudge = useEmailVerificationNudge();

    const openNews = () => {
        newsBadge.markAllSeen();
        dispatch(openModal({ type: MODAL_TYPE.news }));
    };

    if (dashboard.isLoading) {
        return <PageSpinner />;
    }

    if (dashboard.isError) {
        return (
            <div className={styles["home-dashboard__error"]}>
                {t("notifications.somethingWentWrong")}
            </div>
        );
    }

    return (
        <div className={styles["home-dashboard"]}>
            <GreetingHeader />
            {emailNudge.show && (
                <EmailVerificationBanner
                    onSendEmail={emailNudge.sendEmail}
                    isSendDisabled={emailNudge.isSendDisabled}
                    onDismiss={emailNudge.dismiss}
                />
            )}
            <StatStrip
                recipesCount={dashboard.recipesCount}
                menusCount={dashboard.menusCount}
                pantryCount={dashboard.pantryCount}
                expiringCount={dashboard.expiringSoonCount}
                kcalToday={dashboard.kcalToday}
                kcalGoal={dashboard.kcalGoal}
            />
            <div className={styles["home-dashboard__panels"]}>
                <RecentRecipes
                    recipes={dashboard.recentRecipes}
                    calorieGoal={dashboard.kcalGoal}
                    calorieRemaining={dashboard.calorieRemaining}
                />
                <div className={styles["home-dashboard__rail"]}>
                    <PantryRecipesCard />
                    <ExpiringSoon items={dashboard.expiringSoon} />
                    <WhatsNewCard
                        onOpenAll={openNews}
                        unseenCount={newsBadge.unseenCount}
                        lastSeenDate={newsBadge.lastSeenDate}
                    />
                </div>
            </div>
            <HomeActions
                onOpenNews={openNews}
                hasUnseenNews={newsBadge.unseenCount > 0}
            />
        </div>
    );
};
