import React from "react";
import { useTranslation } from "react-i18next";

import { useDisclosure } from "hooks/useDisclosure";
import { useHomeDashboard } from "hooks/useHomeDashboard";
import { useNewsBadge } from "hooks/useNewsBadge";

import { ExpiringSoon } from "components/home/ExpiringSoon";
import { GreetingHeader } from "components/home/GreetingHeader";
import { HomeActions } from "components/home/HomeActions";
import { RecentRecipes } from "components/home/RecentRecipes";
import { StatStrip } from "components/home/StatStrip";
import { WhatsNewCard } from "components/home/WhatsNewCard";
import { PageSpinner } from "components/layout/PageSpinner";
import { NewsModal } from "components/modals/NewsModal";

import styles from "./HomeDashboard.module.scss";

export const HomeDashboard: React.FC = () => {
    const { t } = useTranslation();
    const dashboard = useHomeDashboard();
    const news = useDisclosure();
    const newsBadge = useNewsBadge();

    const openNews = () => {
        newsBadge.markAllSeen();
        news.open();
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
            <StatStrip
                recipesCount={dashboard.recipesCount}
                menusCount={dashboard.menusCount}
                pantryCount={dashboard.pantryCount}
                expiringCount={dashboard.expiringSoonCount}
            />
            <div className={styles["home-dashboard__panels"]}>
                <RecentRecipes recipes={dashboard.recentRecipes} />
                <div className={styles["home-dashboard__rail"]}>
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
            <NewsModal isOpen={news.isOpen} onClose={news.close} />
        </div>
    );
};
