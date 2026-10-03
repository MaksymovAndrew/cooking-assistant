import React from "react";
import { useTranslation } from "react-i18next";

import styles from "./StatsSkeleton.module.scss";

const TILE_KEYS = ["recipes", "time", "type", "calories"];
const CARD_KEYS = ["types", "times"];

export const StatsSkeleton: React.FC = () => {
    const { t } = useTranslation("stats");

    return (
        <div
            role="status"
            aria-label={t("statsPage.loading")}
            className={styles["stats-skeleton"]}
        >
            <span className={styles["stats-skeleton__heading"]} />
            <div className={styles["stats-skeleton__tiles"]}>
                {TILE_KEYS.map((key) => (
                    <span
                        key={key}
                        className={styles["stats-skeleton__tile"]}
                    />
                ))}
            </div>
            <div className={styles["stats-skeleton__cards"]}>
                {CARD_KEYS.map((key) => (
                    <span
                        key={key}
                        className={styles["stats-skeleton__card"]}
                    />
                ))}
            </div>
        </div>
    );
};
