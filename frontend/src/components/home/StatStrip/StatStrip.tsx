import {
    BookOpen,
    FileText,
    ShoppingBasket,
    TriangleAlert,
} from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { KcalStatCard } from "components/home/KcalStatCard";
import { StatCard } from "components/home/StatCard";

import styles from "./StatStrip.module.scss";

interface StatStripProps {
    recipesCount: number;
    menusCount: number;
    pantryCount: number;
    expiringCount: number;
    kcalToday: number;
    kcalGoal: number | null;
}

export const StatStrip: React.FC<StatStripProps> = ({
    recipesCount,
    menusCount,
    pantryCount,
    expiringCount,
    kcalToday,
    kcalGoal,
}) => {
    const { t } = useTranslation("home");

    return (
        <div className={styles["stat-strip"]}>
            <StatCard
                icon={BookOpen}
                value={recipesCount}
                label={t("stats.recipes")}
            />
            <StatCard
                icon={FileText}
                value={menusCount}
                label={t("stats.menus")}
            />
            <StatCard
                icon={ShoppingBasket}
                value={pantryCount}
                label={t("stats.pantryItems")}
                shortLabel={t("stats.pantryItemsShort")}
            />
            <StatCard
                icon={TriangleAlert}
                value={expiringCount}
                label={t("stats.expiringSoon")}
                shortLabel={t("stats.expiringSoonShort")}
                tone="warning"
            />
            <KcalStatCard consumed={kcalToday} goal={kcalGoal} />
        </div>
    );
};
