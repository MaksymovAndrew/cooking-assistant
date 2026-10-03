import React from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "constants/routes";

import { BarChartMark } from "components/icons";
import { LinkButton } from "components/ui/LinkButton";

import { cx } from "utils/cx";

import styles from "./CookbookStatsBanner.module.scss";

interface CookbookStatsBannerProps {
    className?: string;
}

const ICON_SIZE = 22;

// app-wide stats, not the viewer's own, so they live here rather than on the profile
export const CookbookStatsBanner: React.FC<CookbookStatsBannerProps> = ({
    className,
}) => {
    const { t } = useTranslation("home");

    return (
        <section className={cx(styles["cookbook-stats-banner"], className)}>
            <span className={styles["cookbook-stats-banner__icon"]}>
                <BarChartMark size={ICON_SIZE} aria-hidden="true" />
            </span>
            <div className={styles["cookbook-stats-banner__body"]}>
                <h2 className={styles["cookbook-stats-banner__title"]}>
                    {t("cookbookStats.title")}
                </h2>
                <p className={styles["cookbook-stats-banner__description"]}>
                    {t("cookbookStats.description")}
                </p>
            </div>
            <LinkButton
                href={ROUTES.stats}
                variant="secondary"
                className={styles["cookbook-stats-banner__cta"]}
            >
                {t("cookbookStats.cta")}
            </LinkButton>
        </section>
    );
};
