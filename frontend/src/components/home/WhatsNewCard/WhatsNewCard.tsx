import { Bell } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { NEWS_ITEMS } from "constants/news";

import { formatNewsDateShort } from "utils/formatNewsDate";
import { getNewsItemText } from "utils/newsItemText";
import { isEntryUnseen } from "utils/newsReadState";

import styles from "./WhatsNewCard.module.scss";

interface WhatsNewCardProps {
    onOpenAll: () => void;
    unseenCount: number;
    lastSeenDate: string;
}

const ICON_SIZE = 17;
const VISIBLE_ITEMS = 3;

// a compact preview of NEWS_ITEMS - clicking it opens the same NewsModal used by the mobile/tablet bell button, with the full list and descriptions
export const WhatsNewCard: React.FC<WhatsNewCardProps> = ({
    onOpenAll,
    unseenCount,
    lastSeenDate,
}) => {
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
                {unseenCount > 0 && (
                    <span className={styles["whats-new-card__badge"]}>
                        {t("newCount", { total: unseenCount })}
                    </span>
                )}
            </div>
            <div className={styles["whats-new-card__list"]}>
                {NEWS_ITEMS.slice(0, VISIBLE_ITEMS).map((entry) => {
                    const { title, description } = getNewsItemText(t, entry);

                    return (
                        <div
                            key={entry.id}
                            className={styles["whats-new-card__item"]}
                        >
                            <span
                                className={[
                                    styles["whats-new-card__dot"],
                                    isEntryUnseen(entry, lastSeenDate) &&
                                        styles["whats-new-card__dot--new"],
                                ]
                                    .filter(Boolean)
                                    .join(" ")}
                                aria-hidden="true"
                            />
                            <div
                                className={styles["whats-new-card__item-body"]}
                            >
                                <div
                                    className={
                                        styles["whats-new-card__item-title"]
                                    }
                                >
                                    {title}
                                </div>
                                <div
                                    className={
                                        styles["whats-new-card__description"]
                                    }
                                >
                                    {description}
                                </div>
                                <div className={styles["whats-new-card__date"]}>
                                    {formatNewsDateShort(entry.date)}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </button>
    );
};
