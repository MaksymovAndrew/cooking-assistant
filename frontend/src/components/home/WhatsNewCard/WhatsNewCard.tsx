import { Bell } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { NEW_NEWS_COUNT, NEWS_ITEMS } from "constants/news";

import { formatNewsDateShort } from "utils/formatNewsDate";

import styles from "./WhatsNewCard.module.scss";

interface WhatsNewCardProps {
    onOpenAll: () => void;
}

const ICON_SIZE = 17;
const VISIBLE_ITEMS = 3;

// a compact preview of NEWS_ITEMS - clicking it opens the same NewsModal
// used by the mobile/tablet bell button, with the full list and descriptions
export const WhatsNewCard: React.FC<WhatsNewCardProps> = ({ onOpenAll }) => {
    const { t } = useTranslation("news");

    return (
        <button
            type="button"
            onClick={onOpenAll}
            className={styles["whats-new-card"]}
        >
            <div className={styles["whats-new-card__header"]}>
                <span className={styles["whats-new-card__title"]}>
                    <Bell size={ICON_SIZE} aria-hidden="true" />
                    {t("title")}
                </span>
                {NEW_NEWS_COUNT > 0 && (
                    <span className={styles["whats-new-card__badge"]}>
                        {t("newCount", { total: NEW_NEWS_COUNT })}
                    </span>
                )}
            </div>
            <div className={styles["whats-new-card__list"]}>
                {NEWS_ITEMS.slice(0, VISIBLE_ITEMS).map((entry) => (
                    <div
                        key={entry.id}
                        className={styles["whats-new-card__item"]}
                    >
                        <span
                            className={[
                                styles["whats-new-card__dot"],
                                entry.isNew &&
                                    styles["whats-new-card__dot--new"],
                            ]
                                .filter(Boolean)
                                .join(" ")}
                            aria-hidden="true"
                        />
                        <div className={styles["whats-new-card__item-body"]}>
                            <div
                                className={styles["whats-new-card__item-title"]}
                            >
                                {t(`items.${entry.id}.title`)}
                            </div>
                            <div
                                className={
                                    styles["whats-new-card__description"]
                                }
                            >
                                {t(`items.${entry.id}.description`)}
                            </div>
                            <div className={styles["whats-new-card__date"]}>
                                {formatNewsDateShort(entry.date)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </button>
    );
};
